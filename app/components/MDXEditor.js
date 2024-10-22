'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
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

const MDXEditorComponent = ({ file, onSave }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState(file.title);
  const [isPublic, setIsPublic] = useState(file.isPublic);
  const [slug, setSlug] = useState(file.slug);
  const [version, setVersion] = useState(file.version || 1);
  const [isPreview, setIsPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/file-content?path=${encodeURIComponent(file.path)}`);
        const fileContent = await response.text();
        setContent(fileContent);
      } catch (error) {
        console.error('Error fetching file content:', error);
        setErrorMessage('Failed to fetch file content. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, [file.path]);

  const handleSave = async () => {
    try {
      const editorContent = editorRef.current?.getMarkdown();
      if (editorContent === undefined) {
        setErrorMessage('Failed to get editor content');
        return;
      }
      const response = await fetch('/api/update-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: file.path,
          content: editorContent,
          title,
          isPublic,
          slug,
          version,
        }),
      });
      if (response.ok) {
        const updatedFile = { ...file, title, isPublic, slug, version };
        onSave(updatedFile);
        setVersion(prevVersion => prevVersion + 1);
        setErrorMessage('');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to save file');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      setErrorMessage('An error occurred while saving the file');
    }
  };

  const codeBlockLanguages = ['', 'javascript', 'typescript', 'html', 'css', 'json', 'markdown', 'jsx', 'sql', 'python', 'java', 'ruby', 'bash', 'shell', 'text', 'txt', ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold bg-transparent border-none focus:outline-none"
        />
        <div className="flex items-center">
          <label className="mr-2">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mr-1"
            />
            Public
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mr-2 px-2 py-1 border rounded"
            placeholder="URL slug"
          />
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="mr-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save
          </button>
        </div>
      </div>
      {errorMessage && (
        <div className="text-red-500 mb-4">{errorMessage}</div>
      )}
      {isPreview ? (
        <div className="flex-grow overflow-auto">
          <MDXRenderer source={content} />
        </div>
      ) : (
        <ErrorBoundary>
          <MDXEditor
            ref={editorRef}
            markdown={content}
            onChange={(newContent) => setContent(newContent)}
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
                    <button onClick={() => setIsSourceMode(!isSourceMode)}>
                      {isSourceMode ? 'Rich Text' : 'Source'}
                    </button>
                  </DiffSourceToggleWrapper>
                ),
              }),
              listsPlugin(),
              quotePlugin(),
              headingsPlugin(),
              linkPlugin(),
              linkDialogPlugin(),
              imagePlugin(),
              tablePlugin(),
              thematicBreakPlugin(),
              frontmatterPlugin(),
              codeBlockPlugin({
                defaultLanguage: 'text'
              }),
              codeMirrorPlugin({
                codeBlockLanguages: codeBlockLanguages.reduce((acc, language) => {
                  acc[language] = language || 'Text';
                  return acc;
                }, {})
              }),
              sandpackPlugin(),
              diffSourcePlugin({ viewMode: isSourceMode ? 'source' : 'rich-text' }),
              markdownShortcutPlugin()
            ]}
            className="flex-grow p-2 bg-gray-100 dark:bg-gray-800 rounded mdxeditor"
          />
        </ErrorBoundary>
      )}
    </div>
  );
};

export default MDXEditorComponent;
