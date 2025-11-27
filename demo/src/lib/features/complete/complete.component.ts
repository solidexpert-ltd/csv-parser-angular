import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'csv-complete',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content">
      <span class="icon success">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256">
          <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>
        </svg>
      </span>
      <div class="message">{{ t('Import Successful') }}</div>
      <div class="actions">
        <button type="button" class="btn secondary" (click)="reload.emit()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
            <path d="M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a79.52,79.52,0,0,1-55.89,22.77h-.45a79.56,79.56,0,0,1-56.13-23.43L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z"/>
          </svg>
          {{ t('Upload another file') }}
        </button>
        @if (isModal) {
          <button type="button" class="btn primary" (click)="close.emit()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
              <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>
            </svg>
            {{ t('Done') }}
          </button>
        }
      </div>
    </div>
  `,
  styleUrl: './complete.component.scss'
})
export class CompleteComponent {
  @Input() isModal: boolean = true;
  @Output() reload = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  constructor(private i18n: I18nService) {}

  t(key: string): string {
    return this.i18n.t(key);
  }
}

