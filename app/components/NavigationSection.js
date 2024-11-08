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

  // Recursively find a page and its parent in the page tree
  const findPageAndParent = (pages, targetPath, parent = null) => {
    for (const page of pages) {
      if (page.path === targetPath) {
        return { page, parent };
      }
      if (page.children?.length > 0) {
        const result = findPageAndParent(page.children, targetPath, page);
        if (result) return result;
      }
    }
    return null;
  };

  let prevPage = null;
  let nextPage = null;

  // Find current page context
  const pageContext = findPageAndParent(pages, currentPage.path);
  const isRootPage = pageContext ? !pageContext.parent : false;
  const parentPage = pageContext ? pageContext.parent : null;

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
    // Current page is a child page at any level
    const siblings = getPagesAtLevel(parentPage.children);
    const currentIndex = siblings.findIndex(p => p.path === currentPage.path);

    // If first child of parent, previous is parent
    if (currentIndex === 0) {
      if (isAccessible(parentPage)) {
        prevPage = parentPage;
      }
    } else {
      // Look for previous accessible sibling or last accessible child of previous sibling
      for (let i = currentIndex - 1; i >= 0; i--) {
        const sibling = siblings[i];
        if (isAccessible(sibling)) {
          // If sibling has children, get the last accessible child recursively
          let lastChild = sibling;
          while (lastChild.children?.length > 0) {
            const children = getPagesAtLevel(lastChild.children);
            const lastAccessibleChild = [...children].reverse().find(child => isAccessible(child));
            if (!lastAccessibleChild) break;
            lastChild = lastAccessibleChild;
          }
          prevPage = lastChild;
          break;
        }
      }
    }

    // Next is either first child (if exists) or next sibling
    if (currentPage.children?.length > 0) {
      const children = getPagesAtLevel(currentPage.children);
      nextPage = children.find(child => isAccessible(child));
    }

    if (!nextPage) {
      // Look for next accessible sibling
      for (let i = currentIndex + 1; i < siblings.length; i++) {
        if (isAccessible(siblings[i])) {
          nextPage = siblings[i];
          break;
        }
      }

      // If no next sibling, traverse up the tree to find next page
      if (!nextPage) {
        let currentParent = parentPage;
        let currentChild = currentPage;
        
        while (currentParent && !nextPage) {
          const parentSiblings = getPagesAtLevel(
            findPageAndParent(pages, currentParent.path)?.parent?.children || pages
          );
          const parentIndex = parentSiblings.findIndex(p => p.path === currentParent.path);
          
          for (let i = parentIndex + 1; i < parentSiblings.length; i++) {
            if (isAccessible(parentSiblings[i])) {
              nextPage = parentSiblings[i];
              break;
            }
          }
          
          currentChild = currentParent;
          currentParent = findPageAndParent(pages, currentParent.path)?.parent;
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
