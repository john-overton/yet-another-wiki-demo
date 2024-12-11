'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const HighlightMatches = ({ value, match }) => {
  if (!match) return value;
  const parts = value.split(new RegExp(`(${match})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === match.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 dark:bg-yellow-800 font-bold">{part}</span>
        ) : (
          part
        )
      )}
    </>
  );
};

const SearchComponent = ({ inModal = false, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const { data: session } = useSession();
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const fetchSearchResults = useCallback(async () => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}&authenticated=${!!session}`);
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, session]);

  const handleResultClick = useCallback((result) => {
    router.push(result.path === 'home.md' ? '/' : `/${result.path.replace('.md', '')}`);
    setSearchTerm('');
    setSearchResults([]);
    if (onClose) onClose();
  }, [router, onClose]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchSearchResults]);

  useEffect(() => {
    if (inModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inModal]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (searchResults.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleResultClick(searchResults[selectedIndex]);
      }
    };

    if (inModal) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchResults, selectedIndex, inModal, handleResultClick]);

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className={`w-full p-2 pl-10 border rounded-md searchbar dark:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
            inModal ? 'text-lg' : ''
          }`}
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <i className="ri-search-line text-gray-400"></i>
        </div>
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>
      
      {searchResults.length > 0 && (
        <div className={`${inModal ? '' : 'absolute z-10'} w-full bg-white dark:bg-gray-800 max-h-[300px] overflow-y-auto`}>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {searchResults.map((result, index) => (
              <li
                key={index}
                onClick={() => handleResultClick(result)}
                className={`p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                  selectedIndex === index ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
              >
                <div className="text-base font-semibold leading-5">
                  <HighlightMatches value={result.title} match={searchTerm} />
                </div>
                {result.excerpt && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <HighlightMatches value={result.excerpt} match={searchTerm} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
