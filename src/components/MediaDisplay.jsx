const MediaDisplay = ({ url, alt }) => {
  const isVideo = url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.avi');

  if (isVideo) {
    return (
      <video controls className="w-full h-auto rounded-md mb-4" style={{ maxHeight: '400px' }}>
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <img src={url} alt={alt} className="w-full h-auto object-cover rounded-md mb-4" style={{ maxHeight: '400px' }} />
  );
};

export default MediaDisplay;