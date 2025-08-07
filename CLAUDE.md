# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Image Cropper Utility - a modern React-based web application built with Vite that allows users to upload multiple images (including HEIC format), crop them with different aspect ratios, and export them as JPGs while preserving EXIF metadata.

## Development Commands

### Running the Application
- `npm install` - Install all dependencies
- `npm run dev` - Start Vite development server (default port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix

### Testing
- No test framework is currently configured

## Architecture

### Application Flow
The application follows a state machine pattern with 5 main states:
1. **UPLOADING** - User selects/drops image files
2. **RATIO_SELECTION** - User chooses aspect ratio for cropping
3. **CROPPING** - User crops each image individually
4. **EXPORTING** - System processes crops and creates ZIP file
5. **DONE** - Display results and allow restart

### Core Components Structure
- `src/App.tsx` - Main application with state management and orchestration
- `src/main.tsx` - Vite entry point
- `src/components/` - Reusable UI components:
  - `FileUploader.tsx` - Drag & drop file selection
  - `RatioSelector.tsx` - Aspect ratio selection interface
  - `ImageCropper.tsx` - Interactive cropping interface using react-image-crop
  - `Spinner.tsx` - Loading indicator
  - `Icon.tsx` - SVG icon components
- `src/services/imageUtils.ts` - Core image processing logic
- `src/types.ts` - TypeScript interfaces and enums
- `src/constants.ts` - Application constants (aspect ratios, file size limits)
- `src/index.css` - Global styles with Tailwind imports

### Key Technologies
- **React 19.1** - UI framework with latest features (Actions, Server Components support)
- **TypeScript 5.6** - Type safety and modern JS features
- **Vite 6** - Fast build tool and development server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **ESLint** - Code linting with TypeScript support
- **Bundled Dependencies**:
  - `heic2any` - HEIC/HEIF to JPEG conversion (bundled)
  - `piexifjs` - EXIF metadata handling (bundled)
  - `jszip` - ZIP file creation (bundled)
  - `react-image-crop` - Interactive cropping UI (bundled)

### Image Processing Pipeline
1. File validation (size limit: 25MB)
2. HEIC/HEIF conversion to JPEG if needed
3. EXIF data extraction (for JPEG files)
4. Object URL creation for display
5. Interactive cropping with aspect ratio constraints
6. Canvas-based crop generation with EXIF preservation
7. ZIP archive creation and download

### Memory Management
The app properly handles object URL cleanup to prevent memory leaks using useEffect cleanup functions in App.tsx.

### Error Handling
Comprehensive error handling throughout the pipeline with user-friendly error messages displayed in the UI for failed file processing or export operations.

## Important Notes

- This is a client-side only application with no backend dependencies
- All image processing happens in the browser
- Modern Vite-based build system with hot module replacement
- TypeScript strict mode enabled with comprehensive linting
- Uses ES modules and modern JavaScript features
- All dependencies are bundled (no CDN dependencies)
- Build artifacts are generated in `dist/` directory
- Larger bundle size (~448KB gzipped) due to image processing libraries