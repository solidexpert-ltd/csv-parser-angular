import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

import { Template, FileData, FileRow, TemplateColumnMapping, ImportResult, StepConfig, StepEnum, MappedRow, CSVImporterConfig } from '../types';
import { I18nService } from '../i18n/i18n.service';
import { ThemeService } from '../services/theme.service';
import { convertRawTemplate } from '../utils/template';
import { isValidColor, darkenColor, parseObjectOrStringJSON } from '../utils/utils';

import { StepperComponent } from '../components/stepper/stepper.component';
import { ErrorsComponent } from '../components/errors/errors.component';
import { UploaderComponent } from '../features/uploader/uploader.component';
import { RowSelectionComponent } from '../features/row-selection/row-selection.component';
import { MapColumnsComponent } from '../features/map-columns/map-columns.component';
import { CompleteComponent } from '../features/complete/complete.component';

@Component({
  selector: 'csv-importer',
  standalone: true,
  imports: [
    CommonModule,
    StepperComponent,
    ErrorsComponent,
    UploaderComponent,
    RowSelectionComponent,
    MapColumnsComponent,
    CompleteComponent
  ],
  template: `
    @if (isModal) {
      <div class="csvImporter">
        <dialog 
          #dialogRef
          class="csv-importer"
          [class.CSVImporter-dark]="darkMode"
          [class.CSVImporter-light]="!darkMode"
          [attr.data-theme]="darkMode ? 'dark' : 'light'"
          (click)="onBackdropClick($event)"
        >
          <ng-container *ngTemplateOutlet="importerContent"></ng-container>
        </dialog>
      </div>
    } @else {
      <div 
        class="csv-importer"
        [class.CSVImporter-dark]="darkMode"
        [class.CSVImporter-light]="!darkMode"
        [attr.data-theme]="darkMode ? 'dark' : 'light'"
      >
        <ng-container *ngTemplateOutlet="importerContent"></ng-container>
      </div>
    }

    <ng-template #importerContent>
      @if (initializationError) {
        <div class="wrapper">
          <csv-errors [error]="initializationError" [centered]="true"></csv-errors>
        </div>
      } @else {
        <div class="wrapper">
          <div class="stepper-container">
            <csv-stepper 
              [steps]="stepperSteps" 
              [current]="currentStep"
              [skipHeader]="skipHeaderRowSelection"
            ></csv-stepper>
          </div>

          <div class="content">
            @switch (currentStep) {
              @case (StepEnum.Upload) {
                <csv-uploader
                  [template]="parsedTemplate"
                  [skipHeaderRowSelection]="skipHeaderRowSelection"
                  [showDownloadTemplateButton]="showDownloadTemplateButton"
                  (success)="onFileUploaded($event)"
                  (error)="onDataError($event)"
                ></csv-uploader>
              }
              @case (StepEnum.RowSelection) {
                <csv-row-selection
                  [data]="data"
                  [selectedHeaderRow]="selectedHeaderRow"
                  (selectedHeaderRowChange)="selectedHeaderRow = $event"
                  (success)="goNext()"
                  (cancel)="reload()"
                ></csv-row-selection>
              }
              @case (StepEnum.MapColumns) {
                <csv-map-columns
                  [template]="parsedTemplate"
                  [data]="data"
                  [columnMapping]="columnMapping"
                  [selectedHeaderRow]="selectedHeaderRow"
                  [skipHeaderRowSelection]="skipHeaderRowSelection"
                  [isSubmitting]="isSubmitting"
                  (success)="onMappingComplete($event)"
                  (cancel)="onMapColumnsCancel()"
                ></csv-map-columns>
              }
              @case (StepEnum.Complete) {
                <csv-complete
                  [isModal]="isModal"
                  (reload)="reload()"
                  (close)="requestClose()"
                ></csv-complete>
              }
            }
          </div>

          @if (dataError) {
            <div class="status">
              <csv-errors [error]="dataError" [centered]="true"></csv-errors>
            </div>
          }

          @if (isModal) {
            <button type="button" class="close-btn" (click)="requestClose()">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/>
              </svg>
            </button>
          }
        </div>
      }
    </ng-template>
  `,
  styleUrl: './csv-importer.component.scss'
})
export class CsvImporterComponent implements OnInit, OnChanges {
  @Input() isModal: boolean = true;
  @Input() modalIsOpen: boolean = true;
  @Input() modalCloseOnOutsideClick: boolean = false;
  @Input() template?: Template | string;
  @Input() darkMode: boolean = false;
  @Input() primaryColor: string = '#7a5ef8';
  @Input() className?: string;
  @Input() showDownloadTemplateButton: boolean = true;
  @Input() skipHeaderRowSelection: boolean = false;
  @Input() language: string = 'en';
  @Input() customTranslations?: Record<string, Record<string, string>>;
  @Input() customStyles?: Record<string, string> | string;

  @Output() complete = new EventEmitter<ImportResult>();
  @Output() modalClose = new EventEmitter<void>();

  @ViewChild('dialogRef') dialogRef?: ElementRef<HTMLDialogElement>;

  StepEnum = StepEnum;

  constructor(
    private i18n: I18nService,
    private themeService: ThemeService
  ) {}

  // State
  currentStep = StepEnum.Upload;
  initializationError: string | null = null;
  dataError: string | null = null;
  isSubmitting = false;

  // Data
  parsedTemplate: Template = { columns: [] };
  data: FileData = { fileName: '', rows: [], sheetList: [], errors: [] };
  selectedHeaderRow = 0;
  columnMapping: Record<number, TemplateColumnMapping> = {};

  // Stepper
  stepperSteps: StepConfig[] = [];

  ngOnInit(): void {
    this.initializeLanguage();
    this.initializeTheme();
    this.initializeTemplate();
    this.initializeSteps();
    this.applyPrimaryColor();
    this.applyCustomStyles();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['language'] && !changes['language'].firstChange) {
      this.i18n.setLanguage(this.language);
      this.initializeSteps();
    }

    if (changes['darkMode'] && !changes['darkMode'].firstChange) {
      this.initializeTheme();
    }

    if (changes['primaryColor'] && !changes['primaryColor'].firstChange) {
      this.applyPrimaryColor();
    }

    if (changes['modalIsOpen'] && this.isModal && this.dialogRef) {
      if (this.modalIsOpen) {
        this.dialogRef.nativeElement.showModal();
      } else {
        this.dialogRef.nativeElement.close();
      }
    }

    if (changes['customTranslations'] && this.customTranslations) {
      Object.keys(this.customTranslations).forEach(lang => {
        this.i18n.addTranslations(lang, this.customTranslations![lang]);
      });
    }
  }

  ngAfterViewInit(): void {
    if (this.isModal && this.modalIsOpen && this.dialogRef) {
      this.dialogRef.nativeElement.showModal();
    }
  }

  private initializeLanguage(): void {
    this.i18n.setLanguage(this.language);
    if (this.customTranslations) {
      Object.keys(this.customTranslations).forEach(lang => {
        this.i18n.addTranslations(lang, this.customTranslations![lang]);
      });
    }
  }

  private initializeTheme(): void {
    this.themeService.setTheme(this.darkMode ? 'dark' : 'light');
  }

  private initializeTemplate(): void {
    // If template is already a Template object, use it directly
    if (this.template && typeof this.template === 'object' && 'columns' in this.template) {
      this.parsedTemplate = this.template as Template;
      return;
    }
    // Otherwise parse it as JSON string or Record
    const [parsed, error] = convertRawTemplate(this.template as Record<string, unknown> | string | undefined);
    if (error) {
      this.initializationError = error;
    } else if (parsed) {
      this.parsedTemplate = parsed;
    }
  }

  private initializeSteps(): void {
    this.stepperSteps = [
      { label: this.i18n.t('Upload'), id: 'upload' },
      { label: this.i18n.t('Select Header'), id: 'row-selection', disabled: this.skipHeaderRowSelection },
      { label: this.i18n.t('Map Columns'), id: 'map-columns' }
    ];
  }

  private applyPrimaryColor(): void {
    if (this.primaryColor && isValidColor(this.primaryColor)) {
      document.documentElement.style.setProperty('--color-primary', this.primaryColor);
      document.documentElement.style.setProperty('--color-primary-hover', darkenColor(this.primaryColor, 20));
    }
  }

  private applyCustomStyles(): void {
    const styles = parseObjectOrStringJSON('customStyles', this.customStyles);
    if (styles) {
      try {
        const parsed = JSON.parse(styles);
        Object.keys(parsed).forEach(key => {
          document.documentElement.style.setProperty(key, parsed[key]);
        });
      } catch {
        // Ignore parsing errors
      }
    }
  }

  private calculateNextStep(nextStep: number): number {
    if (this.skipHeaderRowSelection) {
      if (nextStep === StepEnum.Upload || nextStep === StepEnum.RowSelection) {
        return StepEnum.MapColumns;
      }
      if (nextStep === StepEnum.MapColumns) {
        return StepEnum.Complete;
      }
    }
    return nextStep;
  }

  goNext(): void {
    const nextStep = this.calculateNextStep(this.currentStep + 1);
    this.currentStep = nextStep;
  }

  goBack(): void {
    this.currentStep = this.currentStep - 1 || 0;
  }

  reload(): void {
    this.data = { fileName: '', rows: [], sheetList: [], errors: [] };
    this.selectedHeaderRow = 0;
    this.columnMapping = {};
    this.dataError = null;
    this.currentStep = StepEnum.Upload;
  }

  requestClose(): void {
    if (!this.isModal) return;
    this.modalClose.emit();
    if (this.currentStep === StepEnum.Complete) {
      this.reload();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.modalCloseOnOutsideClick && event.target === this.dialogRef?.nativeElement) {
      this.requestClose();
    }
  }

  onDataError(error: string): void {
    this.dataError = error;
  }

  onFileUploaded(file: File): void {
    this.dataError = null;
    const fileType = file.name.slice(file.name.lastIndexOf('.') + 1).toLowerCase();

    if (!['csv', 'tsv', 'xls', 'xlsx'].includes(fileType)) {
      this.dataError = this.i18n.t('Only CSV, TSV, XLS, and XLSX files can be uploaded');
      return;
    }

    const reader = new FileReader();
    const isNotBlankRow = (row: string[]) => row.some(cell => cell?.toString().trim() !== '');

    reader.onload = (e) => {
      const bstr = e.target?.result;
      if (!bstr) return;

      switch (fileType) {
        case 'csv':
        case 'tsv':
          Papa.parse(bstr.toString(), {
            complete: (results: Papa.ParseResult<string[]>) => {
              const csvData = results.data as string[][];
              const rows: FileRow[] = csvData
                .filter(isNotBlankRow)
                .map((row, index) => ({ index, values: row }));
              
              this.data = {
                fileName: file.name,
                rows,
                sheetList: [],
                errors: results.errors.map((parseError: Papa.ParseError) => parseError.message)
              };
              this.goNext();
            }
          });
          break;

        case 'xlsx':
        case 'xls':
          const workbook = XLSX.read(bstr as string, { type: 'binary' });
          const sheetList = workbook.SheetNames;
          const xlsxData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetList[0]], { header: 1 }) as string[][];
          const rows: FileRow[] = xlsxData
            .filter(isNotBlankRow)
            .map((row, index) => ({ index, values: row }));
          
          this.data = {
            fileName: file.name,
            rows,
            sheetList,
            errors: []
          };
          this.goNext();
          break;
      }
    };

    switch (fileType) {
      case 'csv':
      case 'tsv':
        reader.readAsText(file, 'utf-8');
        break;
      case 'xlsx':
      case 'xls':
        reader.readAsBinaryString(file);
        break;
    }
  }

  onMapColumnsCancel(): void {
    if (this.skipHeaderRowSelection) {
      this.reload();
    } else {
      this.currentStep = StepEnum.RowSelection;
    }
  }

  onMappingComplete(mapping: Record<number, TemplateColumnMapping>): void {
    this.isSubmitting = true;
    this.columnMapping = mapping;

    const startIndex = (this.selectedHeaderRow || 0) + 1;

    // Default combiner for multiple column values
    const defaultCombiner = (values: string[]) => {
      return values
        .filter(v => v != null)
        .map(v => String(v))
        .filter(v => v.trim())
        .join(' ');
    };

    const mappedRows: MappedRow[] = [];
    this.data.rows.slice(startIndex).forEach((row: FileRow) => {
      const resultingRow: MappedRow = {
        index: row.index - startIndex,
        values: {}
      };

      // First pass: collect all values for each template key
      const templateValues: Record<string, string[]> = {};
      row.values.forEach((value: string, valueIndex: number) => {
        const colMapping = mapping[valueIndex];
        if (colMapping && colMapping.include) {
          if (!templateValues[colMapping.key]) {
            templateValues[colMapping.key] = [];
          }
          templateValues[colMapping.key].push(value);
        }
      });

      // Second pass: apply combiners and set final values
      Object.entries(templateValues).forEach(([templateKey, values]) => {
        const templateColumn = this.parsedTemplate.columns.find(tc => tc.key === templateKey);
        const combiner = templateColumn?.combiner || defaultCombiner;
        resultingRow.values[templateKey] = combiner(values);
      });

      mappedRows.push(resultingRow);
    });

    const includedColumns = Object.values(mapping).filter(({ include }) => include);
    const uniqueTemplateKeys = Array.from(new Set(includedColumns.map(({ key }) => key)));
    const uniqueColumns = uniqueTemplateKeys.map(key => ({ key, name: key }));

    const result: ImportResult = {
      num_rows: mappedRows.length,
      num_columns: uniqueColumns.length,
      error: null,
      columns: uniqueColumns,
      rows: mappedRows
    };

    this.complete.emit(result);
    this.isSubmitting = false;
    this.goNext();
  }
}

