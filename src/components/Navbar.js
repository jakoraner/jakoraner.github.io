import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  // Mobile and mega menu states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  // Which mobile drill-in panel is showing ('root' | 'about')
  const [mobilePanel, setMobilePanel] = useState('root');
  const location = useLocation();

  // Refs for the outer nav and for main menu items
  const navRef = useRef(null);
  const barRef = useRef(null);
  const megaMenuRef = useRef(null);
  const aboutRef = useRef(null);
  const workRef = useRef(null);
  const playlistsRef = useRef(null);

  // State for the moving indicator's left offset and width (in pixels)
  const [indicatorLeft, setIndicatorLeft] = useState(0);
  const [indicatorWidth, setIndicatorWidth] = useState(0);
  // Height of the top bar — the mobile menu slides in just below it.
  const [barHeight, setBarHeight] = useState(0);

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

  // Keep the indicator and the measured bar height in sync on resize, and
  // close the mobile overlay if the viewport grows to desktop.
  useEffect(() => {
    const onResize = () => {
      updateIndicator();
      if (barRef.current) setBarHeight(barRef.current.offsetHeight);
      if (window.innerWidth >= 768) setIsMenuOpen(false);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Re-measure the bar height when opening (fonts/layout may have shifted).
  useEffect(() => {
    if (isMenuOpen && barRef.current) setBarHeight(barRef.current.offsetHeight);
  }, [isMenuOpen]);

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

  // Lock background scroll while the mobile overlay is open.
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Esc closes the mobile overlay.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close the mobile overlay on navigation.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Reset the drill-in panel a moment after the overlay closes so it doesn't
  // visibly slide back while the overlay itself is animating out.
  useEffect(() => {
    if (!isMenuOpen) {
      const t = setTimeout(() => setMobilePanel('root'), 300);
      return () => clearTimeout(t);
    }
  }, [isMenuOpen]);

  const closeMobile = () => setIsMenuOpen(false);

  return (
    <nav ref={navRef} className="relative z-50 w-full">
      {/* Top bar — always visible; stays put while the menu slides in below it */}
      <div ref={barRef} className="relative z-[60] bg-white shadow-md font-sans">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Left cluster: mobile menu toggle (left of the name) + name/logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              className="md:hidden -ml-1 p-1 text-gray-900 focus:outline-none"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
            <Link
              to="/"
              className="text-3xl md:text-4xl font-bold text-gray-900 tracking-wide whitespace-nowrap"
            >
              Jacob Hoffmann
            </Link>
          </div>
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

      {/* ───── Mobile menu: slides in from the left, below the top bar ───── */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!isMenuOpen}
        style={{ top: barHeight }}
        className={`md:hidden fixed inset-x-0 bottom-0 z-[55] bg-white overflow-hidden transition-transform duration-300 ease-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
      >
        <div className="relative h-full">
          {/* Root panel */}
          <div
            className={`absolute inset-0 overflow-y-auto transition-transform duration-300 ease-out ${
              mobilePanel === 'about' ? '-translate-x-full' : 'translate-x-0'
            }`}
            aria-hidden={mobilePanel !== 'root'}
          >
            <ul className="m-0 p-0 list-none border-t border-gray-200">
              <li>
                <button
                  onClick={() => setMobilePanel('about')}
                  className="flex items-center justify-between w-full text-left px-5 py-6 text-[1.6rem] leading-none font-bold text-gray-900 border-b border-gray-200 active:bg-gray-50 transition-colors"
                  aria-label="Open About submenu"
                >
                  <span>About</span>
                  <ChevronRight size={26} className="text-gray-400" />
                </button>
              </li>
              <MobileRow to="/work" onNavigate={closeMobile} active={isActive('/work')}>
                Work
              </MobileRow>
              <MobileRow
                to="/playlists"
                onNavigate={closeMobile}
                active={isActive('/playlists')}
              >
                Playlists
              </MobileRow>
            </ul>
          </div>

          {/* About sub-panel */}
          <div
            className={`absolute inset-0 overflow-y-auto bg-white transition-transform duration-300 ease-out ${
              mobilePanel === 'about' ? 'translate-x-0' : 'translate-x-full'
            }`}
            aria-hidden={mobilePanel !== 'about'}
          >
            <button
              onClick={() => setMobilePanel('root')}
              className="flex items-center gap-2 w-full text-left px-5 py-5 text-sm font-bold uppercase tracking-widest text-gray-500 border-y border-gray-200 active:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={18} />
              <span>About</span>
            </button>
            <ul className="m-0 p-0 list-none">
              <MobileRow to="/#about" onNavigate={closeMobile} active={isActive('/#about')}>
                Overview
              </MobileRow>
              <MobileRow
                to="/#publications"
                onNavigate={closeMobile}
                active={isActive('/#publications')}
              >
                Publications
              </MobileRow>
              <MobileRow
                to="/#work-history"
                onNavigate={closeMobile}
                active={isActive('/#work-history')}
              >
                Work History
              </MobileRow>
              <MobileRow
                to="/#education"
                onNavigate={closeMobile}
                active={isActive('/#education')}
              >
                Education
              </MobileRow>
              <MobileRow
                to="/#languages"
                onNavigate={closeMobile}
                active={isActive('/#languages')}
              >
                Languages
              </MobileRow>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Big bold mobile list row (link). Active route is shown muted.
const MobileRow = ({ to, children, onNavigate, active }) => (
  <li>
    <Link
      to={to}
      onClick={onNavigate}
      className={`flex items-center justify-between w-full px-5 py-6 text-[1.6rem] leading-none font-bold border-b border-gray-200 active:bg-gray-50 transition-colors ${
        active ? 'text-gray-400' : 'text-gray-900'
      }`}
    >
      <span>{children}</span>
    </Link>
  </li>
);

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
