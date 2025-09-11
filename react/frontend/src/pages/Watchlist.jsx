import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { useUser } from "../components/UserContext";

function Watchlist() {
  const { user } = useUser();
  const username = user?.username;
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [tmdbResults, setTmdbResults] = useState([]);
  const [filteredTmdb, setFilteredTmdb] = useState([]);
  const navigate = useNavigate();

  const fetchMovies = async () => {
    if (!username) return;
    try {
      const response = await axios.get(`http://localhost:8080/api/watchlist/${username}`);
      setMovies(response.data);
      setFilteredMovies(response.data);
    } catch (error) {
      console.error("Error fetching watchlist movies:", error);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [username]);

  if (!user) return <p>Please log in to see your watchlist.</p>;

  const handleRemove = async (movieId) => {
    try {
      await axios.delete(`http://localhost:8080/api/watchlist/${movieId}`);
      fetchMovies();
    } catch (error) {
      console.error("Error removing movie:", error);
      alert("Failed to remove movie");
    }
  };

  const fetchTmdb = async (query) => {
    if (!query.trim()) {
      setFilteredTmdb([]);
      return;
    }
    try {
      const response = await axios.get(`http://localhost:8080/api/movies/search`, {
        params: { query },
      });
      const safeResults = response.data.results.filter((movie) => !movie.adult);
      setTmdbResults(safeResults);
      setFilteredTmdb(safeResults);
    } catch (error) {
      console.error("Error fetching TMDb movies:", error);
      setFilteredTmdb([]);
    }
  };

  const handleSearch = (query) => {
    const lowerQuery = query.toLowerCase();
    setFilteredMovies(
      movies.filter((movie) => movie.movieTitle.toLowerCase().includes(lowerQuery))
    );
    fetchTmdb(query);
  };

  const handleReset = () => {
    setFilteredMovies([...movies]);
    setFilteredTmdb([]);
  };

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.tmdbId || movie.id}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ marginBottom: "15px" }}>{username}'s Watchlist</h2>
        <SearchBar placeholder="Search watchlist..." onSearch={handleSearch} onReset={handleReset} />
      </div>
      {filteredMovies.length === 0 ? (
        <p>No movies in watchlist.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", marginTop: "15px" }}>
          {filteredMovies.map((movie) => {
            const likedMovies = JSON.parse(localStorage.getItem(`${username}_liked`) || "[]");
            const isLiked = likedMovies.includes(movie.tmdbId);

            return (
              <div
                key={movie.id}
                className="movie-card"
                onClick={() => handleMovieClick(movie)}
                style={{
                  width: "200px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "3px",
                  cursor: "pointer",
                }}
              >
                <img
                  src={movie.posterUrl || "https://via.placeholder.com/200x300?text=No+Image"}
                  alt={movie.movieTitle}
                  style={{
                    width: "200px",
                    height: "300px",
                    objectFit: "cover",
                    border: "2px solid black",
                    borderRadius: "8px",
                    marginTop: "0px",
                    marginBottom: "8px",
                  }}
                />
                <h3 style={{ marginTop: "2px", fontSize: "16px", lineHeight: "1.2" }}>
                  {movie.movieTitle} {isLiked && "❤️"}
                </h3>
                <h4 style={{ margin: "0", fontSize: "14px", color: "#555" }}>
                  Added: {movie.addedDate}
                </h4>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(movie.id); }}
                  style={{
                    marginTop: "5px",
                    padding: "5px 10px",
                    cursor: "pointer",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      {filteredTmdb.length > 0 && (
        <>
          <h3 style={{ marginTop: "30px" }}>TMDb Search Results ({filteredTmdb.length})</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginTop: "15px" }}>
            {filteredTmdb.map((movie) => (
              <div
                key={movie.id}
                className="movie-card"
                onClick={() => handleMovieClick(movie)}
                style={{
                  width: "200px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                }}
              >
                <img
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : "https://via.placeholder.com/200x300?text=No+Image"}
                  alt={movie.title}
                  style={{
                    width: "200px",
                    height: "300px",
                    objectFit: "cover",
                    border: "2px solid black",
                    borderRadius: "8px",
                  }}
                />
                <h3 style={{ margin: "5px 0", fontSize: "16px", lineHeight: "1.2" }}>
                  {movie.title}
                </h3>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Watchlist;
