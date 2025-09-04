import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";

function Diary() {
  const [diaryMovies, setDiaryMovies] = useState([]);
  const [tmdbResults, setTmdbResults] = useState([]);
  const [filteredDiary, setFilteredDiary] = useState([]);
  const [filteredTmdb, setFilteredTmdb] = useState([]);
  const username = localStorage.getItem("username")?.trim();
  const navigate = useNavigate();

  // Fetch diary movies
  const fetchDiary = async () => {
    if (!username) return;
    try {
      const response = await axios.get(`http://localhost:8080/api/diary/${username}`);
      setDiaryMovies(response.data);
      setFilteredDiary(response.data);
    } catch (error) {
      console.error("Error fetching diary movies:", error);
    }
  };

  useEffect(() => {
    fetchDiary();
  }, [username]);

  // Fetch TMDb search results
  const fetchTmdb = async (query) => {
    if (!query.trim()) {
      setFilteredTmdb([]);
      return;
    }
    try {
      const response = await axios.get(`http://localhost:8080/api/movies/search`, {
        params: { query },
      });
      const safeResults = response.data.results.filter(movie => !movie.adult);
      setTmdbResults(safeResults);
      setFilteredTmdb(safeResults);
    } catch (error) {
      console.error("Error fetching TMDb movies:", error);
      setFilteredTmdb([]);
    }
  };

  // Combined live search
  const handleSearch = (query) => {
    const lowerQuery = query.toLowerCase();

    // Filter diary movies
    setFilteredDiary(
      diaryMovies.filter((movie) =>
        movie.movieTitle.toLowerCase().includes(lowerQuery)
      )
    );

    // Fetch TMDb movies
    fetchTmdb(query);
  };

  if (!username) return <p>Please login to see your diary.</p>;

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.tmdbId || movie.id}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ marginBottom: "15px" }}>{username}'s Diary </h2>
        <SearchBar
          placeholder="Search diary"
          onSearch={handleSearch}
          onReset={() => {
            setFilteredDiary([...diaryMovies]);
            setFilteredTmdb([]);
          }}
        />
      </div>

      <h3>Diary Movies</h3>
      {filteredDiary.length === 0 ? (
        <p>No diary movies found.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", marginTop: "15px" }}>
          {filteredDiary.map((movie) => (
            <div
              key={movie.id}
              className="movie-card"
              onClick={() => handleMovieClick(movie)}
              style={{
                width: "200px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                aliagnItems: "center",
                gap: "5px",
                cursor: "pointer"
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
