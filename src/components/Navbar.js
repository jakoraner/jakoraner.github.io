import React, { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  // Mobile and mega menu states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const location = useLocation();

  // Refs for the outer nav and for main menu items
  const navRef = useRef(null);
  const megaMenuRef = useRef(null);
  const aboutRef = useRef(null);
  const workRef = useRef(null);
  const playlistsRef = useRef(null);

  // State for the moving indicator's left offset and width (in pixels)
  const [indicatorLeft, setIndicatorLeft] = useState(0);
  const [indicatorWidth, setIndicatorWidth] = useState(0);

  // Helper to check if a given path is active
  const isActive = (path) =>
    location.pathname + location.hash === path;

  // Determine which main menu item is active.
  // Default to "about" unless the pathname is '/work' or '/playlists'.
  const activeMenu = (() => {
    if (location.pathname === '/work') return 'work';
    if (location.pathname === '/playlists') return 'playlists';
    return 'about';
  })();

  // Helper to move the indicator to the passed element
  const moveIndicatorTo = (element) => {
    if (element && navRef.current) {
      const rect = element.getBoundingClientRect();
      const navRect = navRef.current.getBoundingClientRect();
      setIndicatorLeft(rect.left - navRect.left);
      setIndicatorWidth(rect.width);
    }
  };

  // Update the indicator's position based on the active menu item
  const updateIndicator = () => {
    let activeRef = null;
    if (activeMenu === 'about') activeRef = aboutRef.current;
    else if (activeMenu === 'work') activeRef = workRef.current;
    else if (activeMenu === 'playlists') activeRef = playlistsRef.current;
    if (activeRef) {
      moveIndicatorTo(activeRef);
    }
  };

  useEffect(() => {
    updateIndicator();
  }, [location, activeMenu]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, []);

  // Close the mega menu if clicking outside (desktop)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        megaMenuRef.current &&
        !megaMenuRef.current.contains(event.target)
      ) {
        setIsMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav ref={navRef} className="relative z-50 w-full">
      {/* Top Navigation Row */}
      <div className="bg-white shadow-md font-sans">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Name / Logo always on the left */}
          <Link
            to="/"
            className="text-4xl font-bold text-gray-900 tracking-wide"
          >
            Jacob Hoffmann
          </Link>
          {/* Desktop Main Navigation (right side) */}
          <div className="hidden md:flex">
            <ul
              className="flex space-x-8 items-center m-0 p-0 list-none"
              onMouseLeave={updateIndicator}
            >
              <li
                ref={aboutRef}
                className="relative"
                onMouseEnter={() => {
                  moveIndicatorTo(aboutRef.current);
                  setIsMegaMenuOpen(true);
                }}
              >
                <Link
                  to="/#about"
                  className="cursor-pointer text-gray-900 hover:text-gray-700 transition-colors duration-200 text-xl"
                >
                  About
                </Link>
              </li>
              <li
                ref={workRef}
                className="relative"
                onMouseEnter={() => {
                  moveIndicatorTo(workRef.current);
                  setIsMegaMenuOpen(false);
                }}
              >
                <Link
                  to="/work"
                  className={`hover:text-gray-700 transition-colors duration-200 text-xl ${
                    isActive('/work') ? 'text-gray-900' : 'text-gray-700'
                  }`}
                >
                  Work
                </Link>
              </li>
              <li
                ref={playlistsRef}
                className="relative"
                onMouseEnter={() => {
                  moveIndicatorTo(playlistsRef.current);
                  setIsMegaMenuOpen(false);
                }}
              >
                <Link
                  to="/playlists"
                  className={`hover:text-gray-700 transition-colors duration-200 text-xl ${
                    isActive('/playlists') ? 'text-gray-900' : 'text-gray-700'
                  }`}
                >
                  Playlists
                </Link>
              </li>
            </ul>
          </div>
          {/* Mobile Menu Toggle Button */}
          <button
            className="md:hidden text-gray-900 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Full-Width Divider with Moving Indicator Directly on It */}
      <div className="w-full relative">
        {/* Divider */}
        <div className="absolute inset-0 flex items-center pointer-events-none">
          <div className="w-full border-t-2 border-gray-200"></div>
        </div>
        {/* Moving Indicator */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 h-0.5 bg-gray-800 transition-all duration-300 z-50"
          style={{ left: indicatorLeft, width: indicatorWidth }}
        ></div>
      </div>

      {/* Desktop Mega Menu Overlay */}
      {isMegaMenuOpen && (
        <div
          ref={megaMenuRef}
          className="hidden md:block absolute left-0 right-0 bg-white shadow-lg z-40"
        >
          <div className="max-w-6xl mx-auto px-4 py-4">
            <ul className="flex space-x-8">
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
            </ul>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white z-50 flex flex-col overflow-y-auto">
          {/* About (mobile version toggles submenu on click) */}
          <div className="px-4 py-2 border-b">
            <button
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className="text-xl font-medium text-gray-800 hover:text-gray-600 w-full text-left"
            >
              About
            </button>
            {isMegaMenuOpen && (
              <div className="mt-2 space-y-2">
                <NavLink
                  to="/#about"
                  isActive={isActive}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Overview
                </NavLink>
                <NavLink
                  to="/#publications"
                  isActive={isActive}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Publications
                </NavLink>
                <NavLink
                  to="/#work-history"
                  isActive={isActive}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Work History
                </NavLink>
                <NavLink
                  to="/#education"
                  isActive={isActive}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Education
                </NavLink>
                <NavLink
                  to="/#languages"
                  isActive={isActive}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Languages
                </NavLink>
              </div>
            )}
          </div>
          {/* Other Mobile Menu Items */}
          <NavLink
            to="/work"
            isActive={isActive}
            onClick={() => setIsMenuOpen(false)}
          >
            Work
          </NavLink>
          <NavLink
            to="/playlists"
            isActive={isActive}
            onClick={() => setIsMenuOpen(false)}
          >
            Playlists
          </NavLink>
        </div>
      )}
    </nav>
  );
};

// Custom NavLink component for submenu and mobile items with animated text color
const NavLink = ({ to, children, isActive, onClick }) => (
  <li>
    <Link
      to={to}
      className={`block px-4 py-2 transition-colors duration-300 ${
        isActive(to)
          ? 'text-gray-500'
          : 'text-gray-800 hover:text-gray-600'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  </li>
);

export default Navbar;