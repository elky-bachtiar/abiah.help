/** @jsxImportSource react */
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export function Footer() {
  const location = useLocation();
  const path = location.pathname;
  const isHome = path === '/';
  
  // Check if current page is dashboard, consultation, or documents
  const isRestrictedPage = 
    path.includes('/dashboard') || 
    path.includes('/consultation') || 
    path.includes('/documents');

  return (
    <footer className="bg-[#11131e] text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* First part of the footer - hidden on dashboard, consultations, and documents pages */}
        {!isRestrictedPage && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-bold">Abiah.help</span>
              </div>
              <p className="text-neutral-400 mb-4 max-w-md">
                The world's first AI startup mentor platform that helps founders get funded through 
                face-to-face video consultations and intelligent document generation.
              </p>

              <p className="text-sm text-neutral-500">
                &copy; 2025 Abiah.help. All rights reserved.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-neutral-400">
                <li>
                  <Link to="/consultation" className="hover:text-white transition-colors">
                    AI Consultations
                  </Link>
                </li>
                <li>
                  <Link to="/documents" className="hover:text-white transition-colors">
                    Document Generation
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-neutral-400">
                <li>
                  <Link to="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Second part of the footer - always visible */}
        {!isHome && (
  <div className="flex justify-center">
    <a 
      href='https://bolt.new/?rid=dm8ttl.' 
      target="_blank" 
      rel="noopener noreferrer"
      className="transition-transform hover:scale-105"
    >
      <img
        src="/images/bolt/bolt-white_circle_360x360.png"
        alt="Built with Bolt"
        className="w-12 h-12 md:w-20 md:h-20"
        style={{ objectFit: 'contain' }}
      />
    </a>
  </div>
)}
        </div>
      </div>
    </footer>
  );
}