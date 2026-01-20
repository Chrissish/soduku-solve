// Define global OpenCV type
declare global {
  interface Window {
    cv: any;
  }
}

export async function processImage(imageElement: HTMLImageElement): Promise<HTMLCanvasElement[]> {
  return new Promise((resolve, reject) => {
    // Ensure OpenCV is loaded
    if (!window.cv) {
      reject(new Error("OpenCV not loaded"));
      return;
    }

    const cv = window.cv;

    try {
      // 1. Read image
      const src = cv.imread(imageElement);
      const dst = new cv.Mat();

      // 2. Preprocess: Gray -> Blur -> Threshold
      cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
      // GaussianBlur helps remove noise
      const ksize = new cv.Size(5, 5);
      cv.GaussianBlur(src, src, ksize, 0, 0, cv.BORDER_DEFAULT);
      // Adaptive Threshold to handle different lighting conditions
      cv.adaptiveThreshold(src, src, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2);

      // 3. Find Contours (the largest square is likely the sudoku board)
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      let maxArea = 0;
      let maxContour = null;

      for (let i = 0; i < contours.size(); ++i) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);
        // Filter small areas
        if (area > 5000) {
            // Approximate contour to polygon
            const peri = cv.arcLength(contour, true);
            const approx = new cv.Mat();
            cv.approxPolyDP(contour, approx, 0.02 * peri, true);
            
            // If it has 4 points and is the largest so far
            if (approx.rows === 4 && area > maxArea) {
                maxArea = area;
                maxContour = approx;
            } else {
                approx.delete();
            }
        }
      }

      if (!maxContour) {
        src.delete(); dst.delete(); contours.delete(); hierarchy.delete();
        reject(new Error("Could not find Sudoku grid"));
        return;
      }

      // 4. Perspective Transform (Warp)
      // Order points: top-left, top-right, bottom-right, bottom-left
      const pointsArray = [];
      for (let i = 0; i < 4; i++) {
          pointsArray.push({
              x: maxContour.data32S[i * 2],
              y: maxContour.data32S[i * 2 + 1]
          });
      }
      
      // Sort points to find TL, TR, BR, BL
      pointsArray.sort((a, b) => a.y - b.y);
      // Top two are TL and TR
      const topPoints = pointsArray.slice(0, 2).sort((a, b) => a.x - b.x);
      // Bottom two are BL and BR
      const bottomPoints = pointsArray.slice(2, 4).sort((a, b) => a.x - b.x);
      
      const sortedPoints = [...topPoints, ...bottomPoints];

      const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
          sortedPoints[0].x, sortedPoints[0].y, // TL
          sortedPoints[1].x, sortedPoints[1].y, // TR
          sortedPoints[3].x, sortedPoints[3].y, // BL (Note: index 3 is BR in our sorted logic? Wait.)
          sortedPoints[2].x, sortedPoints[2].y  // BR
      ]);
      // Wait, standard order for getPerspectiveTransform usually needs consistent ordering.
      // Let's ensure: TL, TR, BR, BL.
      // Our bottomPoints sorted by x: [0] is BL, [1] is BR.
      // So sortedPoints is: TL, TR, BL, BR.
      
      // Let's fix the input array for transform
      const srcTriFixed = cv.matFromArray(4, 1, cv.CV_32FC2, [
          sortedPoints[0].x, sortedPoints[0].y, // TL
          sortedPoints[1].x, sortedPoints[1].y, // TR
          sortedPoints[3].x, sortedPoints[3].y, // BR
          sortedPoints[2].x, sortedPoints[2].y  // BL
      ]);

      // Determine width and height of the new image
      const widthA = Math.sqrt(Math.pow(sortedPoints[2].x - sortedPoints[3].x, 2) + Math.pow(sortedPoints[2].y - sortedPoints[3].y, 2));
      const widthB = Math.sqrt(Math.pow(sortedPoints[1].x - sortedPoints[0].x, 2) + Math.pow(sortedPoints[1].y - sortedPoints[0].y, 2));
      const maxWidth = Math.max(widthA, widthB);

      const heightA = Math.sqrt(Math.pow(sortedPoints[1].x - sortedPoints[3].x, 2) + Math.pow(sortedPoints[1].y - sortedPoints[3].y, 2));
      const heightB = Math.sqrt(Math.pow(sortedPoints[0].x - sortedPoints[2].x, 2) + Math.pow(sortedPoints[0].y - sortedPoints[2].y, 2));
      const maxHeight = Math.max(heightA, heightB);
      
      // Force square for Sudoku
      const side = Math.max(maxWidth, maxHeight);

      const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
          0, 0,
          side, 0,
          side, side,
          0, side
      ]);

      const M = cv.getPerspectiveTransform(srcTriFixed, dstTri);
      // Warp using the original image (need to reload or keep copy? src is gray now)
      // Better to warp the original colored image for display? Or the thresholded one for OCR?
      // Tesseract works fine with Binary. Let's warp the binary 'src' which is already thresholded.
      // Actually, adaptiveThreshold result (src) is inverted (white lines/text on black). 
      // Tesseract prefers black text on white.
      // Let's use the original image for warping to preserve details, then process for OCR.
      
      const originalSrc = cv.imread(imageElement);
      cv.warpPerspective(originalSrc, dst, M, new cv.Size(side, side), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
      
      // Now 'dst' is the squared, colored sudoku board.
      
      // 5. Grid Slicing
      const cells: HTMLCanvasElement[] = [];
      const cellWidth = side / 9;
      const cellHeight = side / 9;
      
      // Pre-processing for OCR: Grayscale + Threshold
      cv.cvtColor(dst, dst, cv.COLOR_RGBA2GRAY, 0);
      cv.threshold(dst, dst, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
      // Dst is now black text on white background (if original was standard) or whatever Otsu decided.
      // Sudoku usually has black lines/numbers on white.
      
      for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
              // Extract cell ROI
              const x = col * cellWidth;
              const y = row * cellHeight;
              // Crop with a little padding removal to avoid grid lines
              const padding = 5; // Adjust based on resolution
              const rect = new cv.Rect(
                  x + padding, 
                  y + padding, 
                  cellWidth - 2 * padding, 
                  cellHeight - 2 * padding
              );
              
              if (rect.width > 0 && rect.height > 0) {
                  const cellRoi = dst.roi(rect);
                  
                  // Convert Mat to Canvas
                  const canvas = document.createElement('canvas');
                  canvas.width = rect.width;
                  canvas.height = rect.height;
                  cv.imshow(canvas, cellRoi);
                  cells.push(canvas);
                  
                  cellRoi.delete();
              } else {
                  // Fallback for edge cases
                  const canvas = document.createElement('canvas');
                  cells.push(canvas);
              }
          }
      }

      // Cleanup
      src.delete(); originalSrc.delete(); dst.delete(); 
      contours.delete(); hierarchy.delete(); 
      if(maxContour) maxContour.delete();
      srcTriFixed.delete(); dstTri.delete(); M.delete();

      resolve(cells);

    } catch (e) {
      reject(e);
    }
  });
}
