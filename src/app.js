// App.js
import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/Landingpage';
import Playlists from './components/Playlists';
import Work from './components/Work';
import ScrollToHash from './components/ScrollToHash';
import './app.css';

const App = () => {
  return (
    <Router>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/playlists" element={<Playlists />} />
        <Route path="/work" element={<Work />} />
      </Routes>
    </Router>
  );
};

export default App;