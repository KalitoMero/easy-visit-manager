
import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (imageBase64: string) => void;
  currentImage?: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, currentImage }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreviewImage(base64String);
      onImageSelect(base64String);
    };
    
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'}
          ${previewImage ? 'py-2' : 'py-10'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {previewImage ? (
          <div className="relative">
            <img 
              src={previewImage} 
              alt="Uploaded policy image" 
              className="max-h-[200px] mx-auto my-2 object-contain"
            />
            <div className="mt-2 text-sm text-muted-foreground">
              {isDragging ? 'Drop to replace image' : 'Click or drag to replace image'}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Upload className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-lg font-medium">
              {isDragging ? 'Drop image here' : 'Click or drag image here'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports JPG, PNG and GIF
            </p>
          </div>
        )}
      </div>
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept="image/*"
        onChange={handleFileInputChange}
      />
    </div>
  );
};

export default ImageUploader;
