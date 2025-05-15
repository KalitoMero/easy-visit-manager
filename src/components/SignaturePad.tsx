
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Eraser } from 'lucide-react';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTranslation } from '@/locale/translations';

interface SignaturePadProps {
  onChange: (signatureDataUrl: string | null) => void;
  width?: number;
  height?: number;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ 
  onChange, 
  width = 400,
  height = 200
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const { language } = useLanguageStore();
  const t = useTranslation(language);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000';
        
        // Set the canvas dimensions correctly
        const dpr = window.devicePixelRatio || 1;
        
        // Set the display size (CSS) to match the desired width/height
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        
        // Set the actual canvas dimensions accounting for DPR
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        
        // Scale the context to handle the high DPR
        ctx.scale(dpr, dpr);
        
        // Clear canvas to white
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
      }
    }
  }, [width, height]);

  // Get event coordinates relative to canvas - FIXED FOR CORRECT SCALING
  const getCoordinates = (event: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    if ('touches' in event) {
      // For touch events
      return {
        x: (event.touches[0].clientX - rect.left),
        y: (event.touches[0].clientY - rect.top)
      };
    } else {
      // For mouse events
      return {
        x: (event.clientX - rect.left),
        y: (event.clientY - rect.top)
      };
    }
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
    const signatureData = canvas.toDataURL('image/png');
    const signatureExists = hasSignatureData(canvas);
    
    setHasSignature(signatureExists);
    if (signatureExists) {
      onChange(signatureData);
    } else {
      onChange(null);
    }
  };

  // Check if canvas has signature data
  const hasSignatureData = (canvas: HTMLCanvasElement): boolean => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    // Get image data with proper scaling
    const imageData = ctx.getImageData(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
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

  // Clear signature
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with proper dimensions
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    
    setHasSignature(false);
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <Card className="border-2 p-0 overflow-hidden relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair touch-none"
          style={{ width: '100%', height }}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
            {language === 'de' ? 'Hier unterschreiben' : 'Sign here'}
          </div>
        )}
      </Card>
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={clearSignature}
          className="flex items-center gap-1"
        >
          <Eraser size={16} />
          {language === 'de' ? 'Löschen' : 'Clear'}
        </Button>
      </div>
    </div>
  );
};

export default SignaturePad;
