import React, { useState } from 'react';
import axios from '../utils/api';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [dbName, setDbName] = useState('');
  const [columns, setColumns] = useState([]); // This will store the column names
  const [constraints, setConstraints] = useState({}); // This will store the constraints for each column

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Fetch columns after the file upload
  const handleFetchColumns = async () => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/columns', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Set columns from the response data
      setColumns(response.data.columns);

      // Initialize constraints with default values for each column
      setConstraints(
        response.data.columns.reduce((acc, col) => {
          acc[col] = { type: 'VARCHAR', isPrimaryKey: false }; // Default settings for columns
          return acc;
        }, {})
      );
    } catch (error) {
      console.error('Error fetching columns:', error.message);
      alert('Failed to fetch columns from the file.');
    }
  };

  // Update constraints for a specific column
  const handleConstraintChange = (column, field, value) => {
    setConstraints((prev) => ({
      ...prev,
      [column]: { ...prev[column], [field]: value },
    }));
  };

  // Handle final submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !dbName) {
      alert('Please provide a database name and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('dbName', dbName);
    formData.append('constraints', JSON.stringify(constraints));

    try {
      const response = await axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(`Database ${dbName} created successfully!`);
    } catch (error) {
      console.error('Error uploading file:', error.message);
      alert('Error uploading file.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Upload Data</h2>
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
          <label>Upload CSV File:</label>
          <input type="file" className="form-control" onChange={handleFileChange} required />
        </div>

        {/* Fetch Columns Button */}
        {file && (
          <button
            type="button"
            className="btn btn-info mt-3"
            onClick={handleFetchColumns}
          >
            Fetch Columns
          </button>
        )}

        {/* If columns are available, show the constraints section */}
        {columns.length > 0 && (
          <div>
            <h4 className="mt-4">Define Constraints:</h4>
            {columns.map((col, index) => (
              <div key={index} className="form-row mt-2">
                <div className="col">
                  <label>Column: {col}</label>
                </div>
                <div className="col">
                  <select
                    className="form-control"
                    value={constraints[col]?.type || 'VARCHAR'}
                    onChange={(e) =>
                      handleConstraintChange(col, 'type', e.target.value)
                    }
                  >
                    <option value="VARCHAR">VARCHAR</option>
                    <option value="INT">INT</option>
                    <option value="FLOAT">FLOAT</option>
                  </select>
                </div>
                <div className="col">
                  <label>
                    <input
                      type="checkbox"
                      checked={constraints[col]?.isPrimaryKey || false}
                      onChange={(e) =>
                        handleConstraintChange(col, 'isPrimaryKey', e.target.checked)
                      }
                    />
                    Primary Key
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Submit Button */}
        <button type="submit" className="btn btn-primary mt-4">
          Upload
        </button>
      </form>
    </div>
  );
};

export default UploadPage;
