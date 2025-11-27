import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepConfig } from '../../types';

@Component({
  selector: 'csv-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stepper">
      @for (step of steps; track step.id; let i = $index) {
        @if (!step.disabled) {
          @if (clickable) {
            <button
              type="button"
              class="step"
              [class.active]="i === current"
              [class.done]="i < current"
              [class.step-wide]="steps.length < 4"
              (click)="onStepClick(i)"
            >
              <div class="badge">
                @if (i < current) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>
                  </svg>
                } @else {
                  {{ getDisplayNumber(i) }}
                }
              </div>
              <div class="label">{{ step.label }}</div>
            </button>
          } @else {
            <div
              class="step"
              [class.active]="i === current"
              [class.done]="i < current"
              [class.step-wide]="steps.length < 4"
            >
              <div class="badge">
                @if (i < current) {
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>
                  </svg>
                } @else {
                  {{ getDisplayNumber(i) }}
                }
              </div>
              <div class="label">{{ step.label }}</div>
            </div>
          }
        }
      }
    </div>
  `,
  styleUrl: './stepper.component.scss'
})
export class StepperComponent {
  @Input() steps: StepConfig[] = [];
  @Input() current: number = 0;
  @Input() clickable: boolean = false;
  @Input() skipHeader: boolean = false;
  @Output() currentChange = new EventEmitter<number>();

  getDisplayNumber(index: number): number {
    let displayNumber = index + 1;
    if (this.skipHeader && displayNumber > 1) {
      displayNumber--;
    }
    return displayNumber;
  }

  onStepClick(index: number): void {
    this.currentChange.emit(index);
  }
}

