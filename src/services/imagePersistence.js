import { supabase } from '../lib/supabase';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

/**
 * Hub central para persistência de imagens no App.
 * Resolve definitivamente o upload para o Supabase Storage com fallback base64.
 */
export const ImagePersistenceService = {
  
  /**
   * Captura foto via Câmera ou Galeria usando o Plugin Nativo do Capacitor
   * com fallback robusto para Web (Input HTML5)
   */
  async capturePhoto(source = CameraSource.Prompt) {
    // 1. Fallback imediato para Web se não estiver em plataforma nativa
    // Isso garante que o gesto do usuário seja respeitado para abrir o Seletor/Câmera
    if (!Capacitor.isNativePlatform()) {
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        
        if (source === CameraSource.Camera) {
          input.setAttribute('capture', 'environment');
        }
        
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) return resolve(null);
          
          resolve({
            webPath: URL.createObjectURL(file),
            blob: file, 
            format: file.name ? file.name.split('.').pop() : file.type.split('/')[1]
          });
        };
        
        input.click();
      });
    }

    // 2. Modo Nativo (Capacitor) para iOS/Android
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.DataUrl, 
        source: source,
        width: 1024,
        saveToGallery: false
      });

      const response = await fetch(image.dataUrl);
      const blob = await response.blob();

      return {
        webPath: image.dataUrl,
        blob: blob,
        format: image.format
      };
    } catch (err) {
      console.warn("[ImagePersistence] Nativo falhou ou cancelado:", err);
      return null;
    }
  },

  /**
   * Faz o upload persistente para o Supabase Storage
   */
  async uploadToStorage(bucket, path, fileBlob) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, fileBlob, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return publicUrl;
    } catch (err) {
      console.warn("[ImagePersistence] Storage falhou, usando base64 fallback:", err);
      return await this.blobToBase64(fileBlob);
    }
  },

  /**
   * Converte blob para base64 para fallback ou preview
   */
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }
};
