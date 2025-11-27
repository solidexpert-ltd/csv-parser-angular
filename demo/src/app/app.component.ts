import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CsvImporterComponent } from '@solidexpert/csv-importer-angular';

interface Template {
  columns: {
    name: string;
    key: string;
    required?: boolean;
    description?: string;
    suggested_mappings?: string[];
  }[];
}

interface ImportResult {
  num_rows: number;
  num_columns: number;
  error: string | null;
  columns: { key: string; name: string }[];
  rows: {
    index: number;
    values: Record<string, string | number>;
  }[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, CsvImporterComponent],
  template: `
    <div class="app">
      <header class="header">
        <div class="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256" fill="currentColor">
            <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z"/>
          </svg>
          <h1>CSV Import Angular</h1>
        </div>
        <p class="subtitle">Import CSV, TSV, and Excel files with ease</p>
      </header>

      <main class="main">
        <div class="controls">
          <div class="control-group">
            <label class="toggle">
              <input type="checkbox" [(ngModel)]="darkMode" />
              <span class="toggle-slider"></span>
              <span class="toggle-label">Dark Mode</span>
            </label>
          </div>

          <button class="open-btn" (click)="openModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
              <path d="M224,152v56a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V152a8,8,0,0,1,16,0v56H208V152a8,8,0,0,1,16,0ZM93.66,85.66,120,59.31V152a8,8,0,0,0,16,0V59.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40A8,8,0,0,0,93.66,85.66Z"/>
            </svg>
            Open Importer
          </button>
        </div>

        @if (lastResult) {
          <div class="result-card">
            <h3>Last Import Result</h3>
            <div class="result-stats">
              <div class="stat">
                <span class="stat-value">{{ lastResult.num_rows }}</span>
                <span class="stat-label">Rows</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ lastResult.num_columns }}</span>
                <span class="stat-label">Columns</span>
              </div>
            </div>
            <div class="result-preview">
              <h4>Data Preview (first 5 rows)</h4>
              <div class="preview-table-container">
                <table class="preview-table">
                  <thead>
                    <tr>
                      @for (col of lastResult.columns; track col.key) {
                        <th>{{ col.name }}</th>
                      }
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of lastResult.rows.slice(0, 5); track row.index) {
                      <tr>
                        @for (col of lastResult.columns; track col.key) {
                          <td>{{ row.values[col.key] }}</td>
                        }
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

        <csv-importer
          [isModal]="true"
          [modalIsOpen]="isOpen"
          [darkMode]="darkMode"
          [template]="template"
          [modalCloseOnOutsideClick]="true"
          [showDownloadTemplateButton]="true"
          (modalClose)="closeModal()"
          (complete)="onComplete($event)"
        ></csv-importer>
      </main>

      <footer class="footer">
        <p>Built with Angular • Open Source CSV Importer</p>
      </footer>
    </div>
  `,
  styles: [`
    .app {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header {
      text-align: center;
      padding: 3rem 1rem;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;

      svg {
        color: #7a5ef8;
      }

      h1 {
        font-size: 2rem;
        font-weight: 700;
        background: linear-gradient(135deg, #7a5ef8, #a78bfa);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .subtitle {
      color: #a0a0a0;
      font-size: 1.1rem;
    }

    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1rem;
      gap: 2rem;
    }

    .controls {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 1.5rem 2rem;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .control-group {
      display: flex;
      align-items: center;
    }

    .toggle {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;

      input {
        display: none;
      }

      .toggle-slider {
        position: relative;
        width: 48px;
        height: 26px;
        background: #3a3a5c;
        border-radius: 13px;
        transition: all 0.3s ease;

        &::before {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          width: 20px;
          height: 20px;
          background: #fff;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
      }

      input:checked + .toggle-slider {
        background: #7a5ef8;

        &::before {
          transform: translateX(22px);
        }
      }

      .toggle-label {
        font-size: 0.9rem;
        font-weight: 500;
      }
    }

    .open-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #7a5ef8, #6941c6);
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(122, 94, 248, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(122, 94, 248, 0.4);
      }

      &:active {
        transform: translateY(0);
      }
    }

    .result-card {
      width: 100%;
      max-width: 800px;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);

      h3 {
        margin-bottom: 1.5rem;
        font-size: 1.25rem;
        color: #7a5ef8;
      }
    }

    .result-stats {
      display: flex;
      gap: 2rem;
      margin-bottom: 1.5rem;
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: #fff;
      }

      .stat-label {
        font-size: 0.85rem;
        color: #a0a0a0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .result-preview {
      h4 {
        margin-bottom: 1rem;
        font-size: 1rem;
        font-weight: 500;
        color: #d0d0d0;
      }
    }

    .preview-table-container {
      overflow-x: auto;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .preview-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;

      th, td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      th {
        background: rgba(122, 94, 248, 0.2);
        font-weight: 600;
        color: #c4b5fd;
      }

      tbody tr:hover {
        background: rgba(255, 255, 255, 0.05);
      }

      td {
        color: #d0d0d0;
      }
    }

    .footer {
      text-align: center;
      padding: 2rem;
      color: #666;
      font-size: 0.875rem;
    }
  `]
})
export class AppComponent {
  isOpen = false;
  darkMode = true;
  lastResult: ImportResult | null = null;

  template: Template = {
    columns: [
      {
        name: 'First Name',
        key: 'first_name',
        required: true,
        description: 'The first name of the user',
        suggested_mappings: ['first', 'name', 'firstname']
      },
      {
        name: 'Last Name',
        key: 'last_name',
        suggested_mappings: ['last', 'surname', 'lastname']
      },
      {
        name: 'Email',
        key: 'email',
        required: true,
        description: 'The email address of the user'
      },
      {
        name: 'Phone',
        key: 'phone',
        description: 'Phone number (optional)'
      }
    ]
  };

  openModal(): void {
    console.log('openModal');
    this.isOpen = true;
  }

  closeModal(): void {
    this.isOpen = false;
  }

  onComplete(result: ImportResult): void {
    console.log('Import complete:', result);
    this.lastResult = result;
  }
}
