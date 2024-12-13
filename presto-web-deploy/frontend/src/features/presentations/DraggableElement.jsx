import { useState, useEffect, useRef } from 'react';

export const DraggableElement = ({ 
  children, 
  onDoubleClick, 
  onContextMenu,
  onPositionChange,
  onSizeChange,
  style,
  selected,
  onClick
}) => {
  const elementRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startElementPos, setStartElementPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e) => {
      const slideContainer = elementRef.current.closest('.slide-container');
      const slideRect = slideContainer.getBoundingClientRect();

      if (isResizing) {
        e.preventDefault();

        // Calculate delta in percentage of slide size
        const deltaX = ((e.clientX - startPos.x) / slideRect.width) * 100;
        const deltaY = ((e.clientY - startPos.y) / slideRect.height) * 100;

        let newWidth = startSize.width;
        let newHeight = startSize.height;
        let newX = startElementPos.x;
        let newY = startElementPos.y;

        switch (resizeCorner) {
        case 'top-left':
          newWidth = Math.max(1, startSize.width - deltaX);
          newHeight = Math.max(1, startSize.height - deltaY);
          newX = Math.min(startElementPos.x + deltaX, startElementPos.x + startSize.width - 1);
          newY = Math.min(startElementPos.y + deltaY, startElementPos.y + startSize.height - 1);
          break;
        case 'top-right':
          newWidth = Math.max(1, startSize.width + deltaX);
          newHeight = Math.max(1, startSize.height - deltaY);
          newY = Math.min(startElementPos.y + deltaY, startElementPos.y + startSize.height - 1);
          break;
        case 'bottom-left':
          newWidth = Math.max(1, startSize.width - deltaX);
          newHeight = Math.max(1, startSize.height + deltaY);
          newX = Math.min(startElementPos.x + deltaX, startElementPos.x + startSize.width - 1);
          break;
        case 'bottom-right':
          newWidth = Math.max(1, startSize.width + deltaX);
          newHeight = Math.max(1, startSize.height + deltaY);
          break;
        }

        // Ensure element stays within slide boundaries
        if (newX + newWidth > 100) newWidth = 100 - newX;
        if (newY + newHeight > 100) newHeight = 100 - newY;
        if (newX < 0) {
          newWidth += newX;
          newX = 0;
        }
        if (newY < 0) {
          newHeight += newY;
          newY = 0;
        }

        // Update size and position
        onSizeChange({ width: newWidth, height: newHeight });
        onPositionChange({ x: newX, y: newY });
      } else if (isDragging) {
        const newX = ((e.clientX - startPos.x - slideRect.left) / slideRect.width) * 100;
        const newY = ((e.clientY - startPos.y - slideRect.top) / slideRect.height) * 100;

        // Constrain to slide boundaries
        const maxX = 100 - parseFloat(style.width);
        const maxY = 100 - parseFloat(style.height);
        const constrainedX = Math.max(0, Math.min(maxX, newX));
        const constrainedY = Math.max(0, Math.min(maxY, newY));

        onPositionChange({ x: constrainedX, y: constrainedY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, startPos, startSize, startElementPos, onPositionChange, onSizeChange, resizeCorner, style.width, style.height]);

  const handleCornerMouseDown = (e, corner) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeCorner(corner);
    setStartPos({
      x: e.clientX,
      y: e.clientY
    });
    setStartSize({
      width: parseFloat(style.width),
      height: parseFloat(style.height)
    });
    setStartElementPos({
      x: parseFloat(style.left),
      y: parseFloat(style.top)
    });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only handle left click
    e.stopPropagation();

    const elementRect = elementRef.current.getBoundingClientRect();
    setStartPos({
      x: e.clientX - elementRect.left,
      y: e.clientY - elementRect.top
    });
    setIsDragging(true);
    onClick?.();
  };

  return (
    <div
      ref={elementRef}
      style={{
        ...style,
        position: 'absolute',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      className={`transition-shadow ${selected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {children}
      {selected && (
        <>
          <div
            className="absolute top-0 left-0 w-[5px] h-[5px] bg-blue-500 cursor-nw-resize z-10"
            onMouseDown={(e) => handleCornerMouseDown(e, 'top-left')}
          />
          <div
            className="absolute top-0 right-0 w-[5px] h-[5px] bg-blue-500 cursor-ne-resize z-10"
            onMouseDown={(e) => handleCornerMouseDown(e, 'top-right')}
          />
          <div
            className="absolute bottom-0 left-0 w-[5px] h-[5px] bg-blue-500 cursor-sw-resize z-10"
            onMouseDown={(e) => handleCornerMouseDown(e, 'bottom-left')}
          />
          <div
            className="absolute bottom-0 right-0 w-[5px] h-[5px] bg-blue-500 cursor-se-resize z-10"
            onMouseDown={(e) => handleCornerMouseDown(e, 'bottom-right')}
          />
        </>
      )}
    </div>
  );
};