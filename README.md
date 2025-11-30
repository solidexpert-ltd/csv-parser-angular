# CSV Import Angular

Open-source CSV, TSV, and XLS/XLSX file importer for Angular.

## Features

- 📁 **Multi-format support**: CSV, TSV, XLS, and XLSX files
- 🎨 **Theming**: Light and dark mode support with customizable primary color
- 🌍 **i18n**: Built-in translations (English, Spanish, French, German) with custom translation support
- 📱 **Modal & Inline**: Use as a modal or embed directly in your page
- ✅ **Column mapping**: Smart column matching with suggested mappings
- 🔧 **Customizable**: Custom styles, templates, and validation

## Screenshots

![White theme preview showing the importer modal](Screenshot%200.png)

An overall view of the importer running in the default white theme, highlighting the modern modal layout and primary actions.

![Step one - upload](Screenshot%201.png)

**Step 1 — Upload & template selection:** Drag a file into the drop zone or browse from disk, then choose or confirm the correct template before moving on.

![Step two - mapping](Screenshot%202.png)

**Step 2 — Column mapping:** Quickly map source columns to your template keys. Suggested matches accelerate the process and required fields are clearly flagged.

![Step three - review](Screenshot%203.png)

**Step 3 — Review & completion:** Inspect the parsed rows, validate errors, and finish the import once everything looks good.

## Live Demo

Try the CSV importer in action! The demo application is available on GitHub Pages:

🌐 **[View Live Demo](https://solidexpert-ltd.github.io/csv-parser-angular/)**

The demo showcases all features including:
- File upload (CSV, TSV, XLS, XLSX)
- Column mapping with smart suggestions
- Row selection and validation
- Light and dark themes
- Multi-language support

The demo is automatically deployed to GitHub Pages on every push to the main branch.

## Installation

```bash
npm install @solidexpert/csv-importer-angular
# or
yarn add @solidexpert/csv-importer-angular
```

## Quick Start

```typescript
import { Component } from '@angular/core';
import { CsvImporterComponent, Template, ImportResult } from '@solidexpert/csv-importer-angular';

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

## Publishing

This package is automatically published to npm when a new version tag is pushed.

### Publishing a new version:

1. Update the version in `package.json`:
   ```bash
   npm version patch  # for bug fixes (1.0.0 -> 1.0.1)
   npm version minor  # for new features (1.0.0 -> 1.1.0)
   npm version major  # for breaking changes (1.0.0 -> 2.0.0)
   ```

2. Push the version commit and tag:
   ```bash
   git push && git push --tags
   ```

3. The GitHub Actions workflow will automatically:
   - Build the library
   - Publish to npm as `@solidexpert/csv-importer-angular`
   - Create a GitHub release

### Manual publishing:

You can also trigger the workflow manually from the GitHub Actions tab, or publish directly:

```bash
npm run build
npm publish
```

**Note**: You need to set up `NPM_TOKEN` secret in your GitHub repository settings for automatic publishing to work.

## License

MIT

