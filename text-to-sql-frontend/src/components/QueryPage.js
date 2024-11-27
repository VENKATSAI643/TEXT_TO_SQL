import React, { useState, useEffect } from 'react';
import axios from '../utils/api';

const QueryPage = () => {
  const [databases, setDatabases] = useState([]);
  const [selectedDb, setSelectedDb] = useState('');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    const fetchDatabases = async () => {
      const response = await axios.get('/databases');
      setDatabases(response.data);
    };

    fetchDatabases();
  }, []);

  const handleQuery = async (e) => {
    e.preventDefault();
    const response = await axios.post('/query', { dbName: selectedDb, query });
    setResult(response.data.result);
  };

  return (
    <div className="container mt-5">
      <h2>Query Data</h2>
      <div className="form-group">
        <label>Select Database:</label>
        <select
          className="form-control"
          value={selectedDb}
          onChange={(e) => setSelectedDb(e.target.value)}
        >
          <option value="">--Select Database--</option>
          {databases.map((db) => (
            <option key={db} value={db}>
              {db}
            </option>
          ))}
        </select>
      </div>
      <form onSubmit={handleQuery}>
        <div className="form-group">
          <label>Enter Query:</label>
          <textarea
            className="form-control"
            rows="3"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary">
          Run Query
        </button>
      </form>
      {result && (
        <div className="mt-3">
          <h3>Query Result:</h3>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
};

export default QueryPage;
