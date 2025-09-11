import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AddToDiary from '../components/AddToDiary';
import AddToWatchlist from '../components/AddToWatchlist';
import { useUser } from '../components/UserContext';

function MovieDetail() {
  const { id } = useParams();
  const { user } = useUser(); 
  const username = user?.username || null;

  const [movie, setMovie] = useState(null);
  const [directors, setDirectors] = useState([]);
  const [directorVisible, setDirectorVisible] = useState(false); 
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [editing, setEditing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [similarMovies, setSimilarMovies] = useState([]);

  const fetchMovieData = (movieId) => {
    axios.get(`http://localhost:8080/api/movies/${movieId}`)
      .then(res => setMovie(res.data))
      .catch(console.error);

    axios.get(`http://localhost:8080/api/movies/${movieId}/credits`)
      .then(res => {
        const directorList = res.data.crew
          .filter(member => member.job === 'Director')
          .map(member => member.name);
        setDirectors(directorList);
      })
      .catch(console.error);

    axios.get(`http://localhost:8080/api/reviews/${movieId}`, { withCredentials: true })
      .then(res => setReviews(res.data))
      .catch(console.error);

    axios.get(`http://localhost:8080/api/movies/${movieId}/similar`)
      .then(res => setSimilarMovies(res.data.slice(0, 10)))
      .catch(console.error);
  };

  // Check if current user liked the movie
  const checkUserLiked = () => {
    if (!username) return setLiked(false);
    const likedMovies = JSON.parse(localStorage.getItem(`${username}_liked`) || "[]");
    setLiked(likedMovies.includes(String(id)));
  };

  useEffect(() => {
    fetchMovieData(id);
    checkUserLiked();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, username]);

  useEffect(() => {
    if (directors.length > 0) {
      const timer = setTimeout(() => setDirectorVisible(true), 200);
      return () => clearTimeout(timer);
    }
  }, [directors]);


  const handleToggleLike = () => {
    if (!username) return alert("Please log in to like movies.");
    let likedMovies = JSON.parse(localStorage.getItem(`${username}_liked`) || "[]");
    if (liked) likedMovies = likedMovies.filter(movieId => movieId !== String(id));
    else likedMovies.push(String(id));
    localStorage.setItem(`${username}_liked`, JSON.stringify(likedMovies));
    setLiked(!liked);
    window.dispatchEvent(new Event('likedMoviesUpdated')); 
  };

  // Reviews
  const handleAddReview = async () => {
    if (!newReview.trim()) return;
    try {
      const res = await axios.post(
        `http://localhost:8080/api/reviews/${id}`,
        { username, text: newReview },
        { withCredentials: true }
      );
      setReviews([...reviews, res.data]);
      setNewReview('');
    } catch (err) { console.error(err); }
  };

  const handleEditReview = async () => {
    const userReview = reviews.find(r => r.username === username);
    if (!userReview || !newReview.trim()) return;
    try {
      const res = await axios.put(
        `http://localhost:8080/api/reviews/${id}/${userReview.id}`,
        { username, text: newReview },
        { withCredentials: true }
      );
      setReviews(reviews.map(r => r.id === userReview.id ? res.data : r));
      setEditing(false);
      setNewReview('');
    } catch (err) { console.error(err); }
  };

  const handleDeleteReview = async () => {
    const userReview = reviews.find(r => r.username === username);
    if (!userReview) return;
    try {
      await axios.delete(
        `http://localhost:8080/api/reviews/${id}/${userReview.id}?username=${username}`,
        { withCredentials: true }
      );
      setReviews(reviews.filter(r => r.id !== userReview.id));
      setNewReview('');
      setEditing(false);
    } catch (err) { console.error(err); }
  };

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

        {directors.length > 0 && (
          <p
            style={{
              opacity: directorVisible ? 1 : 0,
              transform: directorVisible ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.8s ease, transform 0.8s ease',
              fontWeight: '600',
              fontSize: '18px',
              marginTop: '10px',
              color: 'green',
            }}
          >
            Director{directors.length > 1 ? 's' : ''}: {directors.join(', ')}
          </p>
        )}

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
        
        {similarMovies.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3>Similar Movies</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
              {similarMovies.map(sm => (
                <div
                  key={sm.id}
                  style={{ width: '160px', textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => (window.location.href = `/movie/${sm.id}`)}
                >
                  <img
                    src={sm.poster_path ? `https://image.tmdb.org/t/p/w300${sm.poster_path}` : "https://via.placeholder.com/200x225?text=No+Image"}
                    alt={sm.title}
                    style={{ width: '100%', borderRadius: '8px' ,  margin: '0px', }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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
            {userReview && !editing && (
              <>
                <strong>Your review:</strong>
                <p style={{ margin: '5px 0' }}>{userReview.text}</p>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { setEditing(true); setNewReview(userReview.text); }}
                    style={{ padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#4caf50', color: 'white' }}
                  >✏️</button>
                  <button
                    onClick={handleDeleteReview}
                    style={{ padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'red', color: 'white' }}
                  >🗑</button>
                </div>
              </>
            )}

            {editing && (
              <>
                <textarea
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  rows={3}
                  placeholder="Add your review"
                  style={{
                    width: '90%',
                    marginTop: '10px',
                    backgroundColor: 'whitesmoke',
                    fontSize: '16px',
                    color: 'black',
                    padding: '10px',
                    border: '1px solid black',
                    outline: 'none',
                    resize: 'none',
                    overflowY: 'auto'
                  }}
                />
                <div style={{ marginTop: '5px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleEditReview}
                    style={{ padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#6b14bd', color: 'white' }}
                  >💾</button>
                  <button
                    onClick={() => { setEditing(false); setNewReview(''); }}
                    style={{ padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'red', color: 'white' }}
                  >✖</button>
                </div>
              </>
            )}

            {!userReview && !editing && (
              <>
                <textarea
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  rows={3}
                  placeholder="Add your review"
                  style={{
                    width: '90%',
                    marginTop: '10px',
                    backgroundColor: '#e6f5e6',
                    fontSize: '16px',
                    color: 'black',
                    padding: '8px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    resize: 'none',
                    overflowY: 'auto'
                  }}
                />
                <button
                  onClick={handleAddReview}
                  style={{ marginTop: '5px', backgroundColor: '#6b14bd', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}
                >
                  Submit Review
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieDetail;
