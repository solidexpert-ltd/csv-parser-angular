import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'csv-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="tooltip" [class.multiline]="title.length > 30">
      <ng-content></ng-content>
      <span class="icon" #iconRef (mouseenter)="showTooltip()" (mouseleave)="hideTooltip()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
          <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"/>
        </svg>
        @if (visible) {
          <span class="message" [style.top.px]="position.top" [style.left.px]="position.left">
            {{ title }}
          </span>
        }
      </span>
    </span>
  `,
  styleUrl: './tooltip.component.scss'
})
export class TooltipComponent {
  @Input() title: string = '';
  @ViewChild('iconRef') iconRef!: ElementRef;

  visible: boolean = false;
  position = { top: 0, left: 0 };

  showTooltip(): void {
    if (this.iconRef?.nativeElement) {
      const rect = this.iconRef.nativeElement.getBoundingClientRect();
      this.position = {
        top: rect.bottom + window.scrollY,
        left: rect.left + rect.width / 2 + window.scrollX
      };
      this.visible = true;
    }
  }

  hideTooltip(): void {
    this.visible = false;
  }
}

