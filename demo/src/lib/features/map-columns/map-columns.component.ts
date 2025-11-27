import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileData, Template, TemplateColumn, TemplateColumnMapping, UploadColumn, InputOption } from '../../types';
import { I18nService } from '../../i18n/i18n.service';
import { SelectComponent } from '../../components/select/select.component';
import { CheckboxComponent } from '../../components/checkbox/checkbox.component';
import { stringsSimilarity } from '../../utils/string-similarity';

@Component({
  selector: 'csv-map-columns',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectComponent, CheckboxComponent],
  template: `
    <div class="content">
      <form (ngSubmit)="onSubmit()">
        @if (data.rows.length > 0) {
          <div class="table-wrapper">
            <table class="mapping-table">
              <thead>
                <tr>
                  <th style="width: 20%">{{ t('Your File Column') }}</th>
                  <th style="width: 30%">{{ t('Your Sample Data') }}</th>
                  <th style="width: 30%">{{ t('Destination Column') }}</th>
                  <th style="width: 20%; text-align: center">{{ t('Include') }}</th>
                </tr>
              </thead>
              <tbody>
                @for (column of uploadColumns; track column.index) {
                  <tr>
                    <td>
                      @if (column.name) {
                        <span [title]="column.name">{{ column.name }}</span>
                      } @else {
                        <em class="empty">{{ t('- empty -') }}</em>
                      }
                    </td>
                    <td>
                      <div class="samples">
                        @for (sample of column.sample_data; track $index) {
                          @if (sample) {
                            <small [title]="sample">{{ sample }}</small>
                          }
                        }
                      </div>
                    </td>
                    <td>
                      <csv-select
                        [options]="getFilteredOptions(column.index)"
                        [value]="formValues[column.index]?.key || ''"
                        [placeholder]="t('- Select one -')"
                        [small]="true"
                        (valueChange)="onTemplateChange(column.index, $event)"
                      ></csv-select>
                    </td>
                    <td style="text-align: center">
                      <csv-checkbox
                        [checked]="formValues[column.index]?.include || false"
                        [disabled]="!formValues[column.index]?.key || isSubmitting"
                        (checkedChange)="onIncludeChange(column.index, $event)"
                      ></csv-checkbox>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <p>{{ t('Loading...') }}</p>
        }

        <div class="actions">
          <button 
            type="button" 
            class="btn secondary"
            [disabled]="isSubmitting"
            (click)="cancel.emit()"
          >
            {{ skipHeaderRowSelection ? t('Cancel') : t('Back') }}
          </button>
          
          @if (error) {
            <div class="error-container">
              <div class="error-msg">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"/>
                </svg>
                {{ error }}
              </div>
            </div>
          }

          <button 
            type="submit" 
            class="btn primary"
            [disabled]="isSubmitting"
          >
            @if (isSubmitting) {
              <span class="spinner"></span>
            }
            {{ t('Submit') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrl: './map-columns.component.scss'
})
export class MapColumnsComponent implements OnInit {
  @Input() template: Template = { columns: [] };
  @Input() data: FileData = { fileName: '', rows: [], sheetList: [], errors: [] };
  @Input() columnMapping: Record<number, TemplateColumnMapping> = {};
  @Input() selectedHeaderRow: number = 0;
  @Input() skipHeaderRowSelection: boolean = false;
  @Input() isSubmitting: boolean = false;
  @Output() success = new EventEmitter<Record<number, TemplateColumnMapping>>();
  @Output() cancel = new EventEmitter<void>();

  uploadColumns: UploadColumn[] = [];

  constructor(private i18n: I18nService) {}
  formValues: Record<number, TemplateColumnMapping> = {};
  templateOptions: Record<string, InputOption> = {};
  error: string | null = null;

  ngOnInit(): void {
    this.initializeColumns();
    this.initializeFormValues();
    this.buildTemplateOptions();
  }

  t(key: string): string {
    return this.i18n.t(key);
  }

  private initializeColumns(): void {
    const headerRowIndex = this.selectedHeaderRow || 0;
    const sampleDataRows = this.data.rows.slice(headerRowIndex + 1, headerRowIndex + 4);

    this.uploadColumns = this.data.rows[headerRowIndex]?.values.map((cell, index) => ({
      index,
      name: cell,
      sample_data: sampleDataRows.map(row => row.values[index] || '')
    })) || [];
  }

  private initializeFormValues(): void {
    const usedTemplateColumns = new Set<string>();

    this.formValues = this.uploadColumns.reduce((acc, uc) => {
      // Check for suggested mappings
      const matchedSuggested = this.template.columns.find(tc => 
        this.isSuggestedMapping(tc, uc.name)
      );

      if (matchedSuggested) {
        if (!matchedSuggested.multiple) {
          usedTemplateColumns.add(matchedSuggested.key);
        }
        acc[uc.index] = { 
          key: matchedSuggested.key, 
          include: true, 
          isMultiple: matchedSuggested.multiple 
        };
        return acc;
      }

      // Check for similar column names
      const similarColumn = this.template.columns.find(tc => {
        if (tc.key && (!usedTemplateColumns.has(tc.key) || tc.multiple) && this.checkSimilarity(tc.key, uc.name)) {
          if (!tc.multiple) {
            usedTemplateColumns.add(tc.key);
          }
          return true;
        }
        return false;
      });

      acc[uc.index] = {
        key: similarColumn?.key || '',
        include: !!similarColumn?.key,
        selected: !!similarColumn?.key,
        isMultiple: similarColumn?.multiple
      };
      return acc;
    }, {} as Record<number, TemplateColumnMapping>);
  }

  private buildTemplateOptions(): void {
    this.templateOptions = this.template.columns.reduce((acc, tc) => ({
      ...acc,
      [tc.name]: { value: tc.key, required: tc.required, multiple: tc.multiple }
    }), {});
  }

  private checkSimilarity(templateColumnKey: string, uploadColumnName: string): boolean {
    const templateColumnKeyFormatted = templateColumnKey.replace(/_/g, ' ');
    return stringsSimilarity(templateColumnKeyFormatted, uploadColumnName.toLowerCase()) > 0.9;
  }

  private isSuggestedMapping(templateColumn: TemplateColumn, uploadColumnName: string): boolean {
    if (!templateColumn?.suggested_mappings) {
      return false;
    }
    return templateColumn.suggested_mappings.some(
      suggestion => suggestion.toLowerCase() === uploadColumnName.toLowerCase()
    );
  }

  getFilteredOptions(uploadColumnIndex: number): Record<string, InputOption> {
    const currentValue = this.formValues[uploadColumnIndex]?.key;
    const filtered: Record<string, InputOption> = {};

    for (const key in this.templateOptions) {
      const option = this.templateOptions[key];
      const isSelected = Object.values(this.formValues).some(
        v => v.key === option?.value && v.selected && option.value !== currentValue
      );
      
      if (!isSelected || option?.multiple) {
        filtered[key] = option;
      }
    }

    return filtered;
  }

  onTemplateChange(uploadColumnIndex: number, key: string): void {
    const selectedColumn = this.template.columns.find(tc => tc.key === key);
    this.formValues[uploadColumnIndex] = {
      ...this.formValues[uploadColumnIndex],
      key,
      include: !!key,
      selected: !!key,
      isMultiple: selectedColumn?.multiple
    };
  }

  onIncludeChange(uploadColumnIndex: number, include: boolean): void {
    this.formValues[uploadColumnIndex] = {
      ...this.formValues[uploadColumnIndex],
      include: !!this.formValues[uploadColumnIndex]?.key && include
    };
  }

  private verifyRequiredColumns(): boolean {
    const requiredColumns = this.template.columns.filter(col => col.required);
    const includedValues = Object.values(this.formValues).filter(v => v.include);
    return requiredColumns.every(reqCol => 
      includedValues.some(incVal => incVal.key === reqCol.key)
    );
  }

  onSubmit(): void {
    this.error = null;

    if (!this.verifyRequiredColumns()) {
      this.error = this.t('Please include all required columns');
      return;
    }

    const columns = Object.entries(this.formValues).reduce((acc, [index, mapping]) => {
      if (mapping.include) {
        acc[Number(index)] = mapping;
      }
      return acc;
    }, {} as Record<number, TemplateColumnMapping>);

    this.success.emit(columns);
  }
}

