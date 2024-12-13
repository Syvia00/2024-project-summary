import { DraggableElement } from "./DraggableElement"; 

const getElementStyle = (element) => ({
  position: 'absolute',
  width: `${element.width}%`,
  height: `${element.height}%`,
  left: `${element.x}%`,
  top: `${element.y}%`,
  border: '1px solid #e5e7eb',
  backgroundColor: 'white', 
  padding: '8px', 
  overflow: 'hidden', 
  borderRadius: '4px', 
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
});

export const TextElement = ({ element, selected, onDoubleClick, onContextMenu, onClick, onPositionChange, onSizeChange }) => {
  return (
    <DraggableElement
      style={{
        ...getElementStyle(element),
        fontSize: `${element.fontSize}em`,
        color: element.color,
        fontFamily: element.fontFamily || 'Arial, sans-serif',
        overflow: 'hidden',
        textAlign: 'left',
      }}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onPositionChange={onPositionChange}
      onSizeChange={onSizeChange}
      selected={selected}
      onClick={onClick}
      className="select-none"
    >
      <div className="whitespace-pre-wrap">{element.text}</div>
    </DraggableElement>
  );
};

export const ImageElement = ({ element, selected, onDoubleClick, onContextMenu, onClick, onPositionChange, onSizeChange }) => {
  return (
    <DraggableElement
      style={getElementStyle(element)}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onPositionChange={onPositionChange}
      onSizeChange={onSizeChange}
      selected={selected}
      onClick={onClick}
      className="select-none"
    >
      <img
        src={element.src}
        alt={element.alt}
        className="w-full h-full object-contain"
      />
    </DraggableElement>
  );
};

export const VideoElement = ({ element, selected, onDoubleClick, onContextMenu, onClick, onPositionChange, onSizeChange }) => {
  return (
    <DraggableElement
      style={getElementStyle(element)}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onPositionChange={onPositionChange}
      onSizeChange={onSizeChange}
      selected={selected}
      onClick={onClick}
      className="select-none"
    >
      <iframe
        src={`${element.url}${element.autoplay ? '&autoplay=1' : ''}`}
        width="100%"
        height="100%"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </DraggableElement>
  );
};

const getLanguageStyles = (language) => {
  switch (language) {
  case 'python':
    return {
      backgroundColor: '#f3f4f6', // Light gray for Python
      color: '#374151',
    };
  case 'javascript':
    return {
      backgroundColor: '#fef3c7', // Light yellow for JavaScript
      color: '#92400e',
    };
  case 'c':
    return {
      backgroundColor: '#e0f2fe', // Light blue for C
      color: '#075985',
    };
  default:
    return {
      backgroundColor: '#f3f4f6',
      color: '#374151',
    };
  };
};

export const CodeElement = ({ element, selected, onDoubleClick, onContextMenu, onClick, onPositionChange, onSizeChange }) => {
  const languageStyle = getLanguageStyles(element.language);

  return (
    <DraggableElement
      style={{
        ...getElementStyle(element),
        ...languageStyle,
      }}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      className="select-none"
      onPositionChange={onPositionChange}
      onSizeChange={onSizeChange}
      selected={selected}
      onClick={onClick}
    >
      <pre
        style={{ 
          fontSize: `${element.fontSize}em`,
          margin: 0,
          height: '100%',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
        className="overflow-auto"
      >
        {element.code}
      </pre>
    </DraggableElement>
  );
};