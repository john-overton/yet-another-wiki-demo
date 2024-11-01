'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { bundleMDXContent } from '../actions/mdx';
import SortOrderEditor from './SortOrderEditor';
import {
  MDXEditor,
  UndoRedo,
  BoldItalicUnderlineToggles,
  toolbarPlugin,
  listsPlugin,
  quotePlugin,
  headingsPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  thematicBreakPlugin,
  frontmatterPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  sandpackPlugin,
  diffSourcePlugin,
  markdownShortcutPlugin,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  CodeToggle,
  ConditionalContents,
  InsertCodeBlock,
  ChangeCodeMirrorLanguage,
  DiffSourceToggleWrapper
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import '../styles/mdxeditor.css';
import { Open_Sans } from 'next/font/google';

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
});

const MDXRenderer = dynamic(() => import('./MDXRenderer'), { ssr: false });

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="error-message">Error rendering MDX content. Please check your markdown syntax.</div>;
    }
    return this.props.children;
  }
}

const MDXEditorComponent = ({ file, onSave, onCancel, refreshFileStructure, onChangesPending }) => {
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [title, setTitle] = useState(file.title);
  const [initialTitle, setInitialTitle] = useState(file.title);
  const [isPublic, setIsPublic] = useState(file.isPublic);
  const [initialIsPublic, setInitialIsPublic] = useState(file.isPublic);
  const [slug, setSlug] = useState(file.slug);
  const [initialSlug, setInitialSlug] = useState(file.slug);
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bundledContent, setBundledContent] = useState(null);
  const editorRef = useRef(null);

  // Track changes
  useEffect(() => {
    const hasContentChanged = content !== initialContent;
    const hasTitleChanged = title !== initialTitle;
    const hasSlugChanged = slug !== initialSlug;
    const hasPublicStateChanged = isPublic !== initialIsPublic;

    const hasChanges = hasContentChanged || 
      hasTitleChanged || 
      hasSlugChanged || 
      hasPublicStateChanged;

    // Pass both the change status and current editor state
    if (onChangesPending) {
      onChangesPending(hasChanges, hasChanges ? {
        content,
        title,
        slug,
        isPublic,
        path: file.path,
        sortOrder: file.sortOrder,
        children: file.children || []
      } : null);
    }
  }, [content, title, slug, isPublic, initialContent, initialTitle, initialSlug, initialIsPublic, onChangesPending, file]);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/file-content?path=${encodeURIComponent(file.path)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }
        
        const fileContent = await response.text();
        let actualContent = fileContent;
        try {
          const parsed = JSON.parse(fileContent);
          if (parsed.content) {
            actualContent = parsed.content;
          }
        } catch (e) {
          // If parsing fails, use the original content
          actualContent = fileContent;
        }

        setContent(actualContent);
        setInitialContent(actualContent);
        
        // Bundle the initial content
        const bundled = await bundleMDXContent(actualContent);
        if (bundled) {
          setBundledContent(bundled.code);
        }
      } catch (error) {
        console.error('Error fetching file content:', error);
        setErrorMessage('Failed to fetch file content. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, [file.path]);

  const handleImageUpload = async (image) => {
    try {
      const formData = new FormData();
      formData.append('file', image);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      if (!content || content.trim() === '') {
        setErrorMessage('Cannot save empty content');
        return;
      }

      const updatedFile = {
        ...file,
        content,
        title,
        isPublic,
        slug,
        lastModified: new Date().toISOString(),
        version: 1
      };

      await onSave(updatedFile);
      
      // Update initial values after successful save
      setInitialContent(content);
      setInitialTitle(title);
      setInitialSlug(slug);
      setInitialIsPublic(isPublic);
      setErrorMessage('');
    } catch (error) {
      console.error('Error saving file:', error);
      setErrorMessage(`An error occurred while saving the file: ${error.message}`);
    }
  };

  const handleEditorChange = (newContent) => {
    setContent(newContent);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleSortOrderChange = async (path, newSortOrder) => {
    try {
      await refreshFileStructure();
    } catch (error) {
      console.error('Error refreshing file structure:', error);
      setErrorMessage('Failed to refresh file structure. Please try again.');
    }
  };

  const codeBlockLanguages = {
    'text': 'Plain Text',
    'c': 'C',
    'c++': 'C++',
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'jsx': 'React JSX',
    'tsx': 'React TSX',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'json': 'JSON',
    'yaml': 'YAML',
    'markdown': 'Markdown',
    'sql': 'SQL',
    'python': 'Python',
    'java': 'Java',
    'ruby': 'Ruby',
    'php': 'PHP',
    'bash': 'Bash',
    'shell': 'Shell',
    'plaintext': 'Plain Text',
    'diff': 'Diff',
    'git': 'Git',
    'graphql': 'GraphQL',
    'docker': 'Docker',
    'nginx': 'Nginx',
    'xml': 'XML'
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Page Title</label>
            <input
              type="text"
              value={title || ''}
              onChange={(e) => setTitle(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">URL Slug</label>
            <input
              type="text"
              value={slug || ''}
              onChange={(e) => setSlug(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <SortOrderEditor file={file} onSortOrderChange={handleSortOrderChange} />
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <i className={isPublic ? "ri-eye-line" : "ri-eye-off-line"}></i>
                <span className={isPublic ? "" : "text-gray-500"}>Public</span>
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsPreview(!isPreview)}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                style={{ fontSize: '1.5rem' }}
                title="Preview"
              >
                <i className="ri-eye-line"></i>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                style={{ fontSize: '1.5rem' }}
                title="Cancel"
              >
                <i className="ri-close-line"></i>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                style={{ fontSize: '1.5rem' }}
                title="Save"
              >
                <i className="ri-save-line"></i>
              </button>
            </div>
          </div>
        </div>
        {errorMessage && (
          <div className="text-red-500 mb-4">{errorMessage}</div>
        )}
        {isPreview ? (
          <div className="flex-grow overflow-auto">
            <MDXRenderer code={bundledContent} />
          </div>
        ) : (
          <ErrorBoundary>
            <MDXEditor
              ref={editorRef}
              markdown={content}
              onChange={handleEditorChange}
              contentEditableClassName="mdxeditor-content-editable"
              className={`${openSans.className} mdxeditor flex-grow p-2 dark:bg-gray-800 rounded ${theme === 'dark' ? 'dark-theme' : ''}`}
              plugins={[
                toolbarPlugin({
                  toolbarContents: () => (
                    <DiffSourceToggleWrapper>
                      <UndoRedo />
                      <BoldItalicUnderlineToggles />
                      <BlockTypeSelect />
                      <CreateLink />
                      <InsertImage />
                      <InsertTable />
                      <InsertThematicBreak />
                      <ListsToggle />
                      <CodeToggle />
                      <ConditionalContents
                        options={[
                          {
                            when: (editor) => editor?.editorType === 'codeblock',
                            contents: () => <ChangeCodeMirrorLanguage />
                          },
                          {
                            fallback: () => (
                              <>
                                <InsertCodeBlock />
                              </>
                            )
                          }
                        ]}
                      />
                    </DiffSourceToggleWrapper>
                  ),
                }),
                listsPlugin(),
                quotePlugin(),
                headingsPlugin({
                  allowedHeadingLevels: [1, 2, 3, 4, 5, 6]
                }),
                linkPlugin(),
                linkDialogPlugin(),
                imagePlugin({
                  imageUploadHandler: handleImageUpload
                }),
                tablePlugin(),
                thematicBreakPlugin(),
                frontmatterPlugin(),
                codeBlockPlugin({
                  defaultLanguage: 'text',
                  forcedLanguage: 'text'
                }),
                codeMirrorPlugin({ codeBlockLanguages }),
                sandpackPlugin(),
                diffSourcePlugin({ viewMode: isSourceMode ? 'source' : 'rich-text' }),
                markdownShortcutPlugin()
              ]}
            />
          </ErrorBoundary>
        )}
      </div>
    </>
  );
};

export default MDXEditorComponent;
