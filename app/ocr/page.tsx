"use client";

import { useState } from "react";
import { createWorker } from "tesseract.js";
import { ImageUploader } from "@/components/ImageUploader";
import { Button } from "@/components/common/Button";

export default function OCRTestPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ text: string; confidence: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setResult(null);
    setLogs([]);
  };

  const runOCR = async () => {
    if (!imageFile) return;

    setIsProcessing(true);
    addLog("Starting OCR...");

    try {
      const worker = await createWorker("eng", 1, {
        workerPath: '/tesseract-worker.min.js',
        corePath: '/tesseract-core.wasm.js',
      });
      
      addLog("Worker created. Setting parameters...");
      
      await worker.setParameters({
        tessedit_char_whitelist: "123456789",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tessedit_pageseg_mode: "10" as any, // Single character mode
      });

      addLog("Recognizing...");
      
      // Convert File to URL for Tesseract
      const imageUrl = URL.createObjectURL(imageFile);
      const { data } = await worker.recognize(imageUrl);

      addLog(`Result: "${data.text}", Confidence: ${data.confidence}`);
      console.log("Full OCR Data:", data);

      setResult({
        text: data.text.trim(),
        confidence: data.confidence,
      });

      await worker.terminate();
      URL.revokeObjectURL(imageUrl);
      
    } catch (error) {
      console.error(error);
      addLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">OCR Test Page (Single Char)</h1>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <ImageUploader onImageSelect={handleImageSelect} />
        </div>

        {imageFile && (
          <div className="flex justify-center">
            <Button 
              onClick={runOCR} 
              disabled={isProcessing}
            >
              {isProcessing ? "Recognizing..." : "Run Single Digit OCR"}
            </Button>
          </div>
        )}

        {result && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            <div className="space-y-2">
              <p className="text-4xl font-mono font-bold text-center p-4 bg-gray-100 rounded">
                {result.text || "<Empty>"}
              </p>
              <p className="text-center text-gray-500">
                Confidence: {result.confidence.toFixed(2)}%
              </p>
            </div>
          </div>
        )}

        <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-sm h-64 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
          {logs.length === 0 && <div className="text-gray-500">Logs will appear here...</div>}
        </div>
      </div>
    </main>
  );
}
