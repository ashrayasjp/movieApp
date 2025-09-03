import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar"; 

function Diary() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const username = localStorage.getItem("username")?.trim();
  const navigate = useNavigate();

  // Fetch diary movies
  const fetchMovies = async () => {
    if (!username) return;
    try {
      const response = await axios.get(`http://localhost:8080/api/diary/${username}`);
      setMovies(response.data);
      setFilteredMovies(response.data); 
    } catch (error) {
      console.error("Error fetching diary movies:", error);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [username]);

  // Live search handler
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

  if (!username) return null; 

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.tmdbId}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ marginBottom: "15px" }}>{username}'s Diary</h2>
        <SearchBar
          placeholder="Search in diary..."
          onSearch={handleSearch}
          onReset={() => setFilteredMovies([...movies])}
        />
      </div>

      {filteredMovies.length === 0 ? (
        <p>No movies found.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginTop: "15px" }}>
          {filteredMovies.map((movie) => (
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
                cursor: "pointer"
              }}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Diary;
