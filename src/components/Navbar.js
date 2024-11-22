import React from 'react';
import { Menu } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-700">Jacob Hoffmann</h1>
        <button
          className="md:hidden text-gray-500"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu size={24} />
        </button>
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:flex space-x-6`}>
          <a href="/" className="text-gray-600 hover:text-gray-800">Home</a>
          <a href="#about" className="text-gray-600 hover:text-gray-800">About Me</a>
          <a href="#publications" className="text-gray-600 hover:text-gray-800">Publications</a>
          <a href="#work-history" className="text-gray-600 hover:text-gray-800">Work History</a>
          <a href="#education" className="text-gray-600 hover:text-gray-800">Education</a>
          <a href="#languages" className="text-gray-600 hover:text-gray-800">Languages</a>
          <a href="/playlists" className="text-gray-600 hover:text-gray-800">Playlists</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;