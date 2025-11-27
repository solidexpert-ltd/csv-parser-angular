import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableRow, TableCell } from '../../types';
import { classes } from '../../utils/utils';

@Component({
  selector: 'csv-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table" [class.zebra]="background === 'zebra'" [class.dark]="background === 'dark'" 
         [class.transparent]="background === 'transparent'" [class.fix-header]="fixHeader" role="table">
      
      @if (heading) {
        <div class="caption">
          <ng-container *ngTemplateOutlet="heading"></ng-container>
        </div>
      } @else if (data.length > 0) {
        <div class="thead" role="rowgroup">
          <div class="tr" role="row">
            @for (key of getVisibleKeys(); track key; let i = $index) {
              <div class="td" role="cell" [style.width]="columnWidths[i] || 'auto'" 
                   [style.text-align]="columnAlignments[i] || 'left'">
                {{ formatHeaderKey(key) }}
              </div>
            }
          </div>
        </div>
      }
      
      <div class="tbody" role="rowgroup">
        @for (row of data; track $index) {
          <div class="tr" role="row" (click)="onRowClicked(row)">
            @for (key of getVisibleKeys(); track key; let i = $index) {
              <div class="td" role="cell" 
                   [style.width]="columnWidths[i] || 'auto'" 
                   [style.text-align]="columnAlignments[i] || 'left'"
                   [title]="getCellTooltip(row[key])">
                <ng-container *ngTemplateOutlet="getCellContent(row[key])"></ng-container>
              </div>
            }
          </div>
        }
      </div>
    </div>
    
    @if (!data || data.length === 0) {
      <div class="empty-msg" role="empty-query">
        @if (emptyState) {
          <ng-container *ngTemplateOutlet="emptyState"></ng-container>
        } @else {
          <p>Empty</p>
        }
      </div>
    }
    
    <ng-template #textContent let-value>
      <span>{{ value }}</span>
    </ng-template>
  `,
  styleUrl: './table.component.scss'
})
export class TableComponent {
  @Input() data: TableRow[] = [];
  @Input() keyAsId: string = 'id';
  @Input() hideColumns: string[] = ['id'];
  @Input() highlightColumns: string[] = [];
  @Input() emptyState?: TemplateRef<unknown>;
  @Input() heading?: TemplateRef<unknown>;
  @Input() background: 'zebra' | 'dark' | 'transparent' = 'zebra';
  @Input() columnWidths: string[] = [];
  @Input() columnAlignments: string[] = [];
  @Input() fixHeader: boolean = false;
  @Output() rowClick = new EventEmitter<TableRow>();

  getVisibleKeys(): string[] {
    if (!this.data || this.data.length === 0) return [];
    const firstRow = this.data[0];
    return Object.keys(firstRow).filter(
      (key) => !this.hideColumns.includes(key) && !key.startsWith('_')
    );
  }

  getRowKey(row: TableRow, index: number): string {
    if (this.keyAsId && row[this.keyAsId]) {
      const keyValue = row[this.keyAsId];
      if (typeof keyValue === 'object' && keyValue !== null && 'raw' in keyValue) {
        return String((keyValue as TableCell).raw || index);
      }
      return String(keyValue);
    }
    return String(index);
  }

  formatHeaderKey(key: string): string {
    if (key.startsWith('_')) return '';
    return key;
  }

  getCellTooltip(cell: TableCell | string | number | boolean | undefined): string {
    if (cell && typeof cell === 'object' && 'tooltip' in cell) {
      return cell.tooltip || '';
    }
    return '';
  }

  getCellContent(cell: TableCell | string | number | boolean | undefined): TemplateRef<unknown> | null {
    return null;
  }

  getCellValue(cell: TableCell | string | number | boolean | undefined): string {
    if (cell === null || cell === undefined) return '';
    if (typeof cell === 'object' && 'content' in cell) {
      return String(cell.content || cell.raw || '');
    }
    return String(cell);
  }

  onRowClicked(row: TableRow): void {
    this.rowClick.emit(row);
  }
}

