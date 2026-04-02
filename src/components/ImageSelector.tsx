import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Button from './Button';
import Modal from './Modal';
import styles from './ImageSelector.module.css';

interface ImageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onSelect: (croppedDataUrl: string) => void;
}

const CROP_WIDTH = 300;
const CROP_HEIGHT = 189;

export const ImageSelector: React.FC<ImageSelectorProps> = ({ isOpen, onClose, imageSrc, onSelect }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.crossOrigin = 'anonymous';
      image.src = url;
    });

  const handleApply = async () => {
    if (!croppedAreaPixels) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CROP_WIDTH;
    canvas.height = CROP_HEIGHT;

    const img = await createImage(imageSrc);
    
    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      CROP_WIDTH,
      CROP_HEIGHT
    );

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onSelect(dataUrl);
    onClose();
  };

  const reset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajustar Imagen de Carta">
      <div className={styles.container}>
        <p className={styles.instructions}>
          Usá los controles para ajustar el zoom y arrastrá para posicionar.
        </p>

        <div className={styles.cropContainer}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={CROP_WIDTH / CROP_HEIGHT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            classes={{
              containerClassName: styles.cropperContainer,
              mediaClassName: styles.cropperMedia,
            }}
          />
        </div>

        <div className={styles.controls}>
          <div className={styles.slider}>
            <label>Zoom</label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
            />
            <span>{Math.round(zoom * 100)}%</span>
          </div>

          <div className={styles.actions}>
            <Button variant="ghost" onClick={reset}>Resetear</Button>
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleApply}>Aplicar</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ImageSelector;
