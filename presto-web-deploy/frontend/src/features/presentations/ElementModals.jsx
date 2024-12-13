import { useState } from 'react';
import { detectLanguage } from './constants';
import { FONT_FAMILIES } from './constants';

export const TextElementModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [data, setData] = useState({
    width: initialData?.width || '30',
    height: initialData?.height || '20',
    text: initialData?.text || '',
    fontSize: initialData?.fontSize || '1',
    color: initialData?.color || '#000000',
    fontFamily: initialData?.fontFamily || FONT_FAMILIES.Arail,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h3 className="text-lg font-semibold mb-4">Add Text Element</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(data);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Width (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={data.width}
              onChange={(e) => setData({ ...data, width: e.target.value })}
              className="mt-1 block w-full border rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Height (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={data.height}
              onChange={(e) => setData({ ...data, height: e.target.value })}
              className="mt-1 block w-full border rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Text</label>
            <textarea
              value={data.text}
              onChange={(e) => setData({ ...data, text: e.target.value })}
              className="mt-1 block w-full border rounded-md p-2"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Font Family</label>
            <select
              value={data.fontFamily}
              onChange={(e) => setData({ ...data, fontFamily: e.target.value })}
              className="mt-1 block w-full border rounded-md p-2"
            >
              {Object.entries(FONT_FAMILIES).map(([key, value]) => (
                <option key={key} value={value} style={{ fontFamily: value }}>
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Font Size (em)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={data.fontSize}
              onChange={(e) => setData({ ...data, fontSize: e.target.value })}
              className="mt-1 block w-full border rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <input
              type="color"
              value={data.color}
              onChange={(e) => setData({ ...data, color: e.target.value })}
              className="mt-1 block w-full"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {initialData ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ImageElementModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [data, setData] = useState({
    width: initialData?.width || '30',
    height: initialData?.height || '30',
    src: initialData?.src || '',
    alt: initialData?.alt || '',
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData({ ...data, src: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h3 className="text-lg font-semibold mb-4">Add Image Element</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(data);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Width (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={data.width}
              onChange={(e) => setData({ ...data, width: e.target.value })}
              className="mt-1 block w-full border rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Height (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={data.height}
              onChange={(e) => setData({ ...data, height: e.target.value })}
              className="mt-1 block w-full border rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL or File</label>
            <input
              type="text"
              value={data.src}
              onChange={(e) => setData({ ...data, src: e.target.value })}
              placeholder="Enter image URL"
              className="mt-1 block w-full border rounded-md p-2 mb-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Alt Text</label>
            <input
              type="text"
              value={data.alt}
              onChange={(e) => setData({ ...data, alt: e.target.value })}
              className="mt-1 block w-full border rounded-md p-2"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {initialData ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const VideoElementModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [data, setData] = useState({
    width: initialData?.width || '50',
    height: initialData?.height || '50',
    url: initialData?.url || '',
    autoplay: initialData?.autoplay || false,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h3 className="text-lg font-semibold mb-4">Add Video Element</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(data);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Width (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={data.width}
              onChange={(e) => setData({ ...data, width: e.target.value })}
              className="mt-1 block w-full border rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Height (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={data.height}
              onChange={(e) => setData({ ...data, height: e.target.value })}
              className="mt-1 block w-full border rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Embedded video Url</label>
            <input
              type="text"
              value={data.url}
              onChange={(e) => setData({ ...data, url: e.target.value })}
              placeholder="Enter video URL"
              className="mt-1 block w-full border rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.autoplay}
                onChange={(e) => setData({ ...data, autoplay: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Autoplay</span>
            </label>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {initialData ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CodeElementModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [data, setData] = useState({
    width: initialData?.width || '40',
    height: initialData?.height || '30',
    code: initialData?.code || '',
    fontSize: initialData?.fontSize || '1',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h3 className="text-lg font-semibold mb-4">Add Code Element</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          // Automatically detect language when submitting
          const language = detectLanguage(data.code);
          onSubmit({ ...data, language });
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Width (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={data.width}
              onChange={(e) => setData({ ...data, width: e.target.value })}
              className="mt-1 block w-full border rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Height (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={data.height}
              onChange={(e) => setData({ ...data, height: e.target.value })}
              className="mt-1 block w-full border rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Code</label>
            <textarea
              value={data.code}
              onChange={(e) => setData({ ...data, code: e.target.value })}
              className="mt-1 block w-full border rounded-md p-2 font-mono whitespace-pre"
              rows={6}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Font Size (em)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={data.fontSize}
              onChange={(e) => setData({ ...data, fontSize: e.target.value })}
              className="mt-1 block w-full border rounded-md p-2"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {initialData ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};