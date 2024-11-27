import React, { useState } from 'react';
import axios from '../utils/api';
import 'bootstrap/dist/css/bootstrap.min.css';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [dbName, setDbName] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !dbName) {
      alert('Please provide a database name and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('dbName', dbName);

    try {
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(`Database ${dbName} created successfully!`);
    } catch (error) {
      alert('Error uploading file: ' + error.message);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Upload CSV and Create Database</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Database Name:</label>
          <input
            type="text"
            className="form-control"
            value={dbName}
            onChange={(e) => setDbName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Upload File:</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3">Upload</button>
      </form>
    </div>
  );
};

export default UploadForm;
