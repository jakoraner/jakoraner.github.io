// Navbar.js
import React from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  // Function to check if the link is active
  const isActive = (path) => {
    return location.pathname + location.hash === path;
  };

  return (
    <nav className="bg-white shadow-md font-sans">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Jacob Hoffmann Link */}
        <Link to="/" className="text-4xl font-bold text-gray-900 tracking-wide">
          Jacob Hoffmann
        </Link>
        
        {/* Menu Button for Mobile */}
        <button
          className="md:hidden text-gray-900 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          <NavLink to="/#about" isActive={isActive}>
            About Me
          </NavLink>
          <NavLink to="/#publications" isActive={isActive}>
            Publications
          </NavLink>
          <NavLink to="/#work-history" isActive={isActive}>
            Work History
          </NavLink>
          <NavLink to="/#education" isActive={isActive}>
            Education
          </NavLink>
          <NavLink to="/#languages" isActive={isActive}>
            Languages
          </NavLink>
          <NavLink to="/playlists" isActive={isActive}>
            Playlists
          </NavLink>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {/* Clickable Jacob Hoffmann Link */}
            <Link to="/" className="text-4xl font-bold text-gray-900 tracking-wide" onClick={() => setIsMenuOpen(false)}>
              Jacob Hoffmann
            </Link>
            <button
              className="text-gray-900 focus:outline-none"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close Menu"
            >
              <X size={28} />
            </button>
          </div>
          <div className="flex-grow flex flex-col justify-center">
            <ul className="space-y-8 text-center">
              <NavLinkMobile to="/#about" onClick={() => setIsMenuOpen(false)} isActive={isActive}>
                About Me
              </NavLinkMobile>
              <NavLinkMobile to="/#publications" onClick={() => setIsMenuOpen(false)} isActive={isActive}>
                Publications
              </NavLinkMobile>
              <NavLinkMobile to="/#work-history" onClick={() => setIsMenuOpen(false)} isActive={isActive}>
                Work History
              </NavLinkMobile>
              <NavLinkMobile to="/#education" onClick={() => setIsMenuOpen(false)} isActive={isActive}>
                Education
              </NavLinkMobile>
              <NavLinkMobile to="/#languages" onClick={() => setIsMenuOpen(false)} isActive={isActive}>
                Languages
              </NavLinkMobile>
              <NavLinkMobile to="/playlists" onClick={() => setIsMenuOpen(false)} isActive={isActive}>
                Playlists
              </NavLinkMobile>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

// Custom NavLink component for desktop menu
const NavLink = ({ to, children, isActive }) => (
  <Link
    to={to}
    className={`text-lg font-medium ${
      isActive(to) ? 'text-gray-900' : 'text-gray-600 hover:text-gray-800'
    }`}
  >
    {children}
  </Link>
);

// Custom NavLink component for mobile menu
const NavLinkMobile = ({ to, children, onClick, isActive }) => (
  <li>
    <Link
      to={to}
      className={`text-2xl font-medium ${
        isActive(to) ? 'text-gray-900' : 'text-gray-800 hover:text-gray-600'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  </li>
);

export default Navbar;