'use client';

import { useState, useEffect, useCallback } from 'react';
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

const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const fetchSearchResults = useCallback(async () => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/search?term=${encodeURIComponent(searchTerm)}&authenticated=${!!session}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, session]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchSearchResults]);

  const handleResultClick = (result) => {
    router.push(result.slug === 'home' ? '/' : `/${result.slug}`);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search"
        className="w-full p-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
      {loading && (
        <div className="absolute right-2 top-2">
          <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      {searchResults.length > 0 && (
        <div className="absolute z-10 w-[200%] right-0 bg-white dark:bg-gray-800 border rounded-md mt-1 max-h-60 overflow-y-auto">
          <ul>
            {searchResults.map((result, index) => (
              <li
                key={index}
                onClick={() => handleResultClick(result)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b"
              >
                <div className="text-base font-semibold leading-5">
                  <HighlightMatches value={result.title} match={searchTerm} />
                </div>
                {result.snippet && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <HighlightMatches value={result.snippet} match={searchTerm} />
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
