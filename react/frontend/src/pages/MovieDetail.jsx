import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AddToDiary from '../components/AddToDiary';
import AddToWatchlist from '../components/AddToWatchlist';
import { useUser } from '../components/UserContext';

function MovieDetail() {
  const { id } = useParams();
  const { user } = useUser(); // use context instead of localStorage
  const username = user?.username || null;

  const [movie, setMovie] = useState(null);
  const [directors, setDirectors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [editing, setEditing] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:8080/api/movies/${id}`)
      .then(res => setMovie(res.data))
      .catch(console.error);

    axios.get(`http://localhost:8080/api/movies/${id}/credits`)
      .then(res => {
        const directorList = res.data.crew
          .filter(member => member.job === 'Director')
          .map(member => member.name);
        setDirectors(directorList);
      })
      .catch(console.error);

    axios.get(`http://localhost:8080/api/reviews/${id}`, { withCredentials: true })
      .then(res => setReviews(res.data))
      .catch(console.error);

    if (username) {
      const likedMovies = JSON.parse(localStorage.getItem(`${username}_liked`) || "[]");
      setLiked(likedMovies.includes(String(id)));
    }
  }, [id, username]);

  const handleToggleLike = () => {
    if (!username) return alert("Please log in to like movies.");

    let likedMovies = JSON.parse(localStorage.getItem(`${username}_liked`) || "[]");
    if (liked) {
      likedMovies = likedMovies.filter(movieId => movieId !== String(id));
    } else {
      likedMovies.push(String(id));
    }
    localStorage.setItem(`${username}_liked`, JSON.stringify(likedMovies));
    setLiked(!liked);

    // Notify other pages like Diary to update
    window.dispatchEvent(new Event('likedMoviesUpdated'));
  };

  // ...rest of review functions remain unchanged...

  if (!movie) return <p>Loading...</p>;

  const userReview = reviews.find(r => r.username === username);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ flex: 1.2, minWidth: '300px' }}>
        <h2>{movie.title}</h2>
        <img
          src={movie.poster_path || movie.posterUrl ? `https://image.tmdb.org/t/p/w300${movie.poster_path || movie.posterUrl}` : "https://via.placeholder.com/300x450?text=No+Image"}
          alt={movie.title}
          height='300'
          width='300'
          style={{ marginBottom: '15px' }}
        />
        <p style={{ textAlign: 'justify', maxWidth: '600px' }}>{movie.overview}</p>
        <p>Release Date: {movie.release_date}</p>
        <p>Rating: {movie.vote_average}</p>
        {directors.length > 0 && <p>Director{directors.length > 1 ? 's' : ''}: {directors.join(', ')}</p>}

        {username && (
          <button
            onClick={handleToggleLike}
            style={{
              fontSize: '18px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              marginTop: '0px',
              padding: '0px',
              outline: 'none',
              marginBottom: '7px',
              marginLeft: '20px',
              color: liked ? 'red' : 'gray'
            }}
            title={liked ? 'Unlike this movie' : 'Like this movie'}
          >
            {liked ? '❤️ Liked' : '🤍 Like'}
          </button>
        )}

        <br />
        <AddToDiary movie={movie} />
        <br /><br />
        <AddToWatchlist movie={movie} />
      </div>

      {/* Reviews */}
      <div className="review-section" style={{ flex: 1, minWidth: '300px', borderLeft: '1px solid #ccc', padding: '20px', display: 'flex', flexDirection: 'column', maxHeight: '600px', overflowY: 'auto' }}>
        <h3>Reviews</h3>
        {reviews.length === 0 && <p>No reviews yet.</p>}
        {reviews.map(r => (
          <div key={r.id} style={{ marginBottom: '15px', wordWrap: 'break-word' }}>
            <strong>{r.username}:</strong> {r.text}
          </div>
        ))}
        {username && (
          <div style={{ marginTop: '20px', padding: '10px' }}>
            {/* User review input and buttons remain unchanged */}
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieDetail;
