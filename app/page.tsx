'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUploader } from '@/components/ImageUploader';
import { Button } from '@/components/common/Button';
import { recognizeSudoku } from '@/services/ocrService';
import { boardToString } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageSelect = async (file: File) => {
    setIsProcessing(true);
    try {
      const { board } = await recognizeSudoku(file);
      const boardStr = boardToString(board);
      router.push(`/correct?board=${boardStr}`);
    } catch (error) {
      console.error('OCR Failed', error);
      alert('图片识别失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleStartEmpty = () => {
      const empty = Array(81).fill(0).join('');
      router.push(`/correct?board=${empty}`);
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center p-4 pt-10 sm:justify-center">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            数独解题助手
            </h1>
            <p className="text-slate-600 text-sm">
            上传数独图片，自动识别并演示解题过程
            </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-slate-600 font-medium">正在识别数独...</p>
            </div>
          ) : (
            <ImageUploader onImageSelect={handleImageSelect} />
          )}
        </div>
        
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 px-2 text-slate-500">或者</span>
            </div>
        </div>
        
        <Button variant="outline" className="w-full" onClick={handleStartEmpty}>
            手动输入题目
        </Button>
      </div>
    </main>
  );
}
