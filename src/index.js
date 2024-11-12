import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Ensure Tailwind CSS styles are included
import './tailwind.css';
import App from './app';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
