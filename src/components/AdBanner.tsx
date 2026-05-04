export default function AdBanner() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
      <div className="w-full h-32 bg-kflick-gray border border-kflick-border rounded-lg flex items-center justify-center overflow-hidden relative">
        <div className="text-center">
          <p className="text-[10px] text-kflick-light/20 uppercase tracking-[0.3em] mb-1">Advertisement</p>
          <p className="text-kflick-light/40 font-medium">Place your ad here</p>
        </div>
        <div className="absolute top-0 right-0 p-1">
          <span className="text-[8px] text-kflick-light/20 border border-kflick-light/10 px-1 rounded">AD</span>
        </div>
      </div>
    </div>
  );
}
