
import { ProcessedImage, StoredCrop } from '../types';
import { MAX_FILE_SIZE } from '../constants';

declare const heic2any: any;
declare const piexif: any;
declare const JSZip: any;

function fileToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function arrayBufferToDataUrl(buffer: ArrayBuffer, mimeType: string): string {
    const blob = new Blob([buffer], { type: mimeType });
    return URL.createObjectURL(blob);
}


export const processFile = (file: File): Promise<ProcessedImage> => {
  return new Promise(async (resolve, reject) => {
    if (file.size > MAX_FILE_SIZE) {
      return reject(new Error(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`));
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      let exifData: string | null = null;
      if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          try {
              exifData = piexif.load(new TextDecoder("latin1").decode(new Uint8Array(arrayBuffer)));
          } catch(e) {
              console.warn(`Could not load EXIF data for ${file.name}`, e);
              exifData = null;
          }
      }

      let processedBlob: Blob = file;
      const fileNameLower = file.name.toLowerCase();
      if (fileNameLower.endsWith('.heic') || fileNameLower.endsWith('.heif')) {
        processedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.9,
        });
      }

      const src = URL.createObjectURL(processedBlob);
      const img = new Image();
      img.onload = () => {
        resolve({
          id: `${file.name}-${file.lastModified}`,
          originalFile: file,
          name: file.name,
          src,
          exifData,
          width: img.width,
          height: img.height,
        });
        // The object URL should not be revoked here, as it's needed for display.
        // It will be revoked in the App component's cleanup effect.
      };
      img.onerror = () => {
        reject(new Error('The file appears to be a corrupted or invalid image.'));
        URL.revokeObjectURL(src);
      };
      img.src = src;
    } catch (error) {
        console.error("Error processing file:", error);
        reject(error instanceof Error ? error : new Error('An unknown error occurred during file processing.'));
    }
  });
};

export const createCroppedImage = (
  image: ProcessedImage,
  crop: StoredCrop
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scaleX = img.naturalWidth / image.width;
      const scaleY = img.naturalHeight / image.height;
      
      canvas.width = Math.floor(crop.width * scaleX);
      canvas.height = Math.floor(crop.height * scaleY);
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }

      ctx.drawImage(
        img,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      let jpegDataUrl = canvas.toDataURL('image/jpeg', 0.9);

      if (image.exifData && Object.keys(image.exifData).length > 0) {
        try {
            const exifStr = piexif.dump(image.exifData);
            jpegDataUrl = piexif.insert(exifStr, jpegDataUrl);
        } catch (e) {
            console.warn(`Failed to insert EXIF data for ${image.name}`, e);
        }
      }
      
      // Convert data URL back to blob for zipping.
      fetch(jpegDataUrl)
        .then(res => res.blob())
        .then(finalBlob => resolve(finalBlob))
        .catch(reject);

    };
    img.onerror = reject;
    img.src = image.src;
  });
};

export const downloadImagesAsZip = async (
    images: { name: string; blob: Blob }[]
) => {
    const zip = new JSZip();
    images.forEach(({ name, blob }) => {
        const newName = name.substring(0, name.lastIndexOf('.')) + '.jpg';
        zip.file(newName, blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = 'cropped-images.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};
