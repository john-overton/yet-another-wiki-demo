'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { bundleMDXContent } from '../actions/mdx';
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
import { Open_Sans } from 'next/font/google';

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
});

// Define editor styles
const editorStyles = `
.mdxeditor-content-editable {
  font-family: var(--font-open-sans);
  line-height: 1.6;
}

.mdxeditor-content-editable h1 {
  font-size: 2.5em;
  font-weight: 700;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.mdxeditor-content-editable h2 {
  font-size: 2em;
  font-weight: 600;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.mdxeditor-content-editable h3 {
  font-size: 1.75em;
  font-weight: 600;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.mdxeditor-content-editable h4 {
  font-size: 1.5em;
  font-weight: 600;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.mdxeditor-content-editable h5 {
  font-size: 1.25em;
  font-weight: 600;
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.mdxeditor-content-editable h6 {
  font-size: 1.1em;
  font-weight: 600;
  margin-top: 1em;
  margin-bottom: 0.5em;
}
`;

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
  const [bundledContent, setBundledContent] = useState(null);
  const editorRef = useRef(null);
  const [currentMarkdown, setCurrentMarkdown] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/file-content?path=${encodeURIComponent(file.path)}`);
        const fileContent = await response.text();
        if (fileContent) {
          setContent(fileContent);
          setCurrentMarkdown(fileContent);
          
          // Bundle the initial content
          const bundled = await bundleMDXContent(fileContent);
          if (bundled) {
            setBundledContent(bundled.code);
          }
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

  const handleSave = async () => {
    try {
      let markdownContent;
      
      if (editorRef.current) {
        // Get content from editor's markdown state
        markdownContent = content;
        console.log('Editor content:', markdownContent); // Debug log
      }

      // Fallback to currentMarkdown if editor content is not available
      if (!markdownContent) {
        markdownContent = currentMarkdown;
        console.log('Using current markdown:', markdownContent); // Debug log
      }

      // Validate content before saving
      if (!markdownContent || markdownContent.trim() === '') {
        setErrorMessage('Cannot save empty content');
        return;
      }

      const response = await fetch('/api/update-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: file.path,
          content: markdownContent,
          title: title || file.title,
          isPublic,
          slug: slug || file.slug,
          version,
        }),
      });

      if (response.ok) {
        const updatedFile = { ...file, title, isPublic, slug, version };
        // Update local state with the saved content
        setContent(markdownContent);
        setCurrentMarkdown(markdownContent);
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

  const handleEditorChange = async (newContent) => {
    if (typeof newContent === 'string') {
      console.log('Editor onChange:', newContent); // Debug log
      setContent(newContent);
      setCurrentMarkdown(newContent);
      
      try {
        const bundled = await bundleMDXContent(newContent);
        if (bundled) {
          setBundledContent(bundled.code);
        }
      } catch (error) {
        console.error('Error bundling MDX content:', error);
      }
    }
  };

  const codeBlockLanguages = ['', 'javascript', 'typescript', 'html', 'css', 'json', 'markdown', 'jsx', 'sql', 'python', 'java', 'ruby', 'bash', 'shell', 'text', 'txt'];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <style jsx global>{editorStyles}</style>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            value={title || ''}
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
              value={slug || ''}
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
            <MDXRenderer code={bundledContent} />
          </div>
        ) : (
          <ErrorBoundary>
            <MDXEditor
              ref={editorRef}
              markdown={content}
              onChange={handleEditorChange}
              contentEditableClassName="mdxeditor-content-editable"
              className={`${openSans.className} mdxeditor flex-grow p-2 bg-gray-100 dark:bg-gray-800 rounded`}
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
            />
          </ErrorBoundary>
        )}
      </div>
    </>
  );
};

export default MDXEditorComponent;
