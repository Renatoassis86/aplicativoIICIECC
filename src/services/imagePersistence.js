import { supabase } from '../lib/supabase';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
    try {
      // 1. Tentar Modo Nativo (Capacitor)
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
      console.warn("[ImagePersistence] Nativo falhou ou cancelado, tentando Web Fallback...", err);
      
      // Se for apenas cancelado pelo usuário, parar aqui
      if (err.message?.includes('User cancelled')) return null;

      // 2. Fallback para Web (input invisível)
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return resolve(null);

          const reader = new FileReader();
          reader.onload = async () => {
            const dataUrl = reader.result;
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            
            resolve({
              webPath: dataUrl,
              blob: blob,
              format: file.type.split('/')[1]
            });
          };
          reader.readAsDataURL(file);
        };

        // Simula clique
        input.click();
      });
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
