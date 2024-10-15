"use client";

import { MDXEditor, MDXEditorMethods, UndoRedo, BoldItalicUnderlineToggles, toolbarPlugin, listsPlugin, quotePlugin, headingsPlugin, linkPlugin, linkDialogPlugin, imagePlugin, tablePlugin, thematicBreakPlugin, frontmatterPlugin, codeBlockPlugin, diffSourcePlugin, markdownShortcutPlugin, BlockTypeSelect, CreateLink, InsertImage, InsertTable, InsertThematicBreak, ListsToggle, CodeToggle, ConditionalContents, InsertCodeBlock, ChangeCodeMirrorLanguage, DiffSourceToggleWrapper } from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { FC, useRef } from "react";

interface EditorProps {
  markdown: string;
  onChange: (markdown: string) => void;
}

const Editor: FC<EditorProps> = ({ markdown, onChange }) => {
  const ref = useRef<MDXEditorMethods>(null);

  return (
    <MDXEditor
      ref={ref}
      markdown={markdown}
      onChange={onChange}
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
        headingsPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin(),
        tablePlugin(),
        thematicBreakPlugin(),
        frontmatterPlugin(),
        codeBlockPlugin(),
        diffSourcePlugin(),
        markdownShortcutPlugin()
      ]}
    />
  );
};

export default Editor;
