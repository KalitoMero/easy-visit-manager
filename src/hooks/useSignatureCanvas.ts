
import { useRef, useState, useEffect } from 'react';

interface UseSignatureCanvasProps {
  width: number;
  height: number;
  onSignatureChange: (signatureDataUrl: string | null) => void;
}

export const useSignatureCanvas = ({
  width,
  height,
  onSignatureChange
}: UseSignatureCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set basic drawing properties
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000';
        
        // Get the DPR
        const dpr = window.devicePixelRatio || 1;
        
        // Set the display size (CSS)
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        
        // Set the actual dimensions of the canvas
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        
        // Note: Removed ctx.scale(dpr, dpr) to prevent double scaling
        // Instead, we'll handle the scaling in the coordinate translation
        
        // Clear canvas to white
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        console.log(`Canvas initialized: CSS size ${width}x${height}, actual size ${canvas.width}x${canvas.height}, DPR: ${dpr}`);
      }
    }
  }, [width, height]);

  // Get correct event coordinates relative to canvas
  const getCoordinates = (event: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    let clientX, clientY;
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    // Translate coordinates with proper scaling for high-DPI displays
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    
    return { x, y };
  };

  // Check if canvas has signature data
  const hasSignatureData = (): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    // Check the entire canvas area
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelData = imageData.data;
    
    // Check for non-white pixels (RGBA format: R=255, G=255, B=255, A=255 for white)
    for (let i = 0; i < pixelData.length; i += 4) {
      // If any pixel is not white (allowing for small variations)
      if (pixelData[i] < 250 || pixelData[i + 1] < 250 || pixelData[i + 2] < 250) {
        return true;
      }
    }
    
    return false;
  };

  // Draw on canvas
  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    
    const { x, y } = getCoordinates(event.nativeEvent);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(event.nativeEvent);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check if there's a signature
    const signatureExists = hasSignatureData();
    
    setHasSignature(signatureExists);
    if (signatureExists) {
      const signatureData = canvas.toDataURL('image/png');
      onSignatureChange(signatureData);
    } else {
      onSignatureChange(null);
    }
  };

  // Clear signature
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with proper dimensions
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    setHasSignature(false);
    onSignatureChange(null);
  };

  return {
    canvasRef,
    isDrawing,
    hasSignature,
    startDrawing,
    draw,
    stopDrawing,
    clearSignature
  };
};
