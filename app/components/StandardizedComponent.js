import React from 'react';

const StandardizedComponent = ({ title, children, error, success }) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white">{title}</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
        {children}
      </div>
    </div>
  );
};

export const StandardizedInput = ({ label, id, type, value, onChange, required, autoComplete, placeholder }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium input-label mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      value={value}
      onChange={onChange}
      required={required}
      autoComplete={autoComplete}
      placeholder={placeholder}
    />
  </div>
);

export const StandardizedSelect = ({ label, id, value, onChange, options, required }) => (
  <div className="mb-4">
    <label htmlFor={id} className="block text-sm font-medium input-label mb-1">
      {label}
    </label>
    <select
      id={id}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      value={value}
      onChange={onChange}
      required={required}
    >
      <option value="">Select an option</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export const StandardizedButton = ({ type, onClick, disabled, children }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className="w-full btn-primary py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-300 transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {disabled && <div className="spinner mr-2"></div>}
    {children}
  </button>
);

export const StandardizedLink = ({ href, children }) => (
  <a href={href} className="text-primary hover:text-primary-hover">
    {children}
  </a>
);

export const StandardizedForm = ({ onSubmit, children }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    {children}
  </form>
);

export default StandardizedComponent;
