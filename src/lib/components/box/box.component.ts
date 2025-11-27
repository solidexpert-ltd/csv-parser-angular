import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'csv-box',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="box" [class]="variantClasses">
      <ng-content></ng-content>
    </div>
  `,
  styleUrl: './box.component.scss'
})
export class BoxComponent {
  @Input() variants: string[] = [];

  get variantClasses(): string {
    return this.variants.join(' ');
  }
}

