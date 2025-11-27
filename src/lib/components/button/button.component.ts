import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'csv-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      class="btn"
      [class.primary]="colorScheme === 'primary'"
      [class.secondary]="colorScheme === 'secondary'"
      [class.outline]="variant === 'outline'"
      [class.solid]="variant === 'solid'"
      [class.loading]="isLoading"
      [disabled]="disabled || isLoading"
      (click)="onClick.emit($event)"
    >
      @if (isLoading) {
        <span class="spinner"></span>
      }
      @if (leftIcon) {
        <span class="icon left">
          <ng-container *ngTemplateOutlet="leftIcon"></ng-container>
        </span>
      }
      <ng-content></ng-content>
    </button>
  `,
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() colorScheme: 'primary' | 'secondary' = 'primary';
  @Input() variant: 'solid' | 'outline' = 'solid';
  @Input() disabled: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() leftIcon?: any;
  @Output() onClick = new EventEmitter<MouseEvent>();
}

