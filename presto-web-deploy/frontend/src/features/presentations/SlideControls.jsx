import { useEffect } from 'react';

export const SlideControls = ({ 
  currentSlideIndex, 
  totalSlides, 
  onPrevious, 
  onNext, 
  onNew, 
  onDelete 
}) => {
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft' && currentSlideIndex > 0) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && currentSlideIndex < totalSlides - 1) {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlideIndex, totalSlides, onPrevious, onNext]);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Navigation Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onPrevious}
          disabled={currentSlideIndex === 0}
          className={`p-2 rounded-full ${
            currentSlideIndex === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          ←
        </button>
        <button
          onClick={onNext}
          disabled={currentSlideIndex === totalSlides - 1}
          className={`p-2 rounded-full ${
            currentSlideIndex === totalSlides - 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          →
        </button>
      </div>

      {/* Slide Management Controls */}
      <div className="flex space-x-4">
        <button
          onClick={onNew}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Add New Slide
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Delete Slide
        </button>
      </div>
    </div>
  );
};