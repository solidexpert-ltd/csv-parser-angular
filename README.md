# CSV Import Angular

Open-source CSV, TSV, and XLS/XLSX file importer for Angular.

## Features

- 📁 **Multi-format support**: CSV, TSV, XLS, and XLSX files
- 🎨 **Theming**: Light and dark mode support with customizable primary color
- 🌍 **i18n**: Built-in translations (English, Spanish, French, German) with custom translation support
- 📱 **Modal & Inline**: Use as a modal or embed directly in your page
- ✅ **Column mapping**: Smart column matching with suggested mappings
- 🔧 **Customizable**: Custom styles, templates, and validation

## Installation

```bash
npm install csv-import-angular
# or
yarn add csv-import-angular
```

## Quick Start

```typescript
import { Component } from '@angular/core';
import { CsvImporterComponent, Template, ImportResult } from 'csv-import-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CsvImporterComponent],
  template: `
    <button (click)="isOpen = true">Open Importer</button>
    
    <csv-importer
      [isModal]="true"
      [modalIsOpen]="isOpen"
      [darkMode]="true"
      [template]="template"
      (modalClose)="isOpen = false"
      (complete)="onComplete($event)"
    ></csv-importer>
  `
})
export class AppComponent {
  isOpen = false;
  
  template: Template = {
    columns: [
      {
        name: 'First Name',
        key: 'first_name',
        required: true,
        description: 'The first name of the user',
        suggested_mappings: ['first', 'name']
      },
      {
        name: 'Last Name',
        key: 'last_name',
        suggested_mappings: ['last', 'surname']
      },
      {
        name: 'Email',
        key: 'email',
        required: true
      }
    ]
  };

  onComplete(result: ImportResult): void {
    console.log('Import complete:', result);
    // Process your data here
  }
}
```

## API Reference

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `isModal` | `boolean` | `true` | Display as modal or inline |
| `modalIsOpen` | `boolean` | `true` | Control modal visibility |
| `modalCloseOnOutsideClick` | `boolean` | `false` | Close modal on backdrop click |
| `template` | `Template \| string` | - | Column configuration (required) |
| `darkMode` | `boolean` | `false` | Enable dark theme |
| `primaryColor` | `string` | `'#7a5ef8'` | Primary brand color |
| `showDownloadTemplateButton` | `boolean` | `true` | Show template download button |
| `skipHeaderRowSelection` | `boolean` | `false` | Skip header row selection step |
| `language` | `string` | `'en'` | UI language (en, es, fr, de) |
| `customTranslations` | `object` | - | Custom translation strings |
| `customStyles` | `object \| string` | - | CSS custom properties |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `complete` | `ImportResult` | Emitted when import completes successfully |
| `modalClose` | `void` | Emitted when modal close is triggered |

### Template Configuration

```typescript
interface Template {
  columns: TemplateColumn[];
}

interface TemplateColumn {
  name: string;              // Display name
  key: string;               // Unique identifier
  description?: string;      // Help text
  required?: boolean;        // Mark as required
  suggested_mappings?: string[];  // Auto-match column names
  multiple?: boolean;        // Allow multiple columns to map
  combiner?: (values: string[]) => string;  // Custom value combiner
}
```

### Import Result

```typescript
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
```

## Custom Translations

```typescript
const customTranslations = {
  en: {
    'Upload': 'Upload File',
    'Drop your file here': 'Drag and drop your file here'
  },
  fr: {
    'Upload': 'Téléverser un fichier'
  }
};

// In template
<csv-importer
  [customTranslations]="customTranslations"
></csv-importer>
```

## Custom Styling

```typescript
const customStyles = {
  '--color-primary': '#10b981',
  '--color-primary-hover': '#059669',
  '--border-radius': '8px'
};

// In template
<csv-importer
  [customStyles]="customStyles"
></csv-importer>
```

## License

MIT

