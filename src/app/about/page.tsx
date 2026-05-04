export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-black mb-8 text-kflick-red">About KFlick</h1>
      <div className="prose prose-invert prose-red max-w-none text-kflick-light/80 space-y-6">
        <p>
          Welcome to <strong>KFlick</strong>, your premier source for the most comprehensive and engaging reviews of Korean dramas and movies.
        </p>
        <p>
          In a world where K-content is taking the global stage by storm, we realized there was a need for a dedicated platform that bridges the gap between Korea&apos;s entertainment industry and fans worldwide.
        </p>
        <h2 className="text-2xl font-bold text-white mt-12">Our Mission</h2>
        <p>
          Our mission is to provide international fans with high-quality, AI-curated reviews that help them decide what to watch next in the vast world of K-Dramas and K-Movies. We combine the latest data from TMDB with advanced AI technology to deliver insightful critiques, acting analyses, and viewing recommendations.
        </p>
        <h2 className="text-2xl font-bold text-white mt-12">How It Works</h2>
        <p>
          Every day, our automated system scans for the latest and most popular content from Korea. Using state-of-the-art AI models, we generate in-depth reviews that focus on what international viewers care about most: plot depth, character development, and cultural context.
        </p>
      </div>
    </div>
  );
}
