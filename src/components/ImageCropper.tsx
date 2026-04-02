import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Button from './Button';
import Modal from './Modal';
import styles from './ImageCropper.module.css';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCrop: (file: File) => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ isOpen, onClose, imageSrc, onCrop }) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const getCroppedImage = () => {
    if (!imgRef.current || !completedCrop) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'cropped-image.png', { type: 'image/png' });
        onCrop(file);
        onClose();
      }
    }, 'image/png');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recortar Imagen">
      <div className={styles.cropContainer}>
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={5 / 7}
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Para recortar"
            crossOrigin="anonymous"
          />
        </ReactCrop>
      </div>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button onClick={getCroppedImage} disabled={!completedCrop}>Aplicar</Button>
      </div>
    </Modal>
  );
};

export default ImageCropper;
