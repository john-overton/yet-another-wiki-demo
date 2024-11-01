'use client';

const DeleteConfirmModal = ({ isOpen, onConfirm, onCancel, itemTitle, hasChildren }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2001]">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <i className="ri-delete-bin-line text-2xl mr-2 text-gray-600 dark:text-gray-400"></i>
            <h3 className="text-lg font-semibold">Delete Confirmation</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Are you sure you want to delete "{itemTitle}"?
        </p>
        
        {hasChildren && (
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This item has child pages. Do you want to delete them as well?
          </p>
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2"
          >
            <i className="ri-close-line"></i>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg flex items-center gap-2"
          >
            <i className="ri-delete-bin-line"></i>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
