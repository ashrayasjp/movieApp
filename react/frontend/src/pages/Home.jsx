import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function Home() {
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [topMovies, setTopMovies] = useState([]);
  const [currentMovies, setCurrentMovies] = useState([]);
  const [fade, setFade] = useState(false);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  // Fetch top 50 most popular non-adult movies from TMDb
  const fetchTopMovies = async () => {
    try {
      let allMovies = [];
      let page = 1;
      while (allMovies.length < 50) {
        const res = await axios.get("https://api.themoviedb.org/3/movie/popular", {
          params: { api_key: API_KEY, page },
        });
        const safeMovies = res.data.results.filter(movie => !movie.adult);
        allMovies = [...allMovies, ...safeMovies];
        page++;
      }
      setTopMovies(allMovies.slice(0, 50));
    } catch (err) {
      console.error("Failed to fetch top movies:", err);
    }
  };

  // Rotate 12 movies at a time with fade effect
  useEffect(() => {
    fetchTopMovies();
  }, []);

  useEffect(() => {
    if (!topMovies.length) return;

    let startIndex = 0;
    const updateMovies = () => {
      setFade(true);

      setTimeout(() => {
        const nextMovies = [];
        for (let i = 0; i < 12; i++) {
          nextMovies.push(topMovies[(startIndex + i) % topMovies.length]);
        }
        setCurrentMovies(nextMovies);
        setFade(false);

        startIndex = (startIndex + 12) % topMovies.length;
      }, 500);
    };

    updateMovies();
    const interval = setInterval(updateMovies, 7000);

    return () => clearInterval(interval);
  }, [topMovies]);

  // Search movies (exclude adult)
  const fetchMovies = async (query) => {
    if (!query.trim()) {
      setFilteredMovies([]);
      setSearched(false);
      return;
    }

    try {
      const res = await axios.get("https://api.themoviedb.org/3/search/movie", {
        params: { api_key: API_KEY, query },
      });
      const safeResults = res.data.results.filter(movie => !movie.adult);
      setFilteredMovies(safeResults);
      setSearched(true);
    } catch (err) {
      console.error("Movie search failed:", err);
      setFilteredMovies([]);
      setSearched(true);
    }
  };

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedFetch = debounce(fetchMovies, 300);
  const handleSearch = (query) => debouncedFetch(query);
  const resetSearch = () => {
    setFilteredMovies([]);
    setSearched(false);
  };
  const handleMovieClick = (movie) => navigate(`/movie/${movie.id}`);

  // Split 12 movies into two rows of 6
  const row1 = currentMovies.slice(0, 6);
  const row2 = currentMovies.slice(6, 12);

  // Listen for logout event to clear username
  useEffect(() => {
    const handleReset = () => resetSearch();
    const handleLogoutEvent = () => setUsername("");

    window.addEventListener("resetHomeSearch", handleReset);
    window.addEventListener("userAuthChange", handleLogoutEvent);

    return () => {
      window.removeEventListener("resetHomeSearch", handleReset);
      window.removeEventListener("userAuthChange", handleLogoutEvent);
    };
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>{username ? `Welcome, ${username}` : "Welcome"}</h2>
        <SearchBar placeholder="Search TMDB..." onSearch={handleSearch} onReset={resetSearch} />
      </div>

      {/* Carousel with fade */}
      {!searched && filteredMovies.length === 0 && (
        <div style={{ opacity: fade ? 0 : 1, transition: "opacity 0.5s ease-in-out" }}>
          {[row1, row2].map((row, idx) => (
            <div
              key={idx}
              style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "20px" }}
            >
              {row.map((movie) => (
                <div
                  key={movie.id}
                  className="movie-card"
                  onClick={() => handleMovieClick(movie)}
                  style={{ cursor: "pointer", width: "180px", textAlign: "center" }}
                >
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                        : "https://via.placeholder.com/180x270?text=No+Image"
                    }
                    alt={movie.title}
                    style={{ width: "100%", borderRadius: "10px" }}
                  />
                  <p style={{ margin: "8px 0", fontWeight: "bold", fontSize: "16px" }}>
                    {movie.title} ({movie.release_date?.slice(0, 4) || "N/A"})
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Search results */}
      {searched && filteredMovies.length === 0 && <p style={{ marginTop: "20px" }}>No results found.</p>}
      {filteredMovies.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop: "30px" }}>
          {filteredMovies.map((movie) => (
            <div
              key={movie.id}
              className="movie-card"
              onClick={() => handleMovieClick(movie)}
              style={{ cursor: "pointer", width: "150px", textAlign: "center" }}
            >
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                    : "https://via.placeholder.com/150x225?text=No+Image"
                }
                alt={movie.title}
                style={{ width: "100%", borderRadius: "6px" }}
              />
              <p style={{ margin: "5px 0", fontWeight: "bold", fontSize: "14px" }}>
                {movie.title} ({movie.release_date?.slice(0, 4) || "N/A"})
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
