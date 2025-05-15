
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eraser } from 'lucide-react';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useTranslation } from '@/locale/translations';
import { useSignatureCanvas } from '@/hooks/useSignatureCanvas';
import SignatureCanvas from './SignatureCanvas';

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
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  
  const {
    canvasRef,
    hasSignature,
    startDrawing,
    draw,
    stopDrawing,
    clearSignature
  } = useSignatureCanvas({
    width,
    height,
    onSignatureChange: onChange
  });

  const placeholderText = language === 'de' ? 'Hier unterschreiben' : 'Sign here';
  
  return (
    <div className="flex flex-col gap-3">
      <Card className="border-2 p-0 overflow-hidden relative" style={{ width: width, height: height }}>
        <SignatureCanvas
          canvasRef={canvasRef}
          startDrawing={startDrawing}
          draw={draw}
          stopDrawing={stopDrawing}
          hasSignature={hasSignature}
          placeholderText={placeholderText}
        />
      </Card>
      
      <div className="flex justify-start">
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
