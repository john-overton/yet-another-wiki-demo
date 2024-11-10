'use client';

const HeaderLinks = ({ 
  links, 
  onAddLink, 
  onEditLink, 
  onDeleteLink 
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <label className="block font-medium text-gray-700 dark:text-gray-300">
          Header Navigation Links ({links.length}/5)
        </label>
        <button
          onClick={onAddLink}
          className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2"
        >
          <i className="ri-add-line"></i>
          Add Link
        </button>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {links.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No header links added yet
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {link.text}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {link.url}
                    {link.newTab && <span className="ml-2 text-xs">(opens in new tab)</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditLink(link)}
                    className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400"
                    title="Edit Link"
                  >
                    <i className="ri-edit-line text-xl"></i>
                  </button>
                  <button
                    onClick={() => onDeleteLink(link)}
                    className="text-gray-500 hover:text-red-500 dark:hover:text-red-400"
                    title="Delete Link"
                  >
                    <i className="ri-delete-bin-line text-xl"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderLinks;
