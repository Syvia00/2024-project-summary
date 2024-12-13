import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  EditTitleModal,
  DeleteConfirmModal,
  TextElementModal,
  ImageElementModal,
  VideoElementModal,
  CodeElementModal,
  BackgroundModal,
  TextElement,
  ImageElement,
  VideoElement,
  CodeElement,
  SlideToolbar,
  ELEMENT_TYPES,
  BACKGROUND_TYPES,
  // DraggableElement,
} from '../features/presentations';

export const PresentationEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showEditTitle, setShowEditTitle] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [showError, setShowError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [editingElement, setEditingElement] = useState(null);

  const fetchPresentation = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5005/store', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const found = data.store.presentations?.find(p => p.id === id);
      if (found) {
        setPresentation(found);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch presentation:', error);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const handleUpdateTitle = async (newTitle) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5005/store', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      const updatedPresentations = data.store.presentations.map(p => 
        p.id === id ? { ...p, name: newTitle } : p
      );

      await fetch('http://localhost:5005/store', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store: {
            ...data.store,
            presentations: updatedPresentations,
          },
        }),
      });

      setPresentation(prev => ({ ...prev, name: newTitle }));
    } catch (error) {
      console.error('Failed to update title:', error);
    }
  };

  const handleUpdateThumbnail = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5005/store', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        
        const updatedPresentations = data.store.presentations.map(p => 
          p.id === id ? { ...p, thumbnail: base64String } : p
        );

        await fetch('http://localhost:5005/store', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            store: {
              ...data.store,
              presentations: updatedPresentations,
            },
          }),
        });

        setPresentation(prev => ({ ...prev, thumbnail: base64String }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to update thumbnail:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5005/store', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      const updatedPresentations = data.store.presentations.filter(p => p.id !== id);

      await fetch('http://localhost:5005/store', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store: {
            ...data.store,
            presentations: updatedPresentations,
          },
        }),
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete presentation:', error);
    }
  };

  const handlePreviousSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  }, [currentSlideIndex]);

  const handleNextSlide = useCallback(() => {
    if (currentSlideIndex < presentation.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  }, [currentSlideIndex, presentation?.slides.length]);

  const handleNewSlide = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5005/store', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      const newSlide = {
        id: Date.now().toString(),
        elements: [],
      };

      const updatedPresentation = {
        ...presentation,
        slides: [...presentation.slides, newSlide],
      };

      const updatedPresentations = data.store.presentations.map(p => 
        p.id === id ? updatedPresentation : p
      );

      await fetch('http://localhost:5005/store', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store: {
            ...data.store,
            presentations: updatedPresentations,
          },
        }),
      });

      setPresentation(updatedPresentation);
      setCurrentSlideIndex(updatedPresentation.slides.length - 1); // Navigate to new slide
    } catch (error) {
      console.error('Failed to create new slide:', error);
    }
  };

  const handleDeleteSlide = async () => {
    if (presentation.slides.length <= 1) {
      setShowError('Cannot delete the only slide. Delete the presentation instead.');
      setTimeout(() => setShowError(''), 3000); // Clear error after 3 seconds
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5005/store', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      const updatedSlides = presentation.slides.filter((_, index) => index !== currentSlideIndex);
      const updatedPresentation = {
        ...presentation,
        slides: updatedSlides,
      };

      const updatedPresentations = data.store.presentations.map(p => 
        p.id === id ? updatedPresentation : p
      );

      await fetch('http://localhost:5005/store', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store: {
            ...data.store,
            presentations: updatedPresentations,
          },
        }),
      });

      setPresentation(updatedPresentation);
      // Navigate to previous slide or stay at current index if it's the first slide
      setCurrentSlideIndex(prev => Math.min(prev, updatedSlides.length - 1));
    } catch (error) {
      console.error('Failed to delete slide:', error);
    }
  };

  // Function to handle adding elements
  const handleAddElement = (type) => {
    setActiveModal(type);
    setEditingElement(null);
  };

  // Function to handle element creation
  const handleElementCreate = (type, elementData) => {
    const currentSlide = presentation.slides[currentSlideIndex];
    const newElement = {
      id: Date.now().toString(),
      type,
      ...elementData,
    };

    const updatedSlides = [...presentation.slides];
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: [...(currentSlide.elements || []), newElement],
    };

    updatePresentation({
      ...presentation,
      slides: updatedSlides,
    });

    setActiveModal(null);
  };

  // Function to handle element update
  const handleElementUpdate = (elementId, elementData) => {
    const currentSlide = presentation.slides[currentSlideIndex];
    const updatedElements = currentSlide.elements.map(element =>
      element.id === elementId ? { ...element, ...elementData } : element
    );

    const updatedSlides = [...presentation.slides];
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: updatedElements,
    };

    updatePresentation({
      ...presentation,
      slides: updatedSlides,
    });

    setActiveModal(null);
    setEditingElement(null);
  };

  // Function to handle element deletion
  const handleElementDelete = (elementId) => {
    const currentSlide = presentation.slides[currentSlideIndex];
    const updatedElements = currentSlide.elements.filter(
      element => element.id !== elementId
    );

    const updatedSlides = [...presentation.slides];
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: updatedElements,
    };

    updatePresentation({
      ...presentation,
      slides: updatedSlides,
    });
  };

  // Function to handle double click on element
  const handleElementDoubleClick = (element) => {
    setEditingElement(element);
    setActiveModal(element.type);
  };

  // Function to handle right click on element
  const handleElementRightClick = (e, elementId) => {
    e.preventDefault();
    handleElementDelete(elementId);
  };

  // Add these state variables at the top with other states
  const [selectedElementId, setSelectedElementId] = useState(null);

  // Add these handler functions
  const handleElementSelect = (elementId) => {
    setSelectedElementId(elementId);
  };

  const handleElementPositionChange = async (elementId, newPosition) => {
    const currentSlide = presentation.slides[currentSlideIndex];
    const updatedElements = currentSlide.elements.map(element =>
      element.id === elementId
        ? { ...element, x: newPosition.x, y: newPosition.y }
        : element
    );

    const updatedSlides = [...presentation.slides];
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: updatedElements,
    };

    updatePresentation({
      ...presentation,
      slides: updatedSlides,
    });
  };

  // Helper function to update presentation
  const updatePresentation = async (updatedPresentation) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5005/store', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      const updatedPresentations = data.store.presentations.map(p => 
        p.id === id ? updatedPresentation : p
      );

      await fetch('http://localhost:5005/store', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store: {
            ...data.store,
            presentations: updatedPresentations,
          },
        }),
      });

      setPresentation(updatedPresentation);
    } catch (error) {
      console.error('Failed to update presentation:', error);
    }
  };

  // Function to render an element
  const renderElement = (element) => {
    const props = {
      key: element.id,
      element,
      onDoubleClick: () => handleElementDoubleClick(element),
      onContextMenu: (e) => handleElementRightClick(e, element.id),
      onClick: () => handleElementSelect(element.id),
      onPositionChange: (position) => handleElementPositionChange(element.id, position),
      onSizeChange: (size) => handleElementSizeChange(element.id, size),
      selected: selectedElementId === element.id
    };

    switch (element.type) {
    case ELEMENT_TYPES.TEXT:
      return <TextElement {...props} />;
    case ELEMENT_TYPES.IMAGE:
      return <ImageElement {...props} />;
    case ELEMENT_TYPES.VIDEO:
      return <VideoElement {...props} />;
    case ELEMENT_TYPES.CODE:
      return <CodeElement {...props} />;
    default:
      return null;
    }
  };

  // Function to get background style
  const getBackgroundStyle = (background) => {
    if (!background) return {};
  
    switch (background.type) {
    case BACKGROUND_TYPES.SOLID:
      return { backgroundColor: background.color };
    case BACKGROUND_TYPES.GRADIENT:
      return {
        background: `linear-gradient(${background.direction}, ${background.startColor}, ${background.endColor})`
      };
    case BACKGROUND_TYPES.IMAGE:
      return {
        backgroundImage: `url(${background.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    default:
      return {};
    }
  };
  
  // Add click handler to slide container to handle element selection
  const handleSlideClick = (e) => {
    // If clicked on the slide background, deselect current element
    if (e.target.classList.contains('slide-container')) {
      setSelectedElementId(null);
    }
  };

  // Background update handlers
  const handleUpdateSlideBackground = async (background) => {
    const updatedSlides = [...presentation.slides];
    updatedSlides[currentSlideIndex] = {
      ...updatedSlides[currentSlideIndex],
      background
    };
  
    const updatedPresentation = {
      ...presentation,
      slides: updatedSlides
    };
  
    updatePresentation(updatedPresentation);
  };
  
  const handleUpdateDefaultBackground = async (background) => {
    const updatedPresentation = {
      ...presentation,
      defaultBackground: background
    };
  
    updatePresentation(updatedPresentation);
  };

  // Element size change handler
  const handleElementSizeChange = async (elementId, newSize) => {
    const currentSlide = presentation.slides[currentSlideIndex];
    const updatedElements = currentSlide.elements.map(element =>
      element.id === elementId
        ? { ...element, width: newSize.width, height: newSize.height }
        : element
    );
  
    const updatedSlides = [...presentation.slides];
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: updatedElements,
    };
  
    await updatePresentation({
      ...presentation,
      slides: updatedSlides,
    });
  };

  useEffect(() => {
    fetchPresentation();
  }, [id, fetchPresentation]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!presentation) return;
      
      if (e.key === 'ArrowLeft') {
        handlePreviousSlide();
      } else if (e.key === 'ArrowRight') {
        handleNextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [presentation, currentSlideIndex, handlePreviousSlide, handleNextSlide]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading presentation...</p>
      </div>
    );
  }

  if (!presentation) {
    return null;
  }

  const currentSlide = presentation.slides[currentSlideIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-900">{presentation.name}</h1>
              <button
                onClick={() => setShowEditTitle(true)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                ✎
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Thumbnail upload button */}
            <label className="cursor-pointer px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              Update Thumbnail
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpdateThumbnail}
              />
            </label>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete Presentation
            </button>
          </div>
        </div>

        {/* Slide Display */}
        <div className="max-w-7xl mx-auto relative">
          <button
            onClick={() => setShowBackgroundModal(true)}
            className="absolute top-2 right-2 p-2 bg-white bg-opacity-50 hover:bg-opacity-100 rounded-full shadow-sm z-10"
          >
            🎨
          </button>
          
          <div 
            className="bg-white rounded-lg shadow-md p-8 min-h-[600px] relative mb-8 slide-container"
            onClick={handleSlideClick}
            style={getBackgroundStyle(currentSlide.background || presentation.defaultBackground)}
          >
            {/* Slide number */}
            <div className="absolute bottom-4 left-4 w-[50px] h-[50px] flex items-center justify-center text-gray-500">
              {currentSlideIndex + 1}
            </div>
            
            {/* Slide elements */}
            <div className="w-full h-[600px] relative bg-white">
              {currentSlide.elements?.map(renderElement)}
            </div>
          </div>
        </div>

        {/* Slide Controls */}
        <div className="flex flex-col items-center space-y-4">
          {/* Navigation Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePreviousSlide}
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
              onClick={handleNextSlide}
              disabled={currentSlideIndex === presentation.slides.length - 1}
              className={`p-2 rounded-full ${
                currentSlideIndex === presentation.slides.length - 1
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
              onClick={handleNewSlide}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add New Slide
            </button>
            <button
              onClick={handleDeleteSlide}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete Slide
            </button>
          </div>
        </div>
        {/* Background Modal */}
        <BackgroundModal
          isOpen={showBackgroundModal}
          onClose={() => setShowBackgroundModal(false)}
          currentSlideBackground={currentSlide.background}
          defaultBackground={presentation.defaultBackground}
          onUpdateSlideBackground={handleUpdateSlideBackground}
          onUpdateDefaultBackground={handleUpdateDefaultBackground}
        />
      </div>

      

      {/* Slide Toolbar */}
      <SlideToolbar onAddElement={handleAddElement} />

      {/* Element Modals */}
      <TextElementModal
        isOpen={activeModal === ELEMENT_TYPES.TEXT}
        onClose={() => {
          setActiveModal(null);
          setEditingElement(null);
        }}
        onSubmit={(data) => editingElement
          ? handleElementUpdate(editingElement.id, data)
          : handleElementCreate(ELEMENT_TYPES.TEXT, data)
        }
        initialData={editingElement}
      />

      <ImageElementModal
        isOpen={activeModal === ELEMENT_TYPES.IMAGE}
        onClose={() => {
          setActiveModal(null);
          setEditingElement(null);
        }}
        onSubmit={(data) => editingElement
          ? handleElementUpdate(editingElement.id, data)
          : handleElementCreate(ELEMENT_TYPES.IMAGE, data)
        }
        initialData={editingElement}
      />

      <VideoElementModal
        isOpen={activeModal === ELEMENT_TYPES.VIDEO}
        onClose={() => {
          setActiveModal(null);
          setEditingElement(null);
        }}
        onSubmit={(data) => editingElement
          ? handleElementUpdate(editingElement.id, data)
          : handleElementCreate(ELEMENT_TYPES.VIDEO, data)
        }
        initialData={editingElement}
      />

      <CodeElementModal
        isOpen={activeModal === ELEMENT_TYPES.CODE}
        onClose={() => {
          setActiveModal(null);
          setEditingElement(null);
        }}
        onSubmit={(data) => editingElement
          ? handleElementUpdate(editingElement.id, data)
          : handleElementCreate(ELEMENT_TYPES.CODE, data)
        }
        initialData={editingElement}
      />

      {/* Title and Delete Modals */}
      <EditTitleModal
        isOpen={showEditTitle}
        onClose={() => setShowEditTitle(false)}
        currentTitle={presentation.name}
        onSubmit={handleUpdateTitle}
      />
      
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />

      {/* Error Message */}
      {showError && (
        <div className="fixed top-4 right-4 bg-red-100 text-red-700 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <span>{showError}</span>
            <button 
              onClick={() => setShowError('')}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};