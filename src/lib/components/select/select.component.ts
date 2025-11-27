import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputOption } from '../../types';

@Component({
  selector: 'csv-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="select-container" [class.small]="small" [class.disabled]="disabled">
      <div 
        class="select-input" 
        [class.open]="isOpen"
        (click)="toggleOpen()"
        #inputRef
      >
        <span class="value" [class.placeholder]="!selectedKey">
          {{ selectedKey || placeholder }}
        </span>
        <span class="icon dropdown-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
            <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"/>
          </svg>
        </span>
      </div>

      @if (isOpen) {
        <div class="options" [style.top.px]="dropdownPosition.top" [style.left.px]="dropdownPosition.left" 
             [style.width.px]="dropdownPosition.width" #optionsRef>
          <div class="inner">
            @if (placeholder) {
              <button type="button" class="option placeholder" (click)="selectOption('')">
                {{ placeholder }}
              </button>
            }
            @for (key of optionKeys; track key) {
              <button 
                type="button" 
                class="option" 
                [class.selected]="options[key]?.value === value"
                (click)="selectOption(options[key]?.value || '')"
              >
                {{ key }}
                @if (options[key]?.required) {
                  <span class="required-mark">*</span>
                }
                @if (options[key]?.multiple) {
                  <span class="multiple-mark">Multiple</span>
                }
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './select.component.scss'
})
export class SelectComponent {
  @Input() options: Record<string, InputOption> = {};
  @Input() value: string = '';
  @Input() placeholder: string = '';
  @Input() small: boolean = false;
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('inputRef') inputRef!: ElementRef;
  @ViewChild('optionsRef') optionsRef!: ElementRef;

  isOpen: boolean = false;
  dropdownPosition = { top: 0, left: 0, width: 0 };

  get optionKeys(): string[] {
    return Object.keys(this.options);
  }

  get selectedKey(): string {
    return Object.keys(this.options).find(k => this.options[k]?.value === this.value) || '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && 
        !this.inputRef?.nativeElement?.contains(event.target) &&
        !this.optionsRef?.nativeElement?.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggleOpen(): void {
    if (this.disabled) return;
    
    if (!this.isOpen && this.inputRef?.nativeElement) {
      const rect = this.inputRef.nativeElement.getBoundingClientRect();
      this.dropdownPosition = {
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      };
    }
    this.isOpen = !this.isOpen;
  }

  selectOption(optionValue: string): void {
    this.valueChange.emit(optionValue);
    this.isOpen = false;
  }
}

