import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileData } from '../../types';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'csv-row-selection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="content">
      <form (ngSubmit)="onSubmit()">
        @if (data.rows.length > 0) {
          @if (hasMultipleExcelSheets) {
            <div class="alert info">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm-4,48a12,12,0,1,1-12,12A12,12,0,0,1,124,72Zm12,112a16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40a8,8,0,0,1,0,16Z"/>
              </svg>
              <span>{{ getMultiSheetWarning() }}</span>
            </div>
          }

          <div class="table-wrapper">
            <div class="heading-caption">
              <span>{{ t('Select Header Row') }}</span>
              <span class="tooltip-icon" [title]="t('Select the row which contains the column headers')">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"/>
                </svg>
              </span>
            </div>
            <div class="table-scroll">
              <table class="data-table">
                <tbody>
                  @for (row of displayedRows; track row.index; let i = $index) {
                    <tr 
                      [class.selected]="selectedHeaderRow === row.index"
                      (click)="selectRow(row.index)"
                    >
                      @for (value of getRowValues(row); let j = $index; track j) {
                        <td [style.width]="getColumnWidth()">
                          @if (j === 0) {
                            <span class="radio-cell">
                              <input 
                                type="radio" 
                                name="headerRow"
                                [value]="row.index"
                                [checked]="selectedHeaderRow === row.index"
                                (change)="selectRow(row.index)"
                              />
                              <span [title]="value">{{ value }}</span>
                            </span>
                          } @else {
                            <span [title]="value">{{ value }}</span>
                          }
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        } @else {
          <p>{{ t('Loading...') }}</p>
        }

        <div class="actions">
          <button 
            type="button" 
            class="btn secondary"
            [disabled]="isLoading"
            (click)="cancel.emit()"
          >
            {{ t('Cancel') }}
          </button>
          <button 
            type="submit" 
            class="btn primary"
            [disabled]="isLoading"
          >
            @if (isLoading) {
              <span class="spinner"></span>
            }
            {{ t('Continue') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrl: './row-selection.component.scss'
})
export class RowSelectionComponent {
  @Input() data: FileData = { fileName: '', rows: [], sheetList: [], errors: [] };
  @Input() selectedHeaderRow: number = 0;
  @Output() selectedHeaderRowChange = new EventEmitter<number>();
  @Output() success = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  isLoading = false;

  constructor(private i18n: I18nService) {}
  private rowLimit = 50;
  private maxColumns = 7;

  get displayedRows() {
    return this.data.rows.slice(0, this.rowLimit);
  }

  get hasMultipleExcelSheets(): boolean {
    return (this.data.sheetList?.length ?? 0) > 1;
  }

  t(key: string): string {
    return this.i18n.t(key);
  }

  getMultiSheetWarning(): string {
    return this.i18n.t('Only the first sheet will be imported', { sheet: this.data.sheetList[0] || '' });
  }

  getRowValues(row: { index: number; values: string[] }): string[] {
    return row.values.slice(0, this.maxColumns);
  }

  getColumnWidth(): string {
    const numColumns = Math.min(this.data.rows[0]?.values.length || 1, this.maxColumns);
    return `${100 / numColumns}%`;
  }

  selectRow(index: number): void {
    this.selectedHeaderRowChange.emit(index);
  }

  onSubmit(): void {
    this.isLoading = true;
    this.success.emit();
    this.isLoading = false;
  }
}

