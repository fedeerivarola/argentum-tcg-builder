import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cardService } from '../lib/cardService';
import { useToast } from '../components/Toast';
import { CardType, CARD_TYPES, SUBTYPES, CardFormData } from '../types';
import { FormGroup, Label, Input, Textarea, Select } from '../components/Input';
import Button from '../components/Button';
import ImageSelector from '../components/ImageSelector';
import styles from './CreateCard.module.css';

export const CreateCard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CardFormData>({ title: '', type: CardType.CREATURE, subtype: '', description: '', attack: undefined, life: undefined, manaCost: 0, artist: '', image: undefined, imageUrl: undefined });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtypes = SUBTYPES[formData.type] || [];
  const showStats = formData.type === CardType.CREATURE || formData.type === CardType.PLANESWALKER;

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) { showToast('error', 'Solo se permiten imágenes JPG, PNG o WebP'); return; }
    if (file.size > 10 * 1024 * 1024) { showToast('error', 'La imagen debe ser menor a 10MB'); return; }
    
    setFormData(prev => ({ ...prev, image: file }));
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setOriginalImageUrl(url);
      setShowSelector(true);
    };
    reader.readAsDataURL(file);
  }, [showToast]);

  const handleImageSelect = useCallback((croppedDataUrl: string) => {
    setPreviewUrl(croppedDataUrl);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); handleFileChange(e.dataTransfer.files[0]); }, [handleFileChange]);
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback(() => { setIsDragOver(false); }, []);

  const updateField = <K extends keyof CardFormData>(field: K, value: CardFormData[K]) => { setFormData(prev => ({ ...prev, [field]: value })); setErrors(prev => { const next = { ...prev }; delete next[field]; return next; }); };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'El nombre es requerido';
    else if (formData.title.length > 50) newErrors.title = 'Máximo 50 caracteres';
    if (!formData.subtype) newErrors.subtype = 'Selecciona un subtipo';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    else if (formData.description.length > 500) newErrors.description = 'Máximo 500 caracteres';
    if (!formData.artist.trim()) newErrors.artist = 'El artista es requerido';
    if (showStats) { if (formData.attack === undefined) newErrors.attack = 'Valor requerido'; if (formData.life === undefined) newErrors.life = 'Valor requerido'; }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) { showToast('error', 'Por favor completa todos los campos requeridos'); return; }
    if (!previewUrl) { showToast('error', 'Debes subir una imagen para la carta'); return; }
    setLoading(true);
    try {
      let imageUrl = previewUrl;
      
      if (formData.image) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', formData.image);
        
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/upload`, {
          method: 'POST',
          body: formDataUpload
        });
        
        if (response.ok) {
          const data = await response.json();
          imageUrl = data.url;
        }
      }
      
      if (user && imageUrl) { await cardService.createCard(user.uid, formData, imageUrl); showToast('success', '¡Carta creada exitosamente!'); navigate('/my-cards'); }
    } catch (err) { console.error('Error creating card:', err); showToast('error', 'Error al crear la carta.'); }
    finally { setLoading(false); }
  };

  if (!user) { navigate('/login'); return null; }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>⚔ Crear Nueva Carta</h1>
      <p className={styles.subtitle}>Diseña tu carta perfecta para Argentum</p>
      <div className={styles.content}>
        <div className={styles.formSection}>
          <div className={`${styles.imageUpload} ${isDragOver ? styles.dragOver : ''}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={() => fileInputRef.current?.click()}>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            {previewUrl ? (
              <div className={styles.imagePreview}>
                <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                <div className={styles.imageButtons}>
                  <Button variant="secondary" size="small" onClick={(e) => { e.stopPropagation(); setShowSelector(true); }}>Editar</Button>
                  <Button variant="ghost" size="small" onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setOriginalImageUrl(null); }}>Eliminar</Button>
                </div>
              </div>
            ) : <><div className={styles.uploadIcon}>🎨</div><p className={styles.uploadText}>Arrastra una imagen o <span>haz clic para seleccionar</span><br />JPG, PNG o WebP (máx 10MB)</p></>}
          </div>
          
          {originalImageUrl && (
            <ImageSelector
              isOpen={showSelector}
              onClose={() => setShowSelector(false)}
              imageSrc={originalImageUrl}
              onSelect={handleImageSelect}
            />
          )}
          <FormGroup><Label htmlFor="title" required>Nombre de la Carta</Label><Input id="title" value={formData.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Ej: Guerrero de Argentum" maxLength={50} error={errors.title} /></FormGroup>
          <FormGroup><Label htmlFor="type" required>Tipo</Label><Select id="type" options={CARD_TYPES} value={formData.type} onChange={(e) => updateField('type', e.target.value as CardType)} /></FormGroup>
          <FormGroup><Label htmlFor="subtype" required>Subtipo</Label><Select id="subtype" options={subtypes.map(s => ({ value: s, label: s }))} value={formData.subtype} onChange={(e) => updateField('subtype', e.target.value)} placeholder="Selecciona un subtipo" error={errors.subtype} /></FormGroup>
          <FormGroup><Label htmlFor="description" required>Descripción</Label><Textarea id="description" value={formData.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Describe las habilidades y efectos..." maxLength={500} error={errors.description} /></FormGroup>
          {showStats && <div className={styles.statsRow}><FormGroup><Label htmlFor="attack" required>Ataque</Label><Input type="number" id="attack" value={formData.attack ?? ''} onChange={(e) => updateField('attack', e.target.value ? parseInt(e.target.value) : undefined)} min={0} max={99} error={errors.attack} /></FormGroup><FormGroup><Label htmlFor="life" required>Vida</Label><Input type="number" id="life" value={formData.life ?? ''} onChange={(e) => updateField('life', e.target.value ? parseInt(e.target.value) : undefined)} min={0} max={99} error={errors.life} /></FormGroup></div>}
          <FormGroup><Label htmlFor="manaCost" required>Costo de Maná</Label><Input type="number" id="manaCost" value={formData.manaCost} onChange={(e) => updateField('manaCost', parseInt(e.target.value) || 0)} min={0} max={20} /></FormGroup>
          <FormGroup><Label htmlFor="artist" required>Artista/Ilustrador</Label><Input id="artist" value={formData.artist} onChange={(e) => updateField('artist', e.target.value)} placeholder="Nombre del artista" error={errors.artist} /></FormGroup>
          <div className={styles.actions}><Button variant="secondary" onClick={() => navigate('/')}>Cancelar</Button><Button onClick={handleSubmit} loading={loading} disabled={loading}>Enviar para Revisión</Button></div>
        </div>
        <div className={styles.previewSection}>
          <h3 className={styles.previewTitle}>Vista Previa</h3>
          <div className={styles.cardPreview}>
            <div className={styles.cardPreviewInner}>
              <img src={previewUrl || ''} alt="Art" className={styles.cardArt} style={!previewUrl ? { background: 'linear-gradient(135deg, #2a2a4a 0%, #1a1a2e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}} />
              <div className={styles.cardInfo}>
                <div className={styles.cardHeader}><span className={styles.cardName}>{formData.title || 'Nombre de la Carta'}</span><span className={styles.cardMana}>{formData.manaCost}</span></div>
                <span className={styles.cardType}>{formData.subtype || 'Subtipo'} — {formData.type}</span>
                <p className={styles.cardDesc}>{formData.description || 'Descripción de la carta...'}</p>
                {showStats && <div className={styles.cardStats}>{formData.attack !== undefined && <span className={`${styles.cardStat} ${styles.attack}`}>{formData.attack}</span>}{formData.life !== undefined && <span className={`${styles.cardStat} ${styles.life}`}>{formData.life}</span>}</div>}
                {formData.artist && <span className={styles.artistCredit}>Art: {formData.artist}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CreateCard;
