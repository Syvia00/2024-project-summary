export const PresentationCard = ({ presentation, onClick }) => {
  const { name, thumbnail, description, slides = [] } = presentation;
  
  return (
    <div 
      onClick={onClick}
      className="cursor-pointer group relative aspect-[2/1] min-w-[100px] bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      <div className="absolute inset-0 p-4 flex flex-col">
        <div className="flex-shrink-0 h-1/2 bg-gray-200 rounded mb-2">
          {thumbnail ? (
            <img 
              src={thumbnail} 
              alt={name} 
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 rounded flex items-center justify-center">
              <span className="text-gray-500">No thumbnail</span>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
          {description && (
            <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
          )}
          <p className="text-sm text-gray-400 mt-1">
            {slides.length} {slides.length === 1 ? 'slide' : 'slides'}
          </p>
        </div>
      </div>
    </div>
  );
};