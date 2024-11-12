// src/components/LandingPage.js
import React from 'react';
import { Menu } from 'lucide-react';
import './styles.css';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900">Jacob Hoffmann</h1>
          <button
            className="md:hidden text-gray-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={24} />
          </button>
          <div className={`${isMenuOpen ? "block" : "hidden"} md:flex space-x-6`}>
            <a href="#about" className="text-gray-700 hover:text-blue-700">About Me</a>
            <a href="#publications" className="text-gray-700 hover:text-blue-700">Publications</a>
            <a href="#work" className="text-gray-700 hover:text-blue-700">Work History</a>
            <a href="#education" className="text-gray-700 hover:text-blue-700">Education</a>
            <a href="#languages" className="text-gray-700 hover:text-blue-700">Languages</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Name and Image Section */}
        <div className="flex flex-col md:flex-row items-start justify-between mb-12">
          {/* Stacked Name */}
          <div className="md:w-1/2 float-animation">
            <h1 className="text-left text-5xl md:text-7xl font-bold name-text">
              Jacob
            </h1>
            <h1 className="text-left text-5xl md:text-7xl font-bold name-text mt-2">
              Hoffmann
            </h1>
          </div>

          {/* Profile Image */}
          <div className="md:w-1/2 flex justify-center md:justify-end mt-8 md:mt-0 float-animation-slow">
            <div className="relative w-64 h-64 profile-image-container">
              <img
                src="/api/placeholder/256/256"  // Replace with your profile image path
                alt="Jacob Hoffmann"
                className="rounded-lg shadow-lg object-cover w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="prose prose-lg max-w-none">
          <p className="text-xl leading-relaxed about-text">
            Welcome to my personal website! I’m Jacob Hoffmann, a researcher and student specializing in Artificial Intelligence and Machine Learning, with a focus on Deep Learning for Computer Vision and Natural Language Processing.
          </p>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;