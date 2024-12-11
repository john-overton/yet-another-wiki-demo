'use client';

const SavePromptModal = ({ isOpen, onSave, onDiscard, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <i className="ri-save-line text-2xl mr-2 text-gray-600 dark:text-gray-400"></i>
            <h3 className="text-lg font-semibold">Save Changes?</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          You have unsaved changes. Would you like to save them before leaving?
        </p>

        <div className="flex justify-end gap-4">
          <button
            onClick={onDiscard}
            className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2"
          >
            <i className="ri-delete-bin-line"></i>
            Discard
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2"
          >
            <i className="ri-save-line"></i>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavePromptModal;
