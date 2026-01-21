import React from 'react';
import { AlgorithmType } from '@/types';
import { Settings2 } from 'lucide-react';

interface AlgorithmSelectorProps {
  value: AlgorithmType;
  onChange: (algo: AlgorithmType) => void;
  className?: string;
}

export function AlgorithmSelector({ value, onChange, className = '' }: AlgorithmSelectorProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as AlgorithmType)}
        className="text-sm border border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-1 bg-white text-slate-700"
        title="选择解题算法"
      >
        <option value="backtracking">朴素回溯 (基础)</option>
        <option value="mrv">MRV 优化 (推荐)</option>
        <option value="dlx">Dancing Links (极速)</option>
      </select>
    </div>
  );
}
