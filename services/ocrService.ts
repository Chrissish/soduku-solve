import { createWorker } from 'tesseract.js';
import { OCRResult, SudokuBoard } from '@/types';
import { processImage } from '@/lib/imageProcessing';

export async function recognizeSudoku(imageFile: File | string): Promise<OCRResult> {
  // 1. Load image into an HTMLImageElement for OpenCV
  const imageElement = new Image();
  const imageUrl = typeof imageFile === 'string' ? imageFile : URL.createObjectURL(imageFile);
  
  await new Promise((resolve, reject) => {
    imageElement.onload = resolve;
    imageElement.onerror = reject;
    imageElement.src = imageUrl;
  });

  // 2. Use OpenCV to process image and split into 81 cells
  let cells: HTMLCanvasElement[] = [];
  try {
    cells = await processImage(imageElement);
  } catch (error) {
    console.error("OpenCV processing failed, falling back to full image OCR", error);
    // You could fallback to the old method here if needed, but for now we propagate error
    // or return empty.
    throw error;
  }

  // 3. Initialize Tesseract Worker
  const worker = await createWorker('eng', 1, {
    // Use local files to avoid CORS/Network issues on LAN
    workerPath: '/tesseract-worker.min.js',
    corePath: '/tesseract-core.wasm.js',
    // langPath usually works from remote, but can be local if needed.
    // For now keep remote langPath (or default) as it's less likely to fail than scripts.
    // If lang load fails, we'll download eng.traineddata to public/ as well.
  });
  await worker.setParameters({
    tessedit_char_whitelist: '123456789',
    // Single character mode
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tessedit_pageseg_mode: '10' as any, 
  });

  const board: SudokuBoard = Array(9).fill(null).map(() => Array(9).fill(0));
  const confidence: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));

  // 4. Recognize each cell
  // To speed up, we can run promises in parallel, but browser limit might be hit.
  // Batching them is safer.
  
  // Optimization: Filter out obviously empty cells
  // We can check pixel data from canvas. If mostly white/black, skip.
  const nonEmptyCells = cells
    .map((canvas, index) => ({ canvas, index }))
    .filter(({ canvas }) => !isEmptyCell(canvas));

  const recognizePromises = nonEmptyCells.map(async ({ canvas, index }) => {
    const row = Math.floor(index / 9);
    const col = index % 9;

    // if (row != 1 || col != 3) {
    //   return;
    // }

    // 保存 canvas 为图片，以 index 命名
    // const link = document.createElement('a');
    // link.download = `cell_${row}_${col}.png`;
    // link.href = canvas.toDataURL('image/png');
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);

    // Tesseract expects image data. Canvas is fine.
    const { data } = await worker.recognize(canvas);
    
    console.log(`OCR Cell [${row}, ${col}][]: Text='${data.text.trim()}', Confidence=${data.confidence}`);

    const text = data.text.trim();
    // Sometimes it sees noise as symbols like '|' or '_' even with whitelist?
    // Whitelist should prevent that.
    
    const val = parseInt(text);
    if (!isNaN(val) && val >= 1 && val <= 9) {
        board[row][col] = val;
        confidence[row][col] = data.confidence;
    }
  });

  await Promise.all(recognizePromises);
  await worker.terminate();

  // Cleanup object URL
  if (typeof imageFile !== 'string') {
    URL.revokeObjectURL(imageUrl);
  }

  return { board, confidence };
}

function isEmptyCell(canvas: HTMLCanvasElement): boolean {
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let blackPixels = 0;
    const threshold = 128; // Assuming binary image from OpenCV thresholding
    
    // Count black pixels (text)
    for (let i = 0; i < data.length; i += 4) {
        // If R, G, B are low, it's black
        if (data[i] < threshold) {
            blackPixels++;
        }
    }
    
    const ratio = blackPixels / (canvas.width * canvas.height);
    // If very few black pixels, it's empty (noise might exist, so > 1-2%?)
    return ratio < 0.02; 
}
