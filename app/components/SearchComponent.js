'use client';

import { useState, useEffect } from 'react';

const SearchComponent = ({ onFileSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        fetchSearchResults();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchSearchResults = async () => {
    try {
      const response = await fetch(`/api/search?term=${searchTerm}`);
      const data = await response.json();
      console.log('API Response:', data);
      setSearchResults(data.slice(0, 5));
      console.log('Search Results Set:', data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleResultClick = (result) => {
    onFileSelect({
      name: result.fullName,
      path: result.path,
    });
    setSearchTerm('');
    setSearchResults([]);
  };

  console.log('Current Search Term:', searchTerm);
  console.log('Current Search Results:', searchResults);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search docs..."
        className="p-2 border rounded-md"
      />
      {searchResults.length > 0 && (
        <div className="absolute z-[1050] w-full bg-white border-2 border-blue-500 rounded-md mt-1 max-h-60 overflow-y-auto">
          <p className="p-2 bg-gray-200">Search Results:</p>
          <ul>
            {searchResults.map((result, index) => (
              <li
                key={index}
                onClick={() => handleResultClick(result)}
                className="p-2 hover:bg-gray-100 cursor-pointer border-b"
              >
                {result.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
