const SkeletonGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse bg-white/60 rounded-2xl border border-gray-100 p-6">
        <div className="h-6 w-40 bg-gray-200 rounded mb-3" />
        <div className="h-4 w-full bg-gray-200 rounded mb-2" />
        <div className="h-4 w-2/3 bg-gray-200 rounded mb-4" />
        <div className="h-8 w-28 bg-gray-200 rounded-full" />
      </div>
    ))}
  </div>
);
export default SkeletonGrid;
