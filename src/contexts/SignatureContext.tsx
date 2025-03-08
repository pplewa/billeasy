'use client';

import { createContext, useContext, useRef, useState } from 'react';
// We need to keep the import but disable the linter warning
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import SignatureCanvas from 'react-signature-canvas';

interface SignatureFont {
  name: string;
  variable: string;
}

interface SignatureColor {
  name: string;
  value: string;
}

// Define a more specific type for SignatureCanvas
type SignatureCanvasRef = {
  clear: () => void;
  toDataURL: (type?: string) => string;
  off: () => void;
};

interface SignatureContextType {
  // Draw signature
  signatureRef: React.RefObject<SignatureCanvasRef | null>;
  signatureColors: SignatureColor[];
  selectedColor: SignatureColor;
  setSelectedColor: (color: SignatureColor) => void;
  clearDrawnSignature: () => void;

  // Type signature
  typedSignature: string;
  setTypedSignature: (signature: string) => void;
  typedSignatureRef: React.RefObject<HTMLInputElement | null>;
  typedSignatureFonts: SignatureFont[];
  selectedFont: SignatureFont;
  setSelectedFont: (font: SignatureFont) => void;
  clearTypedSignature: () => void;

  // Upload signature
  uploadedSignature: string;
  setUploadedSignature: (signature: string) => void;
  clearUploadedSignature: () => void;
}

const SignatureContext = createContext<SignatureContextType | undefined>(undefined);

const defaultColors: SignatureColor[] = [
  { name: 'Black', value: '#000000' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'Red', value: '#FF0000' },
];

const defaultFonts: SignatureFont[] = [
  { name: 'Dancing Script', variable: 'var(--font-dancing-script)' },
  { name: 'Great Vibes', variable: 'var(--font-great-vibes)' },
  { name: 'Pacifico', variable: 'var(--font-pacifico)' },
];

export function SignatureProvider({ children }: { children: React.ReactNode }) {
  const signatureRef = useRef<SignatureCanvasRef | null>(null);
  const typedSignatureRef = useRef<HTMLInputElement | null>(null);

  const [selectedColor, setSelectedColor] = useState<SignatureColor>(defaultColors[0]);
  const [typedSignature, setTypedSignature] = useState('');
  const [selectedFont, setSelectedFont] = useState<SignatureFont>(defaultFonts[0]);
  const [uploadedSignature, setUploadedSignature] = useState('');

  const clearDrawnSignature = () => {
    signatureRef.current?.clear();
  };

  const clearTypedSignature = () => {
    setTypedSignature('');
  };

  const clearUploadedSignature = () => {
    setUploadedSignature('');
  };

  return (
    <SignatureContext.Provider
      value={{
        signatureRef,
        signatureColors: defaultColors,
        selectedColor,
        setSelectedColor,
        clearDrawnSignature,
        typedSignature,
        setTypedSignature,
        typedSignatureRef,
        typedSignatureFonts: defaultFonts,
        selectedFont,
        setSelectedFont,
        clearTypedSignature,
        uploadedSignature,
        setUploadedSignature,
        clearUploadedSignature,
      }}
    >
      {children}
    </SignatureContext.Provider>
  );
}

export function useSignatureContext() {
  const context = useContext(SignatureContext);
  if (context === undefined) {
    throw new Error('useSignatureContext must be used within a SignatureProvider');
  }
  return context;
}
