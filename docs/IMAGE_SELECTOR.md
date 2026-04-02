# ImageSelector - Documentación

## Solución Actual: react-easy-crop

Se utiliza la librería `react-easy-crop` para el cropping de imágenes.

### Instalación
```bash
npm install react-easy-crop
```

### Implementación

```tsx
import Cropper from 'react-easy-crop';

const CROP_WIDTH = 300;
const CROP_HEIGHT = 189;

<Cropper
  image={imageSrc}
  crop={crop}
  zoom={zoom}
  aspect={CROP_WIDTH / CROP_HEIGHT}
  onCropChange={setCrop}
  onZoomChange={setZoom}
  onCropComplete={onCropComplete}
/>
```

### Generación del Canvas

```javascript
const canvas = document.createElement('canvas');
canvas.width = CROP_WIDTH;   // 300
canvas.height = CROP_HEIGHT; // 189

ctx.drawImage(
  img,
  croppedAreaPixels.x,
  croppedAreaPixels.y,
  croppedAreaPixels.width,
  croppedAreaPixels.height,
  0, 0,              // dest position
  CROP_WIDTH,         // 300
  CROP_HEIGHT         // 189
);
```

### Dimensiones Fijas

- `CROP_WIDTH = 300`
- `CROP_HEIGHT = 189`
- Aspect ratio: ~1.587 (simil MTG card art)

### Por Qué Funciona

1. `react-easy-crop` maneja toda la lógica de zoom/pan internamente
2. `onCropComplete` retorna los píxeles exactos del área seleccionada
3. El canvas usa esas coordenadas para extraer la imagen
4. No hay cálculos manuales de coordenadas ni transformaciones

### Archivos Relacionados

- `src/components/ImageSelector.tsx` - Componente de cropping
- `src/components/ImageSelector.module.css` - Estilos
- `src/pages/CreateCard.tsx` - Usa el selector y muestra preview
