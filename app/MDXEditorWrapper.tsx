"use client";

import dynamic from 'next/dynamic';

const MDXEditorPage = dynamic(() => import('./MDXEditorPage'), { ssr: false });

const MDXEditorWrapper = () => {
  return <MDXEditorPage />;
};

export default MDXEditorWrapper;
