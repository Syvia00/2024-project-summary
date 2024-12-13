import { useState } from 'react';
import { ELEMENT_TYPES } from './constants';

export const SlideToolbar = ({ onAddElement }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-lg p-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-2 w-full text-gray-600 hover:text-gray-900"
      >
        {isExpanded ? '←' : '→'}
      </button>
      {isExpanded && (
        <div className="space-y-2">
          <button
            onClick={() => onAddElement(ELEMENT_TYPES.TEXT)}
            className="w-full px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Add Text
          </button>
          <button
            onClick={() => onAddElement(ELEMENT_TYPES.IMAGE)}
            className="w-full px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            Add Image
          </button>
          <button
            onClick={() => onAddElement(ELEMENT_TYPES.VIDEO)}
            className="w-full px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
          >
            Add Video
          </button>
          <button
            onClick={() => onAddElement(ELEMENT_TYPES.CODE)}
            className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Add Code
          </button>
        </div>
      )}
    </div>
  );
};