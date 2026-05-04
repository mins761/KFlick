export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-black mb-8 text-white">Privacy Policy</h1>
      <div className="prose prose-invert max-w-none text-kflick-light/60 space-y-6 text-sm">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-bold text-white mt-8">1. Information We Collect</h2>
        <p>
          We only collect information that you voluntarily provide to us, such as your email address when you subscribe to our newsletter.
        </p>

        <h2 className="text-xl font-bold text-white mt-8">2. Use of Information</h2>
        <p>
          We use your email address solely to send you updates about new reviews and site news. We do not sell or share your personal information with third parties.
        </p>

        <h2 className="text-xl font-bold text-white mt-8">3. Cookies</h2>
        <p>
          We may use cookies to improve your browsing experience. You can choose to disable cookies through your browser settings.
        </p>

        <h2 className="text-xl font-bold text-white mt-8">4. Data Source</h2>
        <p>
          This website uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>
    </div>
  );
}
