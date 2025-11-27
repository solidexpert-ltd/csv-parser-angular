export interface Template {
  columns: TemplateColumn[];
}

export interface TemplateColumn {
  name: string;
  key: string;
  description?: string;
  required?: boolean;
  suggested_mappings?: string[];
  multiple?: boolean;
  combiner?: (values: string[]) => string;
}

export interface UploadColumn {
  index: number;
  name: string;
  sample_data: string[];
}

export interface FileRow {
  index: number;
  values: string[];
}

export interface FileData {
  fileName: string;
  rows: FileRow[];
  sheetList: string[];
  errors: string[];
}

export interface TemplateColumnMapping {
  key: string;
  include: boolean;
  selected?: boolean;
  isMultiple?: boolean;
}

export interface CSVImporterConfig {
  isModal?: boolean;
  modalIsOpen?: boolean;
  modalCloseOnOutsideClick?: boolean;
  template?: Template | string;
  darkMode?: boolean;
  primaryColor?: string;
  className?: string;
  showDownloadTemplateButton?: boolean;
  skipHeaderRowSelection?: boolean;
  language?: string;
  customTranslations?: Record<string, Record<string, string>>;
  customStyles?: Record<string, string> | string;
}

export interface ImportResult {
  num_rows: number;
  num_columns: number;
  error: string | null;
  columns: { key: string; name: string }[];
  rows: MappedRow[];
}

export interface MappedRow {
  index: number;
  values: Record<string, string | number>;
}

export interface StepConfig {
  label: string;
  id: string;
  disabled?: boolean;
}

export enum StepEnum {
  Upload = 0,
  RowSelection = 1,
  MapColumns = 2,
  Complete = 3
}

export interface InputOption {
  value: string;
  required?: boolean;
  multiple?: boolean;
}

export interface TableCell {
  raw?: string | number | boolean;
  content?: string;
  tooltip?: string;
}

export type TableRow = Record<string, TableCell | string | number | boolean>;

