
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
        // Set basic drawing properties
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000';
        
        // Get the DPR once
        const dpr = window.devicePixelRatio || 1;
        
        // Set the display size (CSS)
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        
        // Adjust for high DPI displays for sharpness
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        
        // Scale once during initialization
        ctx.scale(dpr, dpr);
        
        // Clear canvas to white
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        
        // Log the actual dimensions for debugging
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
      clientX = event.touches[0].clientX - rect.left;
      clientY = event.touches[0].clientY - rect.top;
    } else {
      clientX = event.clientX - rect.left;
      clientY = event.clientY - rect.top;
    }
    
    // FIXED: Convert correctly to canvas coordinates
    // Since we scaled the context by dpr during initialization,
    // we need to work in CSS pixels now (not multiply by dpr again)
    return {
      x: clientX,
      y: clientY
    };
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
    
    // Get image data - make sure we're checking the entire canvas
    const dpr = window.devicePixelRatio || 1;
    // Use width and height values that match the area we're drawing on
    const imageData = ctx.getImageData(0, 0, width, height);
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
          style={{ width: '100%', maxWidth: '100%' }}
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
