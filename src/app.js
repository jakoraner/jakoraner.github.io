import React from 'react';
import './tailwind.css';
import About from './components/About';
import Publications from './components/Publications';
import WorkHistory from './components/WorkHistory';
import Education from './components/Education';
import Skills from './components/Skills';
import Languages from './components/Languages';

function App() {
  return (
    <div className="App bg-gray-100 text-gray-800">
      <header className="App-header bg-blue-900 text-white p-6 shadow-lg">
        <h1 className="text-4xl font-bold">Jacob Hoffmann</h1>
        <nav className="mt-4 space-x-4">
          <a href="#about" className="App-link text-teal-300 hover:underline">About Me</a>
          <a href="#publications" className="App-link text-teal-300 hover:underline">Publications</a>
          <a href="#work" className="App-link text-teal-300 hover:underline">Work History</a>
          <a href="#education" className="App-link text-teal-300 hover:underline">Education</a>
          <a href="#languages" className="App-link text-teal-300 hover:underline">Languages</a>
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8">
        <About />
        <Publications />
        <WorkHistory />
        <Education />
        <Skills />
        <Languages />
      </main>
      <footer className="text-center py-4 bg-white border-t">
        <p>&copy; 2024 Jacob Hoffmann. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;