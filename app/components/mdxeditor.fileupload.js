'use client';

import { realmPlugin, usePublisher } from '@mdxeditor/editor';
import { $createParagraphNode, $getSelection } from 'lexical';
import { $createLinkNode } from '@lexical/link';
import React from 'react';

// Create a toolbar icon component for file upload
export function InsertFile() {
  const insertFile = usePublisher('fileUpload');

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await fetch('/api/upload-file', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to upload file');
          }

          const data = await response.json();
          insertFile({ filename: file.name, url: data.url });
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
    };
    input.click();
  };

  return (
    <button
      className="toolbar-item"
      title="Add File"
      onClick={handleClick}
    >
      <i className="ri-file-line"></i>
    </button>
  );
}

// Create the actual plugin
export const fileUploadPlugin = realmPlugin({
  init(realm) {
    // Register the file upload handler
    realm.sub('fileUpload', ({ filename, url }) => {
      const editor = realm.getValue(realm.activeEditor$);
      if (!editor) return;

      editor.update(() => {
        const selection = $getSelection();
        if (selection) {
          // Create a link node using Lexical's built-in link functionality
          const linkNode = $createLinkNode(url);
          linkNode.setTextContent(filename);
          selection.insertNodes([linkNode]);
          
          // Insert a new paragraph after the link
          const paragraph = $createParagraphNode();
          linkNode.insertAfter(paragraph);
        }
      });
    });
  }
});
