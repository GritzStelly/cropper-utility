# Image Cropper Utility

An advanced image cropper that allows you to upload multiple files (including HEIC), select an aspect ratio, crop each image individually, and export them as JPGs with metadata preserved. This project is built with React and TypeScript, running directly in the browser without a build step.

## Features

- **Multi-File Upload**: Upload multiple images at once via file selection or drag & drop.
- **HEIC/HEIF Support**: Automatically converts HEIC/HEIF files to JPG.
- **Aspect Ratio Presets**: Choose from common ratios like 1:1, 4:5, 16:9, etc.
- **Interactive Cropping**: An intuitive cropping UI for each image with aspect ratio locking and flipping.
- **Metadata Preservation**: Preserves EXIF metadata from original JPGs into the cropped output.
- **Bulk Export**: Downloads all cropped images in a single `.zip` file.
- **Responsive Design**: Works on both desktop and mobile devices.

## How to Use

Since this project doesn't require a build step, you can run it in a few different ways:

### 1. Deploy to a Static Host

You can deploy this repository directly to any static web host, such as GitHub Pages, Netlify, or Vercel.

### 2. Run Locally

To run this on your local machine, you need a simple web server to serve the files.

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <repo-name>
    ```

2.  **Install dependencies and start the server:**
    If you have Node.js and `npm` installed, you can use the included `serve` package:
    ```bash
    # Install the local dependency
    npm install
    
    # Start the server
    npm start
    ```
    Then, open `http://localhost:3000` in your browser.

    Alternatively, you can use any other static server. For example, with Python 3:
    ```bash
    python -m http.server
    ```
    Then, open `http://localhost:8000` in your browser.


## Tech Stack

- **Framework/Libraries**: React (via CDN)
- **Language**: TypeScript (transpiled in-browser by Babel)
- **Styling**: Tailwind CSS (via CDN)
- **Key Dependencies (CDN)**:
  - `heic2any`: For HEIC/HEIF conversion.
  - `piexifjs`: For EXIF metadata handling.
  - `jszip`: For creating `.zip` archives.
  - `react-image-crop`: For the cropping UI.
