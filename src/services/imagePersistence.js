import { supabase } from '../lib/supabase';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

/**
 * Hub central para persistência de imagens no App.
 * Resolve definitivamente o upload para o Supabase Storage com fallback base64.
 */
export const ImagePersistenceService = {
  
  /**
   * Captura foto via Câmera ou Galeria usando o Plugin Nativo do Capacitor
   */
  async capturePhoto(source = CameraSource.Prompt) {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: source,
        width: 1024, // Limita largura para performance
        saveToGallery: false
      });

      return {
        webPath: image.webPath,
        blob: await fetch(image.webPath).then(r => r.blob()),
        format: image.format
      };
    } catch (err) {
      console.error("[ImagePersistence] Erro ao capturar:", err);
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
