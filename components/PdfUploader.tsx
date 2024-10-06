import React, { useState } from 'react';
import styles from './PdfUploader.module.css';

const PdfUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [directory, setDirectory] = useState<string>('');
  const [newDirectory, setNewDirectory] = useState<string>('');
  const [isNewDirectory, setIsNewDirectory] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleDirectoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDirectory(event.target.value);
  };

  const handleNewDirectoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewDirectory(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('directory', isNewDirectory ? newDirectory : directory);

    try {
      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('PDF uploaded and converted successfully!');
        setFile(null);
        setDirectory('');
        setNewDirectory('');
        setIsNewDirectory(false);
      } else {
        alert('Error uploading PDF');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error uploading PDF');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input type="file" accept=".pdf" onChange={handleFileChange} required />
      
      <div>
        <label>
          <input
            type="radio"
            checked={!isNewDirectory}
            onChange={() => setIsNewDirectory(false)}
          />
          Select existing directory
        </label>
        <select
          value={directory}
          onChange={handleDirectoryChange}
          disabled={isNewDirectory}
          required={!isNewDirectory}
        >
          <option value="">Select a directory</option>
          <option value="pages">pages</option>
          <option value="pages/advanced">pages/advanced</option>
        </select>
      </div>

      <div>
        <label>
          <input
            type="radio"
            checked={isNewDirectory}
            onChange={() => setIsNewDirectory(true)}
          />
          Create new directory
        </label>
        <input
          type="text"
          value={newDirectory}
          onChange={handleNewDirectoryChange}
          placeholder="Enter new directory name"
          disabled={!isNewDirectory}
          required={isNewDirectory}
        />
      </div>

      <button type="submit">Upload and Convert</button>
    </form>
  );
};

export default PdfUploader;