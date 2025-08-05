
import React, { useState, useCallback, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop, type PercentCrop } from 'react-image-crop';
import { ProcessedImage, StoredCrop } from '../types';
import Icon from './Icon';

interface ImageCropperProps {
  image: ProcessedImage;
  aspect: number;
  onCropComplete: (crop: StoredCrop) => void;
  onBack: () => void;
  isFirstImage: boolean;
  isLastImage: boolean;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ image, aspect, onCropComplete, onBack, isFirstImage, isLastImage }) => {
  const [crop, setCrop] = useState<PercentCrop>();
  const [currentAspect, setCurrentAspect] = useState(aspect);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget; // Use displayed dimensions
    const newCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90, // Use 90 to prevent overflow
        },
        currentAspect,
        width,
        height
      ),
      width,
      height
    );
    setCrop(newCrop);
  }, [currentAspect]);

  const handleCropComplete = () => {
    if (crop?.width && crop?.height) {
        // The crop state is in percentages. These percentages are relative to the
        // displayed image size, but they are equally applicable to the natural
        // image size to get the final crop in pixels.
        onCropComplete({
            x: (crop.x / 100) * image.width, // image.width is naturalWidth
            y: (crop.y / 100) * image.height, // image.height is naturalHeight
            width: (crop.width / 100) * image.width,
            height: (crop.height / 100) * image.height,
        });
    }
  };

  const flipRatio = () => {
    if (currentAspect !== 1) {
      const newAspect = 1 / currentAspect;
      setCurrentAspect(newAspect);

      const imageElement = imgRef.current;
      if (imageElement) {
        const { width, height } = imageElement;
        const newCrop = centerCrop(
          makeAspectCrop(
            {
              unit: '%',
              width: 90,
            },
            newAspect,
            width,
            height
          ),
          width,
          height
        );
        setCrop(newCrop);
      }
    }
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      <div className="w-full flex justify-center items-center mb-6 min-h-[60vh] bg-gray-900/50 rounded-lg p-4">
        {image.src ? (
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(_, percentCrop) => setCrop(percentCrop)}
            aspect={currentAspect}
            ruleOfThirds
          >
            <img
              ref={imgRef}
              src={image.src}
              onLoad={onImageLoad}
              alt="Image to crop"
              className="max-h-[60vh] object-contain"
            />
          </ReactCrop>
        ) : (
          <p>Loading image...</p>
        )}
      </div>

      <div className="w-full flex justify-between items-center mt-4">
        <button
          onClick={onBack}
          disabled={isFirstImage}
          className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Back
        </button>
        <div className="flex items-center gap-4">
            <button
              onClick={flipRatio}
              className="p-3 bg-gray-700 text-white font-semibold rounded-full shadow-md hover:bg-gray-600 transition transform hover:rotate-90"
              title="Flip aspect ratio"
            >
              <Icon icon="rotate" className="w-5 h-5"/>
            </button>
        </div>
        <button
          onClick={handleCropComplete}
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 transition"
        >
          {isLastImage ? 'Finish & Export' : 'Next Image'}
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;