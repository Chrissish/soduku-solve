import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  className?: string;
}

export function ImageUploader({ onImageSelect, className }: ImageUploaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelect(e.dataTransfer.files[0]);
    }
  }, [onImageSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed border-slate-300 rounded-xl p-8 transition-colors hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer text-center",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-blue-100 rounded-full text-blue-600">
          <Upload size={32} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">点击或拖拽上传图片</h3>
          <p className="text-sm text-slate-500 mt-1">支持 PNG, JPG 格式，可直接拍照</p>
        </div>
      </div>
    </div>
  );
}
