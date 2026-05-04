export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-black mb-8 text-white">Contact Us</h1>
      <p className="text-kflick-light/60 mb-12">
        Have questions, feedback, or a partnership inquiry? We&apos;d love to hear from you.
      </p>

      <div className="bg-kflick-gray rounded-2xl p-8 border border-kflick-border max-w-2xl">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-kflick-light/80 mb-2">Name</label>
            <input
              type="text"
              className="w-full bg-kflick-dark border border-kflick-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-kflick-red transition-colors"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-kflick-light/80 mb-2">Email</label>
            <input
              type="email"
              className="w-full bg-kflick-dark border border-kflick-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-kflick-red transition-colors"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-kflick-light/80 mb-2">Message</label>
            <textarea
              rows={5}
              className="w-full bg-kflick-dark border border-kflick-border rounded-md px-4 py-3 text-sm focus:outline-none focus:border-kflick-red transition-colors"
              placeholder="Your message here..."
            />
          </div>
          <button className="w-full py-4 bg-kflick-red text-white font-bold rounded-md hover:bg-kflick-red/90 transition-colors">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
