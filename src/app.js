// App.js
import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/Landingpage';
import Playlists from './components/Playlists';
import Work from './components/Work';
import LauraTimeline from './components/Laura/LauraTimeline';
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
        <Route path="/laura" element={<LauraTimeline />} />
      </Routes>
    </Router>
  );
};

export default App;