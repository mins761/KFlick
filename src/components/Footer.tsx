import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-kflick-dark border-t border-kflick-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-black text-kflick-red tracking-tighter">KFLICK</span>
            </Link>
            <p className="text-kflick-light/60 text-sm max-w-sm">
              Your ultimate destination for the latest Korean dramas and movies reviews. 
              Automatically curated, AI-reviewed, and designed for K-content lovers worldwide.
            </p>
          </div>
          <div>
            <h3 className="text-kflick-light font-bold mb-4">Explore</h3>
            <ul className="space-y-2 text-sm text-kflick-light/60">
              <li><Link href="/category/drama" className="hover:text-kflick-red transition-colors">Dramas</Link></li>
              <li><Link href="/category/movie" className="hover:text-kflick-red transition-colors">Movies</Link></li>
              <li><Link href="/category/top-rated" className="hover:text-kflick-red transition-colors">Top Rated</Link></li>
              <li><Link href="/category/new" className="hover:text-kflick-red transition-colors">New Releases</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-kflick-light font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-kflick-light/60">
              <li><Link href="/about" className="hover:text-kflick-red transition-colors">About Us</Link></li>
              <li><Link href="/privacy" className="hover:text-kflick-red transition-colors">Privacy Policy</Link></li>
              <li><Link href="/contact" className="hover:text-kflick-red transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-kflick-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-kflick-light/40">
            © {new Date().getFullYear()} KFlick. All rights reserved. Data provided by TMDB.
          </p>
          <div className="flex gap-6">
            {/* Social icons could go here */}
          </div>
        </div>
      </div>
    </footer>
  );
}
