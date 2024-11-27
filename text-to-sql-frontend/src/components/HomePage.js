import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mt-5 text-center">
      <h1>Text-to-SQL System</h1>
      <div className="mt-5">
        <button className="btn btn-primary m-3" onClick={() => navigate('/upload')}>
          Upload Data
        </button>
        <button className="btn btn-secondary m-3" onClick={() => navigate('/query')}>
          Query Data
        </button>
      </div>
    </div>
  );
};

export default HomePage;
