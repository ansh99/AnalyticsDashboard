export type ColumnType = 'number' | 'string' | 'date';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: number;
  data: any[];
  headers: string[];
  columnTypes: Record<string, ColumnType>;
}

export interface AppState {
  files: UploadedFile[];
  activeFileId: string | null;
  geminiApiKey: string | null;
  addFile: (file: UploadedFile) => void;
  removeFile: (id: string) => void;
  setActiveFile: (id: string | null) => void;
  setGeminiApiKey: (key: string | null) => void;
  clearFiles: () => void;
}
