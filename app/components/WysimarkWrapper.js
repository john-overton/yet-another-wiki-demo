'use client';

import React from 'react';
import { Editable, useEditor } from "@wysimark/react";
import '../wysimark.css';

const WysimarkWrapper = ({ value, onChange, onUpload, style, className }) => {
  const editor = useEditor({
    minHeight: 'calc(100vh - 300px)',
    onUpload,
    style: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
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
      className={className}
    />
  );
};

export default WysimarkWrapper;
