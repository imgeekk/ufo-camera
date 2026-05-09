'use client';

import { useState, useRef, useCallback } from 'react';

export default function SEMConverter() {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawOverlays = (ctx: CanvasRenderingContext2D, width: number, height: number, padding: number, headerHeight: number) => {
    const startX = padding;
    const startY = headerHeight + padding;
    const endX = startX + width;
    const endY = startY + height;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, ctx.canvas.width, headerHeight);

    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, width, height);

    const centerX = startX + width / 2;
    const centerY = startY + height / 2;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(startX, centerY);
    ctx.lineTo(endX, centerY);
    ctx.stroke();
    
    const verticalOffset = 50;
    ctx.beginPath();
    ctx.moveTo(centerX, startY + verticalOffset);
    ctx.lineTo(centerX, endY - verticalOffset);
    ctx.stroke();

    const tickSpacing = 50;
    const numTicks = Math.floor(width / tickSpacing / 2);
    
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'center';
    
    for (let i = -numTicks; i <= numTicks; i++) {
      if (i === 0) continue;
      const x = centerX + i * tickSpacing;
      
      ctx.beginPath();
      ctx.moveTo(x, centerY - 5);
      ctx.lineTo(x, centerY + 5);
      ctx.stroke();
      
      const label = String(i * 3);
      ctx.fillText(label, x, centerY + 18);
    }

    const vertTicks = Math.floor(height / tickSpacing / 2);
    ctx.textAlign = 'right';
    
    for (let i = -vertTicks; i <= vertTicks; i++) {
      if (i === 0) continue;
      const y = centerY + i * tickSpacing;
      
      ctx.beginPath();
      ctx.moveTo(centerX - 5, y);
      ctx.lineTo(centerX + 5, y);
      ctx.stroke();
      
      const label = String(i * 3);
      ctx.fillText(label, centerX - 10, y + 3);
    }

    const fiducialHeight = 20;
    const leftPositions = [
      { x: startX + 10, y: startY + 10 },
      { x: startX + 10, y: endY - fiducialHeight - 10 },
      { x: startX + 10, y: centerY - fiducialHeight / 2 },
    ];
    const rightPositions = [
      { x: endX - 10, y: startY + 10 },
      { x: endX - 10, y: endY - fiducialHeight - 10 },
      { x: endX - 10, y: centerY - fiducialHeight / 2 },
    ];

    leftPositions.forEach(pos => {
      const randomWidth = 40 + Math.random() * 40;
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(pos.x, pos.y, randomWidth, fiducialHeight);
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      ctx.strokeRect(pos.x, pos.y, randomWidth, fiducialHeight);
    });

    rightPositions.forEach(pos => {
      const randomWidth = 40 + Math.random() * 40;
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(pos.x - randomWidth, pos.y, randomWidth, fiducialHeight);
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      ctx.strokeRect(pos.x - randomWidth, pos.y, randomWidth, fiducialHeight);
    });

    ctx.font = '12px JetBrains Mono, monospace';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'left';
    ctx.fillText('FLIR', startX + 10, 20);
    
    ctx.textAlign = 'right';
    ctx.fillText('TEMP: 20-150°C', endX, 20);
    ctx.fillText('ε: 0.95', endX, 36);
    ctx.fillText('CAM: FLIR ONE', endX, 52);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    ctx.textAlign = 'left';
    ctx.fillText(dateStr, startX, 36);
    ctx.fillText('IR MODE', startX, 52);
  };

  const processImage = useCallback(async (img: HTMLImageElement) => {
    setIsProcessing(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxDim = 1200;
    let width = img.width;
    let height = img.height;
    
    if (width > maxDim || height > maxDim) {
      const ratio = Math.min(maxDim / width, maxDim / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
    }

    const verticalScale = 0.7;
    const scaledHeight = Math.floor(height * verticalScale);
    const headerHeight = 60;
    const padding = 20;
    canvas.width = width + padding * 2;
    canvas.height = scaledHeight + headerHeight + padding * 2;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const imgCanvas = document.createElement('canvas');
    imgCanvas.width = width;
    imgCanvas.height = height;
    const imgCtx = imgCanvas.getContext('2d');
    if (!imgCtx) return;
    
    imgCtx.drawImage(img, 0, 0, width, height);
    const imageData = imgCtx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const processedData = new Uint8ClampedArray(data.length);
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      let gray = 0.299 * r + 0.587 * g + 0.114 * b;
      
      gray = Math.pow(gray / 255, 0.7) * 255;
      
      const noise = (Math.random() - 0.5) * 40;
      gray = Math.max(0, Math.min(255, gray + noise));
      
      const cx = width / 2;
      const cy = height / 2;
      const dx = (i / 4) % width - cx;
      const dy = Math.floor((i / 4) / width) - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.sqrt(cx * cx + cy * cy);
      const vignette = 1 - (dist / maxDist) * 0.5;
      gray *= vignette;
      
      processedData[i] = gray;
      processedData[i + 1] = gray;
      processedData[i + 2] = gray;
      processedData[i + 3] = 255;
    }

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    const tempImageData = new ImageData(processedData, width, height);
    tempCtx.putImageData(tempImageData, 0, 0);

    ctx.filter = 'blur(1px)';
    ctx.drawImage(tempCanvas, padding, headerHeight + padding, width, scaledHeight);
    ctx.filter = 'none';

    drawOverlays(ctx, width, scaledHeight, padding, headerHeight);

    setIsProcessing(false);
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImage(result);
      
      const img = new Image();
      img.onload = () => processImage(img);
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'sem-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="bg-[#1B1A18] rounded-sm-lg p-6 border border-[#E2DED5]/30">
        <h1 className="text-2xl font-semibold text-[#E2DED5] mb-6 font-mono uppercase">
          FLIR Image Converter
        </h1>
        
        {!image && (
          <div
            className={`border-2 border-dashed rounded-sm-lg p-12 text-center transition-colors ${
              isDragging 
                ? 'border-[#E2DED5] bg-[#1B1A18]' 
                : 'border-[#E2DED5]/50 hover:border-[#E2DED5]/70'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="text-[#E2DED5] mb-4">
              <svg 
                className="w-12 h-12 mx-auto mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              <p className="text-lg">Drag and drop your image here</p>
              <p className="text-sm text-[#E2DED5]/70 mt-2">or click to browse</p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleInputChange}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="inline-block px-6 py-2 bg-[#E26132] text-[#1B1A18] rounded-none cursor-pointer hover:bg-[#E26132]/90 transition-colors font-mono text-sm uppercase"
            >
              Select Image
            </label>
          </div>
        )}

        {image && (
          <div className="space-y-4">
            <div className="relative bg-[#1B1A18] rounded-sm overflow-hidden">
              {isProcessing && (
                <div className="absolute inset-0 bg-[#1B1A18]/80 flex items-center justify-center z-10">
                  <div className="text-[#E2DED5] font-mono uppercase">Processing...</div>
                </div>
              )}
              <canvas
                ref={canvasRef}
                className="w-full h-auto block"
                style={{ maxHeight: '70vh' }}
              />
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setImage(null)}
                className="flex-1 px-6 py-3 bg-[#1B1A18] text-[#E2DED5] rounded-none border border-[#E2DED5]/30 hover:bg-[#1B1A18]/80 transition-colors font-mono text-sm uppercase cursor-pointer"
              >
                New Image
              </button>
              <button
                onClick={handleDownload}
                disabled={isProcessing}
                className="flex-1 px-6 py-3 bg-[#E26132] text-[#1B1A18] rounded-none hover:bg-[#E26132]/90 transition-colors font-mono text-sm uppercase cursor-pointer disabled:opacity-50"
              >
                Download Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}