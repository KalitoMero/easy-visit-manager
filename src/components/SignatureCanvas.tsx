
import React from 'react';

interface SignatureCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  startDrawing: (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  draw: (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
  hasSignature: boolean;
  placeholderText: string;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  canvasRef,
  startDrawing,
  draw,
  stopDrawing,
  hasSignature,
  placeholderText
}) => {
  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="cursor-crosshair touch-none w-full h-full"
      />
      {!hasSignature && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
          {placeholderText}
        </div>
      )}
    </div>
  );
};

export default SignatureCanvas;
