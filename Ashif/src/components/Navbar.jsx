import React from 'react';

function handleNavClick(e, id) {
  e.preventDefault();
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
  }
}

/**
 * A minimal, transparent navigation bar.
 * It uses Flexbox to space out the logo and navigation links.
 * The `z-30` class ensures it sits on top of other content.
 */
export default function Navbar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 p-4 sm:p-6">
      <nav className="container flex items-center justify-between mx-auto">
        {/* Logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-pixel text-white text-base sm:text-lg tracking-wide"
          aria-label="Scroll to top"
        >
          Rohan Malhotra
        </a>
        
        {/* Navigation Links */}
        <div className="flex items-center gap-4 text-sm font-medium text-white/90 sm:gap-6">
          <a
            href="#about"
            onClick={e => handleNavClick(e, 'about')}
            className="transition hover:text-white"
          >
            About
          </a>
          <a
            href="#projects"
            onClick={e => handleNavClick(e, 'projects')}
            className="transition hover:text-white"
          >
            Projects
          </a>
          <a
            href="#rohangpt"
            onClick={e => handleNavClick(e, 'rohangpt')}
            className="transition hover:text-white"
          >
            RohanGPT
          </a>
          <a
            href="#contact"
            onClick={e => handleNavClick(e, 'contact')}
            className="transition hover:text-white"
          >
            Contact
          </a>
        </div>
      </nav>
    </header>
  );
}