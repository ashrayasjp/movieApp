import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import AddToDiary from '../components/AddToDiary';
import AddToWatchlist from '../components/AddtoWatchlist';

function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [directors, setDirectors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [editing, setEditing] = useState(false);
  const username = localStorage.getItem('username') || 'Anonymous';

  useEffect(() => {
    // Fetch movie details from backend
    axios.get(`http://localhost:8080/api/movies/${id}`)
      .then(res => setMovie(res.data))
      .catch(console.error);

    // Fetch movie credits (directors) from backend
    axios.get(`http://localhost:8080/api/movies/${id}/credits`)
      .then(res => {
        const directorList = res.data.crew
          .filter(member => member.job === 'Director')
          .map(member => member.name);
        setDirectors(directorList);
      })
      .catch(console.error);

    // Fetch reviews from backend
    axios.get(`http://localhost:8080/api/reviews/${id}`, { withCredentials: true })
      .then(res => setReviews(res.data))
      .catch(console.error);
  }, [id]);

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
    } catch (err) {
      console.error(err);
    }
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
    } catch (err) {
      console.error(err);
    }
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
    } catch (err) {
      console.error(err);
    }
  };

  if (!movie) return <p>Loading...</p>;

  const userReview = reviews.find(r => r.username === username);

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px',
      padding: '20px',
      width: '100%',
      boxSizing: 'border-box',
      overflowX: 'hidden',
      marginLeft: '-10px'
    }}>
      {/* Movie Info */}
      <div style={{ flex: 1.2, minWidth: '300px' }}>
        <h2>{movie.title}</h2>
        <img
          src={movie.poster_path || movie.posterUrl ? `https://image.tmdb.org/t/p/w300${movie.poster_path || movie.posterUrl}` : "https://via.placeholder.com/300x450?text=No+Image"}
          alt={movie.title}
          height='300'
          width='300'
          style={{ marginBottom: '20px' }}
        />
        <p style={{ textAlign: 'justify', maxWidth: '600px' }}>{movie.overview}</p>
        <p>Release Date: {movie.release_date}</p>
        <p>Rating: {movie.vote_average}</p>
        {directors.length > 0 && <p>Director{directors.length > 1 ? 's' : ''}: {directors.join(', ')}</p>}
        <AddToDiary movie={movie} /><br /><br />
        <AddToWatchlist movie={movie} />
      </div>

      {/* Reviews */}
      <div className="review-section" style={{
        flex: 1,
        minWidth: '300px',
        borderLeft: '1px solid #ccc',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '600px',
        overflowY: 'auto'
      }}>
        <h3>Reviews</h3>

        {reviews.length === 0 && <p>No reviews yet.</p>}
        {reviews.map(r => (
          <div key={r.id} style={{ marginBottom: '15px', wordWrap: 'break-word' }}>
            <strong>{r.username}:</strong> {r.text}
          </div>
        ))}

        {/* Current User Review */}
        {username !== 'Anonymous' && (
          <div style={{ marginTop: '20px', padding: '10px' }}>
            {userReview && !editing && (
              <>
                <strong>Your review:</strong>
                <p style={{ margin: '5px 0' }}>{userReview.text}</p>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { setEditing(true); setNewReview(userReview.text); }}
                    style={{ padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#4caf50', color: 'white' }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    style={{ padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'red', color: 'white' }}
                  >
                    🗑
                  </button>
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
                  >
                    💾
                  </button>
                  <button
                    onClick={() => { setEditing(false); setNewReview(''); }}
                    style={{ padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'red', color: 'white' }}
                  >
                    ✖
                  </button>
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
