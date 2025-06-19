import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-[#11131e] text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              © 2025 Abiah.help. All rights reserved.
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


        <div className="flex flex-col items-center border-t border-neutral-800 mt-8 pt-8">
          <a href='https://bolt.new/?rid=dm8ttl.'>
            <img
              src="/images/bolt/bolt-white_circle_360x360.png"
              alt="Bolt Badge"
              className="w-16 h-16 md:w-20 md:h-20 mb-2"
              style={{ objectFit: 'contain' }}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}