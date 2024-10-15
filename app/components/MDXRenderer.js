import { MDXRemote } from 'next-mdx-remote/rsc'

const MDXRenderer = async ({ source }) => {
  return (
    <div className="mdx-content">
      <MDXRemote source={source} />
    </div>
  );
};

export default MDXRenderer;
