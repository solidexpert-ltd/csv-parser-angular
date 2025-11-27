import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Template } from '../../types';
import { I18nService } from '../../i18n/i18n.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'csv-uploader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content">
      <!-- Drop zone -->
      <div class="upload-wrapper">
        <div 
          class="dropzone"
          [class.drag-active]="isDragActive"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
        >
          @if (isLoading) {
            <p>{{ t('Loading...') }}</p>
          } @else {
            <p>{{ t('Drop your file here') }}</p>
            <p>{{ t('or') }}</p>
            <button 
              type="button" 
              class="browse-btn"
              [class.light]="theme === 'light'"
              (click)="fileInput.click()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"/>
              </svg>
              {{ t('Browse files') }}
            </button>
            <input 
              #fileInput
              type="file" 
              accept=".csv,.tsv,.xls,.xlsx"
              style="display: none"
              (change)="onFileSelected($event)"
            />
          }
        </div>
      </div>

      <!-- Template info -->
      <div class="box">
        <div class="table-container">
          <table class="template-table">
            <thead>
              <tr>
                <th style="width: 65%">{{ t('Expected Column') }}</th>
                <th style="width: 35%; text-align: center">{{ t('Required') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (column of template.columns; track column.key) {
                <tr>
                  <td>
                    <div class="column-info">
                      <span class="column-name">{{ column.name }}</span>
                      @if (column.description) {
                        <span class="column-description">{{ column.description }}</span>
                      }
                    </div>
                  </td>
                  <td style="text-align: center">
                    @if (column.required) {
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="var(--color-primary)" viewBox="0 0 256 256">
                        <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>
                      </svg>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (showDownloadTemplateButton) {
          <button 
            type="button" 
            class="download-btn"
            [class.light]="theme === 'light'"
            (click)="downloadTemplate()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,152v56a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V152a8,8,0,0,1,16,0v56H208V152a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,132.69V40a8,8,0,0,0-16,0v92.69L93.66,106.34a8,8,0,0,0-11.32,11.32Z"/>
            </svg>
            {{ t('Download Template') }}
          </button>
        }
      </div>
    </div>
  `,
  styleUrl: './uploader.component.scss'
})
export class UploaderComponent {
  @Input() template: Template = { columns: [] };
  @Input() skipHeaderRowSelection: boolean = false;
  @Input() showDownloadTemplateButton: boolean = true;
  @Output() success = new EventEmitter<File>();
  @Output() error = new EventEmitter<string>();

  isDragActive = false;
  isLoading = false;

  constructor(
    private i18n: I18nService,
    private themeService: ThemeService
  ) {}

  get theme() {
    return this.themeService.theme;
  }

  t(key: string): string {
    return this.i18n.t(key);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragActive = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragActive = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragActive = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    const validTypes = [
      'text/csv',
      'text/tab-separated-values',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const validExtensions = ['csv', 'tsv', 'xls', 'xlsx'];
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!validExtensions.includes(extension || '')) {
      this.error.emit(this.t('Only CSV, TSV, XLS, and XLSX files can be uploaded'));
      return;
    }

    this.isLoading = true;
    this.success.emit(file);
    this.isLoading = false;
  }

  downloadTemplate(): void {
    const csvData = this.template.columns.map(col => col.name).join(',');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
}

