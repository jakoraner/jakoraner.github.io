import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/Landingpage'; // Adjust based on your structure
import Playlists from './components/Playlists'; // Adjust based on your structure

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/playlists" element={<Playlists />} />
      </Routes>
    </Router>
  );
};

export default App;