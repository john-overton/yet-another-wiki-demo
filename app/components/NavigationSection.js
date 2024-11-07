'use client';

import React from 'react';
import Link from 'next/link';

const NavigationSection = ({ currentPage, pages, isAuthenticated }) => {
  // Get all pages at a given level, sorted by sortOrder
  const getPagesAtLevel = (items) => {
    return [...items].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  };

  // Check if a page is accessible based on authentication
  const isAccessible = (page) => {
    return !page.deleted && (isAuthenticated || page.isPublic);
  };

  let prevPage = null;
  let nextPage = null;

  // Find current page context
  const isRootPage = pages.some(p => p.path === currentPage.path);
  const parentPage = isRootPage ? null : pages.find(p => 
    p.children?.some(child => child.path === currentPage.path)
  );

  if (isRootPage) {
    // Current page is a root page
    const rootPages = getPagesAtLevel(pages);
    const currentIndex = rootPages.findIndex(p => p.path === currentPage.path);

    // Check for previous root page
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (isAccessible(rootPages[i])) {
        prevPage = rootPages[i];
        break;
      }
    }

    // Next is either first accessible child or next accessible root page
    if (currentPage.children?.length > 0) {
      // Look for first accessible child
      const children = getPagesAtLevel(currentPage.children);
      nextPage = children.find(child => isAccessible(child));
    }
    
    if (!nextPage) {
      // Look for next accessible root page
      for (let i = currentIndex + 1; i < rootPages.length; i++) {
        if (isAccessible(rootPages[i])) {
          nextPage = rootPages[i];
          break;
        }
      }
    }
  } else if (parentPage) {
    // Current page is a child page
    const siblings = getPagesAtLevel(parentPage.children);
    const currentIndex = siblings.findIndex(p => p.path === currentPage.path);

    if (currentIndex === 0) {
      // First child - previous is parent
      if (isAccessible(parentPage)) {
        prevPage = parentPage;
      }
    } else {
      // Look for previous accessible sibling
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (isAccessible(siblings[i])) {
          prevPage = siblings[i];
          break;
        }
      }
    }

    // Look for next accessible sibling
    for (let i = currentIndex + 1; i < siblings.length; i++) {
      if (isAccessible(siblings[i])) {
        nextPage = siblings[i];
        break;
      }
    }

    // If no next sibling, look for next root page after parent
    if (!nextPage) {
      const rootPages = getPagesAtLevel(pages);
      const parentIndex = rootPages.findIndex(p => p.path === parentPage.path);
      for (let i = parentIndex + 1; i < rootPages.length; i++) {
        if (isAccessible(rootPages[i])) {
          nextPage = rootPages[i];
          break;
        }
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-8">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Last updated on <time dateTime={currentPage.lastModified}>{formatDate(currentPage.lastModified)}</time>
      </div>
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          {prevPage ? (
            <Link href={`/${prevPage.slug}`} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
              <i className="ri-arrow-left-line"></i>
              <span>{prevPage.title}</span>
            </Link>
          ) : <div />}
          {nextPage ? (
            <Link href={`/${nextPage.slug}`} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
              <span>{nextPage.title}</span>
              <i className="ri-arrow-right-line"></i>
            </Link>
          ) : <div />}
        </div>
      </div>
    </div>
  );
};

export default NavigationSection;
