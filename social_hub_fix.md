# Task: Fix Social Hub (CONEXÕES) Implementation

The user wants a fully functional "Instagram-like" social hub. Currently, post creation is failing, and camera/gallery access is not optimized for mobile web.

## 1. Diagnostics & Requirements
- [x] Identify Social Hub components (`SocialPostCreator.jsx`).
- [x] Check Media Services (`ImagePersistenceService.js`).
- [x] Verify Database Schema (`social_posts` table).
- [ ] Investigate why "Recentes" is empty and how to handle it in Web.
- [ ] Fix potential column mismatch in `social_posts`.

## 2. Infrastructure & Database Fixes
- [ ] Align `social_posts` column names between service and DB.
- [ ] Fix `tagged_user_ids` type (change from `uuid[]` to `text[]` to support CPFs).
- [ ] Ensure `posts_media` storage bucket exists.

## 3. Media Capture Optimization
- [ ] Update `ImagePersistenceService.capturePhoto` to use `capture="environment"` for camera source on web.
- [ ] Ensure `SocialPostCreator.jsx` calls the correct source.
- [ ] Implement a basic "media preview" in the "Recentes" area for the current selection if possible, or just keep it as a placeholder if legitimate gallery access is restricted by Web Sandbox.

## 4. Post Flow Finalization
- [ ] Fix the "Avançar" logic to ensure users can proceed after selecting media.
- [ ] Ensure `createPost` correctly handles all fields.
- [ ] Validate the "Tag Users" search and selection.

## 5. UI/UX Polishing
- [ ] Ensure the "Instagram" aesthetic is maintained (dark mode, glassmorphism where applicable).
- [ ] Add smooth transitions between steps.
