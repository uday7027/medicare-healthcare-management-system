import React from "react";
import { FaTwitter, FaFacebookF, FaLinkedinIn, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-t from-white to-gray-50 border-t mt-12">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo & Description */}
        <div className="space-y-3">
          <img
            src="/logo1.png"
            alt="MediCare logo"
            className="h-20 w-auto transition-transform duration-300 hover:scale-105"
          />
          <p className="text-gray-500 text-sm">
            MediCare — secure appointment & records management with ease.
          </p>
        </div>

        {/* Quick Links */}
        <nav aria-label="Quick links" className="text-sm">
          <h3 className="font-semibold mb-4 text-gray-700 uppercase tracking-wider">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="/about" className="hover:text-primary transition-colors">About</a></li>
            <li><a href="/features" className="hover:text-primary transition-colors">Features</a></li>
            <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
            <li><a href="/login" className="hover:text-primary transition-colors">Login</a></li>
          </ul>
        </nav>

        {/* Resources */}
        <div className="text-sm">
          <h3 className="font-semibold mb-4 text-gray-700 uppercase tracking-wider">Resources</h3>
          <ul className="space-y-2">
            <li><a href="/terms" className="hover:text-primary transition-colors">Terms</a></li>
            <li><a href="/privacy" className="hover:text-primary transition-colors">Privacy</a></li>
            <li><a href="/help" className="hover:text-primary transition-colors">Help Center</a></li>
          </ul>
        </div>

        {/* Contact & Newsletter */}
        <div className="text-sm space-y-4">
          <h3 className="font-semibold mb-2 text-gray-700 uppercase tracking-wider">Contact</h3>
          <p className="text-gray-600">support@medicare.example</p>
          <p className="text-gray-600">+91 98765 43210</p>

          {/* Social Icons */}
          <div className="flex items-center space-x-3 mt-3">
            {[FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                className="text-gray-600 hover:text-primary transition transform hover:scale-110"
                aria-label="social-link"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>

          {/* Newsletter */}
          <form onSubmit={(e) => e.preventDefault()} className="mt-4">
            <label htmlFor="newsletter" className="sr-only">Subscribe to newsletter</label>
            <div className="flex shadow-sm rounded-md overflow-hidden">
              <input
                id="newsletter"
                type="email"
                placeholder="Your email"
                className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary rounded-l-md transition"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white font-medium text-sm rounded-r-md transition transform hover:scale-105 hover:shadow-lg"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-4 text-sm text-gray-600 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <p>© {new Date().getFullYear()} MediCare. All rights reserved.</p>
          {/* <p>Built with ♥ by our dev team</p> */}
        </div>
      </div>
    </footer>
  );
}
