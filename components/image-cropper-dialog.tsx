'use client';

import { useRef, useCallback } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ImageCropperDialogProps {
  open: boolean;
  imageSrc: string;
  onCrop: (file: File) => void;
  onCancel: () => void;
}

const OUTPUT_SIZE = 512;

export function ImageCropperDialog({ open, imageSrc, onCrop, onCancel }: ImageCropperDialogProps) {
  const cropperRef = useRef<ReactCropperElement>(null);

  const handleCrop = useCallback(() => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({
      width: OUTPUT_SIZE,
      height: OUTPUT_SIZE,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'kyc-document.png', { type: 'image/png' });
      onCrop(file);
    }, 'image/png');
  }, [onCrop]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Crop your ID document</DialogTitle>
          <DialogDescription>
            Position and resize the crop area to fit your ID card. The image will be saved as 512×512 pixels.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full max-h-[400px] overflow-hidden rounded-xl border border-border">
          {imageSrc && (
            <Cropper
              ref={cropperRef}
              src={imageSrc}
              style={{ height: 400, width: '100%' }}
              aspectRatio={1}
              viewMode={1}
              minCropBoxWidth={128}
              minCropBoxHeight={128}
              guides
              background={false}
              responsive
              autoCropArea={0.9}
            />
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleCrop}>
            Crop &amp; Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
