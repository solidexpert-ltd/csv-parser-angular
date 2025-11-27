declare module 'papaparse' {
  export interface ParseError {
    type: string;
    code: string;
    message: string;
    row?: number;
  }

  export interface ParseResult<T> {
    data: T[];
    errors: ParseError[];
    meta: {
      delimiter: string;
      linebreak: string;
      aborted: boolean;
      truncated: boolean;
      fields?: string[];
    };
  }

  export interface ParseConfig<T> {
    delimiter?: string;
    newline?: string;
    quoteChar?: string;
    escapeChar?: string;
    header?: boolean;
    transformHeader?: (header: string) => string;
    dynamicTyping?: boolean;
    preview?: number;
    encoding?: string;
    worker?: boolean;
    comments?: boolean | string;
    step?: (results: ParseResult<T>, parser: any) => void;
    complete?: (results: ParseResult<T>) => void;
    error?: (error: ParseError) => void;
    download?: boolean;
    downloadRequestHeaders?: Record<string, string>;
    skipEmptyLines?: boolean | 'greedy';
    chunk?: (results: ParseResult<T>, parser: any) => void;
    fastMode?: boolean;
    beforeFirstChunk?: (chunk: string) => string | void;
    withCredentials?: boolean;
    transform?: (value: string, field: string | number) => any;
  }

  export function parse<T>(input: string | File, config?: ParseConfig<T>): ParseResult<T>;
  export function unparse<T>(data: T[], config?: any): string;
}

declare module 'xlsx' {
  export function read(data: any, opts?: any): any;
  export const utils: {
    sheet_to_json: (worksheet: any, opts?: any) => any[];
    json_to_sheet: (data: any[], opts?: any) => any;
  };
}

