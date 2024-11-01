import { redirect } from 'next/navigation';
import meta from '../public/docs/meta.json';

export default function Home() {
  const topPage = meta.pages
    .filter(page => page.isPublic && !page.deleted)
    .sort((a, b) => a.sortOrder - b.sortOrder)[0];

  if (!topPage) {
    throw new Error('No public, non-deleted pages found');
  }

  redirect(`/${topPage.slug}`);
}
