const Alert = ({ type = 'error', message, onClose }) => {
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-700',
    success: 'border-green-200 bg-green-50 text-green-700',
    info: 'border-blue-200 bg-blue-50 text-blue-700',
  };

  if (!message) return null;

  return (
    <div className={`relative rounded-lg border px-4 py-3 text-sm ${styles[type]}`}>
      {message}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-current opacity-60 hover:opacity-100"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
