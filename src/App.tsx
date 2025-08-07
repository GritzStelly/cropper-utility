
import React, { useState, useCallback, useEffect } from 'react';
import { AppState, ProcessedImage, StoredCrop, CropError } from './types';
import { processFile, createCroppedImage, downloadImagesAsZip } from './services/imageUtils';
import FileUploader from './components/FileUploader';
import RatioSelector from './components/RatioSelector';
import ImageCropper from './components/ImageCropper';
import Spinner from './components/Spinner';
import Icon from './components/Icon';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOADING);
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [errors, setErrors] = useState<CropError[]>([]);
  const [selectedRatio, setSelectedRatio] = useState<number>(1);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [crops, setCrops] = useState<Record<string, StoredCrop>>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [exportedCount, setExportedCount] = useState<number>(0);

  useEffect(() => {
    // This is a cleanup effect. Whenever the `images` array is replaced or
    // the component unmounts, we revoke the object URLs to prevent memory leaks.
    return () => {
      images.forEach(image => {
        if (image.src && image.src.startsWith('blob:')) {
          URL.revokeObjectURL(image.src);
        }
      });
    };
  }, [images]);

  const handleFilesSelected = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    setErrors([]);
    const newImages: ProcessedImage[] = [];
    const newErrors: CropError[] = [];

    for (const file of files) {
      try {
        const processedImage = await processFile(file);
        newImages.push(processedImage);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        newErrors.push({ fileName: file.name, message });
      }
    }
    
    // When we set new images, the useEffect cleanup will run on the *old*
    // `images` array, correctly revoking any previous object URLs.
    setImages(newImages);
    setErrors(newErrors);
    setIsProcessing(false);

    if (newImages.length > 0) {
      setAppState(AppState.RATIO_SELECTION);
    }
  }, []);

  const handleRatioSelected = (ratio: number) => {
    setSelectedRatio(ratio);
    setAppState(AppState.CROPPING);
  };

  const handleCropComplete = (crop: StoredCrop) => {
    const imageId = images[currentIndex].id;
    const newCrops = { ...crops, [imageId]: crop };
    setCrops(newCrops);

    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setAppState(AppState.EXPORTING);
      handleExport(newCrops);
    }
  };
  
  const handleExport = async (finalCrops: Record<string, StoredCrop>) => {
    setIsProcessing(true);
    setErrors([]); // Clear previous upload errors before export
    const croppedImageBlobs: { name: string; blob: Blob }[] = [];
    const exportErrors: CropError[] = [];

    for (const image of images) {
        const crop = finalCrops[image.id];
        if (crop) {
            try {
                const blob = await createCroppedImage(image, crop);
                croppedImageBlobs.push({ name: image.name, blob });
            } catch (error) {
                console.error(`Failed to crop ${image.name}:`, error);
                exportErrors.push({ fileName: image.name, message: 'Failed during final crop.' });
            }
        }
    }
    
    if (croppedImageBlobs.length > 0) {
        try {
            await downloadImagesAsZip(croppedImageBlobs);
        } catch(error){
            console.error('Failed to create zip file', error);
            exportErrors.push({ fileName: 'ZIP Archive', message: 'Failed to create downloadable zip file.'});
        }
    }
    
    setExportedCount(croppedImageBlobs.length);
    setErrors(exportErrors);
    setIsProcessing(false);
    setAppState(AppState.DONE);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const handleReset = () => {
      setAppState(AppState.UPLOADING);
      // Setting images to [] will trigger the useEffect cleanup,
      // which handles revoking the object URLs.
      setImages([]);
      setErrors([]);
      setSelectedRatio(1);
      setCurrentIndex(0);
      setCrops({});
      setIsProcessing(false);
      setExportedCount(0);
  }

  const renderContent = () => {
    switch (appState) {
      case AppState.UPLOADING:
        return <FileUploader onFilesSelected={handleFilesSelected} isProcessing={isProcessing} errors={errors} />;
      case AppState.RATIO_SELECTION:
        return <RatioSelector onRatioSelected={handleRatioSelected} />;
      case AppState.CROPPING:
        if (images.length > 0 && currentIndex < images.length) {
          return (
            <>
              <div className="w-full text-center mb-4">
                  <p className="text-gray-400">Cropping image {currentIndex + 1} of {images.length}</p>
                  <p className="font-bold text-lg text-gray-200">{images[currentIndex].name}</p>
              </div>
              <ImageCropper
                image={images[currentIndex]}
                aspect={selectedRatio}
                onCropComplete={handleCropComplete}
                onBack={handleBack}
                isFirstImage={currentIndex === 0}
                isLastImage={currentIndex === images.length - 1}
              />
            </>
          );
        }
        return null;
      case AppState.EXPORTING:
        return <Spinner text="Generating and zipping your cropped images..." />;
      case AppState.DONE:
        const hadSuccess = exportedCount > 0;
        const hadErrors = errors.length > 0;
        
        let title = "All Done!";
        let icon: 'check' | 'warning' = 'check';
        let iconColor = 'text-green-400';

        if (hadErrors) {
            title = hadSuccess ? "Finished with some issues" : "Export Failed";
            icon = 'warning';
            iconColor = 'text-yellow-400';
        }

        return (
            <div className="text-center flex flex-col items-center gap-6">
                <Icon icon={icon} className={`w-24 h-24 ${iconColor}`} />
                <h2 className="text-3xl font-bold text-gray-100">{title}</h2>

                <p className="text-gray-400 max-w-md">
                  {hadSuccess && `Successfully exported ${exportedCount} of ${images.length} image(s). Your download should begin shortly.`}
                  {!hadSuccess && hadErrors && `Could not export any images. Please see the errors below.`}
                </p>

                {hadErrors && (
                    <div className="w-full max-w-md mt-2 p-4 bg-red-900/50 border border-red-700 rounded-lg text-left">
                        <h3 className="font-bold text-red-300 mb-2 flex items-center gap-2">
                            <Icon icon="warning" className="w-5 h-5" />
                            Errors:
                        </h3>
                        <ul className="list-disc list-inside text-red-300/90 text-sm space-y-1">
                            {errors.map((error, index) => (
                            <li key={index}>
                                <strong>{error.fileName}:</strong> {error.message}
                            </li>
                            ))}
                        </ul>
                    </div>
                )}

                <button
                    onClick={handleReset}
                    className="mt-4 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
                >
                    Start Over
                </button>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-10">
        <div className="flex items-center justify-center gap-4">
            <Icon icon="photo" className="w-12 h-12 text-indigo-400" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">Image Cropper Utility</h1>
        </div>
        <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">Upload, crop, and export multiple images with ease. Metadata preserved.</p>
      </header>
      <main className="w-full flex-grow flex items-center justify-center">
        <div key={appState} className="w-full animate-fade-in">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
