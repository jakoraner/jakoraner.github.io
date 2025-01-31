// Playlists.js
import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import backgroundImage from '../assets/images/20240921_TQD001.jpeg';
import LazyLoadIframe from './LazyLoadIframe'; // Adjust the path accordingly

const Playlists = () => {
  // Original and new playlist data
  const initialPlaylistData = [
    // Existing Playlists
    {
      id: 1,
      src: 'https://open.spotify.com/embed/playlist/7uiCYNUjPjp3t1iEMKkR8n?utm_source=generator',
    },
    {
      id: 2,
      src: 'https://open.spotify.com/embed/playlist/6l5gAIg1vVZPD8NSP6guPh?utm_source=generator',
    },
    {
      id: 3,
      src: 'https://open.spotify.com/embed/playlist/2u0JMvwpbXqg00MyOOI6wK?utm_source=generator',
    },
    {
      id: 4,
      src: 'https://open.spotify.com/embed/playlist/5TbGG37R9SHuSuozvZl0tr?utm_source=generator',
    },
    {
      id: 5,
      src: 'https://open.spotify.com/embed/playlist/2h9qvBeLKfyzqocKbITkAB?utm_source=generator',
    },
    {
      id: 6,
      src: 'https://open.spotify.com/embed/playlist/5pnScjg95DAXNUv651FeO5?utm_source=generator',
    },
    // Previously Added Playlists
    {
      id: 7,
      src: 'https://open.spotify.com/embed/playlist/3jQzZFr4qy3NCiK6KKB6na?utm_source=generator',
    },
    {
      id: 8,
      src: 'https://open.spotify.com/embed/playlist/3A0SsCvFwRnopESF3pzUFE?utm_source=generator',
    },
    {
      id: 9,
      src: 'https://open.spotify.com/embed/playlist/0d3znV1Q3R2EsMQ6NBTjCN?utm_source=generator',
    },
    {
      id: 10,
      src: 'https://open.spotify.com/embed/playlist/6OP8UU7UT26QGBW9r0jUoI?utm_source=generator',
    },
    // **Newly Added Playlists**
    {
      id: 11,
      src: 'https://open.spotify.com/embed/playlist/0xHcMHCHUwRpj2VZBuq87V?utm_source=generator',
    },
    {
      id: 12,
      src: 'https://open.spotify.com/embed/playlist/1Ys8CePI3suGdcdLdQXzlj?utm_source=generator',
    },
    {
      id: 13,
      src: 'https://open.spotify.com/embed/playlist/1ruyJyYWFDMaCukUdW9hNO?utm_source=generator',
    },
    {
      id: 14,
      src: 'https://open.spotify.com/embed/playlist/4nQBbL7GEB3dAZtj1yTHOu?utm_source=generator',
    },
  ];

  const [playlistData, setPlaylistData] = useState([]);

  // Shuffle function using Fisher-Yates algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    // Shuffle playlists when the component mounts
    const shuffledPlaylists = shuffleArray(initialPlaylistData);
    setPlaylistData(shuffledPlaylists);
  }, []);

  return (
    <div>
      <Navbar />
      <section
        id="playlists"
        className="relative text-white py-16"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        {/* Content */}
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-extrabold mb-4 tracking-wide">
            Playlists
          </h2>
          <p className="mb-12 text-xl max-w-2xl mx-auto">
            Dive into my favorite tunes for any vibe!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {playlistData.map((playlist, index) => (
              <div
                key={playlist.id}
                className="transform hover:scale-105 transition-transform duration-500"
              >
                <LazyLoadIframe
                  src={playlist.src}
                  title={`Playlist ${index + 1}`}
                  width="100%"
                  height="380"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  style={{ borderRadius: '12px' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Playlists;