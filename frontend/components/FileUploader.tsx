
import React, { useState, useCallback, DragEvent, ChangeEvent } from 'react';
import { Icon } from './Icon';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  disabled: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect, disabled]);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  return (
    <div
      className={`relative w-full border-4 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
        isDragging ? 'border-blue-500 bg-gray-800/50' : 'border-gray-700 hover:border-gray-600'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input
        id="fileInput"
        type="file"
        className="hidden"
        accept="image/*,video/*"
        onChange={handleFileChange}
        disabled={disabled}
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="text-blue-400">
           <Icon name="upload" />
        </div>
        <p className="text-xl font-semibold text-gray-200">Drag & Drop or Click to Upload</p>
        <p className="text-gray-400">Upload a video or image for analysis</p>
      </div>
    </div>
  );
};
