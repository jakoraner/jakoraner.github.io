// LazyLoadIframe.js
import React, { useEffect, useRef, useState } from 'react';

const LazyLoadIframe = ({ src, title, width, height, frameBorder, allow, style }) => {
  const iframeRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '200px', // Start loading before the iframe enters the viewport
      }
    );

    if (iframeRef.current) {
      observer.observe(iframeRef.current);
    }

    return () => {
      if (iframeRef.current) {
        observer.unobserve(iframeRef.current);
      }
    };
  }, []);

  return (
    <div ref={iframeRef} style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
      {isVisible ? (
        <iframe
          src={src}
          title={title}
          width={width}
          height={height}
          frameBorder={frameBorder}
          allow={allow}
          style={style}
          loading="lazy"
        ></iframe>
      ) : (
        <div className="bg-gray-300 animate-pulse" style={{ width: '100%', height: '100%', borderRadius: '12px' }}>
          {/* Optional: Add a spinner or placeholder image */}
        </div>
      )}
    </div>
  );
};

export default LazyLoadIframe;