import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, User, ShoppingCart } from 'lucide-react';

const Header = ({ transparent = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items
  const navItems = [
    { label: 'Home', path: '/' },
    { 
      label: 'Products', 
      path: '/products',
      dropdown: ['All Products', 'Featured', 'New Arrivals', 'Best Sellers']
    },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <header 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled || !transparent
          ? 'bg-white shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold">
              BrandName
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.label} className="relative">
                {item.dropdown ? (
                  <div>
                    <button
                      className="flex items-center text-gray-700 hover:text-blue-600"
                      onClick={() => setDropdownOpen(dropdownOpen === item.label ? null : item.label)}
                    >
                      {item.label}
                      <ChevronDown size={16} className="ml-1" />
                    </button>
                    
                    {dropdownOpen === item.label && (
                      <div className="absolute mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem}
                            to={`${item.path}/${subItem.toLowerCase().replace(/\s+/g, '-')}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setDropdownOpen(null)}
                          >
                            {subItem}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className="text-gray-700 hover:text-blue-600"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Action buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/account" className="text-gray-700 hover:text-blue-600">
              <User size={20} />
            </Link>
            <Link to="/cart" className="text-gray-700 hover:text-blue-600 relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                0
              </span>
            </Link>
            <Link 
              to="/login" 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              className="text-gray-700" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.dropdown ? (
                  <div>
                    <button
                      className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 flex justify-between items-center"
                      onClick={() => setDropdownOpen(dropdownOpen === item.label ? null : item.label)}
                    >
                      {item.label}
                      <ChevronDown size={16} className={`transition-transform ${dropdownOpen === item.label ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {dropdownOpen === item.label && (
                      <div className="pl-4 py-2 space-y-1 bg-gray-50">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem}
                            to={`${item.path}/${subItem.toLowerCase().replace(/\s+/g, '-')}`}
                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setDropdownOpen(null);
                              setIsMenuOpen(false);
                            }}
                          >
                            {subItem}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="pt-4 border-t border-gray-200 flex flex-col space-y-3">
              <Link 
                to="/account" 
                className="px-3 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={18} className="mr-2" />
                My Account
              </Link>
              <Link 
                to="/cart" 
                className="px-3 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart size={18} className="mr-2" />
                Cart (0)
              </Link>
              <Link 
                to="/login" 
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-center mx-3"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;