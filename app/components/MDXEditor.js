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
  const contentRef = useRef('');

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/file-content?path=${encodeURIComponent(file.path)}`);
        const fileContent = await response.text();
        if (fileContent) {
          setContent(fileContent);
          contentRef.current = fileContent;
          
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
      const currentContent = contentRef.current;
      
      // Validate content before saving
      if (!currentContent || currentContent.trim() === '') {
        setErrorMessage('Cannot save empty content');
        return;
      }

      console.log('Saving content:', currentContent); // Debug log

      const response = await fetch('/api/update-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: file.path,
          content: currentContent,
          title: title || file.title,
          isPublic,
          slug: slug || file.slug,
          version,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save file');
      }

      const updatedFile = { ...file, title, isPublic, slug, version };
      onSave(updatedFile);
      setVersion(prevVersion => prevVersion + 1);
      setErrorMessage('');
    } catch (error) {
      console.error('Error saving file:', error);
      setErrorMessage(`An error occurred while saving the file: ${error.message}`);
    }
  };

  const handleEditorChange = (newContent) => {
    // Update both the state and ref with the new content
    setContent(newContent);
    contentRef.current = newContent;
    console.log('Editor content updated:', newContent); // Debug log
  };

  // Define available languages with descriptive names
  const codeBlockLanguages = {
    'text': 'Plain Text',
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
                  defaultLanguage: 'text',
                  forcedLanguage: 'text' // This ensures a language is always selected
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
