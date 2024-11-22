import React from 'react';

const SpotifyPlaylists = () => {
  return (
    <section id="spotify-playlists" className="my-12">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">Spotify Playlists</h2>
      <p className="mb-6">Check out my favorite playlists below:</p>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <iframe
          style={{ borderRadius: '12px' }}
          src="https://open.spotify.com/embed/playlist/6l5gAIg1vVZPD8NSP6guPh?utm_source=generator"
          width="100%"
          height="352"
          frameBorder="0"
          allowFullScreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Spotify Playlist"
        ></iframe>
      </div>
    </section>
  );
};

export default SpotifyPlaylists;