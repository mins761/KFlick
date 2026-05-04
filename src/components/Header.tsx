'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-kflick-dark/80 backdrop-blur-md border-b border-kflick-border' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-black text-kflick-red tracking-tighter">KFLICK</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-kflick-light/80">
              <Link href="/category/drama" className="hover:text-kflick-red transition-colors">Drama</Link>
              <Link href="/category/movie" className="hover:text-kflick-red transition-colors">Movie</Link>
              <Link href="/category/top-rated" className="hover:text-kflick-red transition-colors">Top Rated</Link>
              <Link href="/category/new" className="hover:text-kflick-red transition-colors">New Releases</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-kflick-light hover:text-kflick-red transition-colors">
              <Search size={20} />
            </button>
            <Link
              href="/subscribe"
              className="px-4 py-2 bg-kflick-gold text-kflick-dark text-sm font-bold rounded-md hover:bg-kflick-gold/90 transition-colors"
            >
              Subscribe
            </Link>
          </div>
        </div>
      </div>
      {!isScrolled && (
        <div className="hidden sm:block text-center pb-2">
          <p className="text-[10px] text-kflick-light/40 uppercase tracking-[0.2em]">
            Korea&apos;s Best Dramas & Movies, Reviewed
          </p>
        </div>
      )}
    </header>
  );
}
