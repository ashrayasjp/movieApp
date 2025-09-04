import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar"; 

function Watchlist() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const username = localStorage.getItem("username")?.trim();

  // Fetch movies from backend
  const fetchMovies = async () => {
    if (!username) return;
    try {
      // Fetch user's watchlist from your Spring Boot backend
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

  if (!username) return null;

  const handleRemove = async (movieId) => {
    try {
      // Remove movie via backend
      await axios.delete(`http://localhost:8080/api/watchlist/${movieId}`);
      fetchMovies(); 
    } catch (error) {
      console.error("Error removing movie:", error);
      alert("Failed to remove movie");
    }
  };

  // Search handler
  const handleSearch = (query) => {
    if (!query.trim()) {
      setFilteredMovies([...movies]); 
      return;
    }
    const lowerQuery = query.toLowerCase();
    setFilteredMovies(
      movies.filter((movie) =>
        movie.movieTitle.toLowerCase().includes(lowerQuery)
      )
    );
  };

  // Reset handler when search bar closes
  const handleReset = () => {
    setFilteredMovies([...movies]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ marginBottom: "15px" }}>{username}'s Watchlist</h2>
        <SearchBar
          placeholder="Search movies in watchlist..."
          onSearch={handleSearch}
          onReset={handleReset} 
        />
      </div>

      {filteredMovies.length === 0 ? (
        <p>No movies in watchlist.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginTop: "15px" }}>
          {filteredMovies.map((movie) => (
            <div
              key={movie.id}
              className="movie-card" 
              style={{
                width: "200px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Link
                to={`/movie/${movie.tmdbId}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <img
                  src={movie.posterUrl}
                  alt={movie.movieTitle}
                  style={{
                    width: "200px",
                    height: "300px",
                    objectFit: "cover",
                    border: "2px solid black",
                    borderRadius: "8px",
                  }}
                />
                <h3 style={{ margin: "5px 0", fontSize: "16px", lineHeight: "1.2" }}>
                  {movie.movieTitle}
                </h3>
                <h4 style={{ margin: "0", fontSize: "14px", color: "#555" }}>
                  Added: {movie.addedDate}
                </h4>
              </Link>
              <button
                onClick={() => handleRemove(movie.id)}
                style={{
                  marginTop: "8px",
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
          ))}
        </div>
      )}
    </div>
  );
}

export default Watchlist;
