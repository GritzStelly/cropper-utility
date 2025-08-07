
export enum AppState {
  UPLOADING,
  RATIO_SELECTION,
  CROPPING,
  EXPORTING,
  DONE,
}

export interface ProcessedImage {
  id: string;
  originalFile: File;
  name: string;
  src: string;
  exifData: string | null;
  width: number;
  height: number;
}

export interface StoredCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropError {
  fileName: string;
  message: string;
}
