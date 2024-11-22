import React from 'react';
import Navbar from './Navbar'; // Adjust the path based on your file structure

const Playlists = () => {
  const playlistData = [
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
  ];

  return (
    <div>
      <Navbar />
      <section id="playlists" className="my-12">
        <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center">Playlists</h2>
        <p className="mb-4 text-gray-600 text-center max-w-2xl mx-auto">
        Check out me fave tunes for any vibe, innit!
        </p>
        <div className="space-y-6">
          {playlistData.map((playlist, index) => (
            <div
              key={playlist.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <iframe
                style={{ borderRadius: '12px' }}
                src={playlist.src}
                width="100%"
                height="352"
                frameBorder="0"
                allowFullScreen=""
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title={`Playlist ${index + 1}`}
              ></iframe>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Playlists;