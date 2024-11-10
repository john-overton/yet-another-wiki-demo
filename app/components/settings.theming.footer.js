'use client';

const FooterLinks = ({ 
  footerLinks, 
  onAddLink, 
  onEditLink, 
  onDeleteLink,
  onHeaderChange 
}) => {
  const renderLinksList = (columnData, sectionName) => (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {columnData.links.map((link) => (
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
              onClick={() => onEditLink(link, sectionName)}
              className="text-gray-500 hover:text-blue-500 dark:hover:text-blue-400"
              title="Edit Link"
            >
              <i className="ri-edit-line text-xl"></i>
            </button>
            <button
              onClick={() => onDeleteLink(link, sectionName)}
              className="text-gray-500 hover:text-red-500 dark:hover:text-red-400"
              title="Delete Link"
            >
              <i className="ri-delete-bin-line text-xl"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Footer Column 1 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1 mr-4">
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
              Footer Links - Column 1 ({footerLinks.column1.links.length}/6)
            </label>
            <input
              type="text"
              value={footerLinks.column1.header}
              onChange={(e) => onHeaderChange('column1', e.target.value)}
              placeholder="Column 1 Header"
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This column will only be visible in the footer if it contains at least one link.
            </p>
          </div>
          <button
            onClick={() => onAddLink('footer1')}
            className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2 h-fit"
          >
            <i className="ri-add-line"></i>
            Add Link
          </button>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {footerLinks.column1.links.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No footer links added to column 1
            </div>
          ) : (
            renderLinksList(footerLinks.column1, 'footer1')
          )}
        </div>
      </div>

      {/* Footer Column 2 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1 mr-4">
            <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
              Footer Links - Column 2 ({footerLinks.column2.links.length}/6)
            </label>
            <input
              type="text"
              value={footerLinks.column2.header}
              onChange={(e) => onHeaderChange('column2', e.target.value)}
              placeholder="Column 2 Header"
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This column will only be visible in the footer if it contains at least one link.
            </p>
          </div>
          <button
            onClick={() => onAddLink('footer2')}
            className="px-4 py-2 bg-white shadow-lg dark:bg-gray-800 border border-gray-200 dark:text-white text-black hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center gap-2 h-fit"
          >
            <i className="ri-add-line"></i>
            Add Link
          </button>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {footerLinks.column2.links.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No footer links added to column 2
            </div>
          ) : (
            renderLinksList(footerLinks.column2, 'footer2')
          )}
        </div>
      </div>
    </div>
  );
};

export default FooterLinks;
