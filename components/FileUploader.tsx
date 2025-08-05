
import React, { useState, useCallback, useRef } from 'react';
import { CropError } from '../types';
import Icon from './Icon';
import Spinner from './Spinner';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
  errors: CropError[];
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected, isProcessing, errors }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files && files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
     if (files && files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <div 
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative w-full p-8 border-2 border-dashed rounded-2xl transition-colors duration-300 ${isDragging ? 'border-indigo-400 bg-gray-800' : 'border-gray-600 hover:border-gray-500'}`}
      >
        {isProcessing ? (
          <div className="h-48 flex items-center justify-center">
             <Spinner text="Processing images..." />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 h-48">
            <Icon icon="upload" className="w-16 h-16 text-gray-500" />
            <p className="text-xl text-gray-400">Drag & drop images here</p>
            <p className="text-gray-500">or</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.heic,.heif"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={handleButtonClick}
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
            >
              Select Files
            </button>
            <p className="text-xs text-gray-500 pt-2">Supports JPG, PNG, WEBP, HEIC. Max 25MB per file.</p>
          </div>
        )}
      </div>
      {errors.length > 0 && (
        <div className="w-full mt-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
          <h3 className="font-bold text-red-300 mb-2 flex items-center gap-2">
            <Icon icon="warning" className="w-5 h-5" />
            Some files could not be processed:
          </h3>
          <ul className="list-disc list-inside text-red-300/90 text-sm space-y-1">
            {errors.map((error, index) => (
              <li key={index}>
                <strong>{error.fileName}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
