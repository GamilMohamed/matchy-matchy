import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-900 text-gray-300 z-50">
      {/* Main Footer Content */}
      <div className="w-full px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Company Info */}
            <div className="space-y-2">
              <h3 className="text-white text-base font-semibold">Notre Société</h3>
              <div className="flex flex-col space-y-1 text-sm">
                <a href="/about" className="hover:text-white transition-colors">
                  À propos
                </a>
                <a href="/contact" className="hover:text-white transition-colors">
                  Contact
                </a>
                <a href="/careers" className="hover:text-white transition-colors">
                  Carrières
                </a>
              </div>
            </div>

            {/* Legal Links */}
            <div className="space-y-2">
              <h3 className="text-white text-base font-semibold">Légal</h3>
              <div className="flex flex-col space-y-1 text-sm">
                <a href="/privacy" className="hover:text-white transition-colors">
                  Confidentialité
                </a>
                <a href="/terms" className="hover:text-white transition-colors">
                  Conditions
                </a>
                <a href="/cookies" className="hover:text-white transition-colors">
                  Cookies
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <h3 className="text-white text-base font-semibold">Contact</h3>
              <div className="flex flex-col space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail size={14} />
                  <span>vacheratmatheo@gmail.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone size={14} />
                  <span>+33 6 10 73 50 61</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={14} />
                  <span>Paris, France</span>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-2">
              <h3 className="text-white text-base font-semibold">Suivez-nous</h3>
              <div className="flex space-x-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="https://x.com/neymarjr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="https://www.instagram.com/neymarjr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  <Instagram size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full bg-gray-950">
        <div className="max-w-7xl mx-auto py-2 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 text-xs">
            <p>
              © {currentYear} Matchy matchy Corporation. Tous droits réservés.
            </p>
            <div className="flex space-x-4">
              <a href="/sitemap" className="hover:text-white transition-colors">Plan du site</a>
              <a href="/faq" className="hover:text-white transition-colors">FAQ</a>
              <a href="/support" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;