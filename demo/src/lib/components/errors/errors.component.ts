import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'csv-errors',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (error) {
      <div class="errors" [class.centered]="centered">
        <p>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"/>
          </svg>
          {{ error }}
        </p>
      </div>
    }
  `,
  styleUrl: './errors.component.scss'
})
export class ErrorsComponent {
  @Input() error?: string | null;
  @Input() centered: boolean = false;
}

