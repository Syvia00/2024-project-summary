export const Toast = ({ message, type = 'error', onClose }) => {
  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
      <div className="flex items-center gap-2">
        <span>{message}</span>
        <button onClick={onClose} className="text-sm hover:opacity-70">×</button>
      </div>
    </div>
  );
};