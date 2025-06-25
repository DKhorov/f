import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../axios';
import '../../style/work/work.scss';
import MusicItem from '../components/Music/MusicItem';
import MusicPlayer from '../components/Music/MusicPlayer';

const ArtistPage = () => {
  const { artistName } = useParams();
  const [artistTracks, setArtistTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [artistInfo, setArtistInfo] = useState(null);

  useEffect(() => {
    const fetchArtistTracks = async () => {
      try {
        const { data } = await axios.get('/music');
        const decodedArtistName = decodeURIComponent(artistName);
        
        // Фильтруем треки по артисту
        const tracks = data.filter(track => 
          track.artist && track.artist.toLowerCase().trim() === decodedArtistName.toLowerCase().trim()
        );

        setArtistTracks(tracks);
        
        // Создаем информацию об артисте
        if (tracks.length > 0) {
          const firstTrack = tracks[0];
          let cover = firstTrack.image || 'https://cdn.pixabay.com/photo/2018/04/18/18/56/user-3331256_960_720.png';
          
          // Специальные изображения для известных артистов
          if (decodedArtistName.toLowerCase().trim() === 'queen') {
            cover = 'https://i.scdn.co/image/b040846ceba13c3e9c125d68389491094e7f2982';
          } else if (decodedArtistName.toLowerCase().trim() === 'atomglide') {
            cover = 'https://i1.sndcdn.com/artworks-sb7bSnJuhq4CHDfY-cSm8mg-t500x500.jpg';
          } else if (decodedArtistName.toLowerCase().trim() === 'eminem') {
            cover = 'https://tophit.com/_next/image?url=https%3A%2F%2Ff.tophit.com%2Fget.php%3Fw%3D1080%26h%3D1080%26id%3D2236&w=256&q=75';
          }

          setArtistInfo({
            name: decodedArtistName,
            cover: cover,
            trackCount: tracks.length
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Ошибка загрузки треков артиста:', err);
        setLoading(false);
      }
    };

    fetchArtistTracks();
  }, [artistName]);

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!artistInfo) {
    return (
      <div className="mu">
        <div className='ad-music'>
          <h1 className='ad-music-title'>Артист не найден</h1>
          <h4 className="ad-music-subtitle">
            Артист "{decodeURIComponent(artistName)}" не найден в базе данных.
          </h4>
          <Link to="/artists" style={{ color: '#0366d6', textDecoration: 'none' }}>
            ← Вернуться к списку артистов
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mu">
      <div className='ad-music'>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          <img 
            src={artistInfo.cover} 
            alt={artistInfo.name} 
            style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              objectFit: 'cover',
              border: '3px solid #30363d'
            }} 
          />
          <div>
            <h1 className='ad-music-title'>{artistInfo.name}</h1>
            <h4 className="ad-music-subtitle">
              {artistInfo.trackCount} {artistInfo.trackCount === 1 ? 'трек' : 
                artistInfo.trackCount < 5 ? 'трека' : 'треков'}
            </h4>
          </div>
        </div>
        <Link to="/artists" style={{ 
          color: '#0366d6', 
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px'
        }}>
          ← Вернуться к списку артистов
        </Link>
      </div>

      <div className="tracks-container">
        {artistTracks.length > 0 ? (
          artistTracks.map((track) => (
            <MusicItem key={track._id} track={track} />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>У этого артиста пока нет треков</p>
          </div>
        )}
      </div>

      <MusicPlayer />
    </div>
  );
};

export default ArtistPage;