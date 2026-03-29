# Deploy para iOS e Android (Capacitor)

Este projeto foi arquitetado como **Web App Progressivo (PWA)**, mas está integralmente preparado e configurado via **CapacitorJS** para ser empacotado e distribuído na Google Play Store (.aab/.apk) e Apple App Store (.ipa), sem necessidade de reescrever código usando React Native ou Swift.

## Como as ferramentas de PWA viram App Nativo?

A injeção do `@capacitor/camera` no código React se encarrega de chamar a API nativa da Câmera do Sistema Operacional quando um Patrocinador tenta clicar no ícone da Câmera dentro do *Hub Digital CIECC*.

## Passos Oficiais de Lançamento (Release Flow)

### 1. Build de Produção
Sempre que fizer uma alteração em React e desejar ver isso refletido nos celulares físicos, você deve compilar os estáticos (Javascript -> HTML/CSS Minificado):
```bash
npm run build
```

### 2. Adicionar/Atualizar Plataformas Nativas
Com sua IDE nativa instalada (Android Studio ou Xcode), adicione a plataforma desejada na raiz deste mesmo projeto do Windows/Mac:

```bash
# Para gerar o projeto Android:
npx cap add android

# Para gerar o projeto iOS (Requer ambiente Mac):
npx cap add ios
```

Sempre que rodar `npm run build` após isso, *sincronize* a pasta `dist` com as pastas recém-criadas `ios` e `android` rodando:
```bash
npx cap sync
```

### 3. Abrir e Compilar nas IDEs Nativas
Para Android Play Store:
```bash
npx cap open android
```
*(No Android Studio, acesse o menu `Build > Generate Signed Bundle / APK` para preparar o release para a Google Play Console.)*

Para Apple App Store:
```bash
npx cap open ios
```
*(No Xcode, insira seu time de desenvolvimento da Apple e acesse `Product > Archive` para enviar ao App Store Connect.)*

---
**Nota Técnica:** Modificadores de permissões de Câmera e Galeria (`AndroidManifest.xml` e `Info.plist`) devem ser ajustados dentro das respectivas pastas caso a loja exija política de autorização expressa do usuário do congresso.
