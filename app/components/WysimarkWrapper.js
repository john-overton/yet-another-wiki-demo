'use client';

import React from 'react';
import { Editable, useEditor } from "@wysimark/react";
import { Open_Sans } from 'next/font/google';
import '../wysimark.css';

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
});
//
const WysimarkWrapper = ({ value, onChange, onUpload, style, className }) => {
  const editor = useEditor({
    minHeight: 'calc(100vh - 300px)',
    onUpload,
    style: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: openSans.style.fontFamily,
      ...style
    }
  });

  return (
    <Editable
      editor={editor}
      value={value}
      onChange={onChange}
      throttleInMs={1000}
      placeholder="Start writing..."
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      className={`wysimark-custom wysimark-editor ${className} ${openSans.className}`}
    />
  );
};

export default WysimarkWrapper;
