import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { UserContext } from "../components/UserContext";

function Home() {
  const { user, setUser } = useContext(UserContext); // use UserContext
  const username = user?.username;
  const [topMovies, setTopMovies] = useState([]);
  const [currentMovies, setCurrentMovies] = useState([]);
  const [fadeInIndex, setFadeInIndex] = useState(-1);
  const [fadeOut, setFadeOut] = useState(false);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchTopMovies = async () => {
    try {
      let allMovies = [];
      let page = 1;

      while (allMovies.length < 50) {
        const res = await axios.get(`http://localhost:8080/api/movies/top-rated`, {
          params: { page },
        });

        const safeMovies = res.data.filter(movie => !movie.adult);
        allMovies = [...allMovies, ...safeMovies];
        page++;
        if (allMovies.length >= 50) break;
      }

      setTopMovies(allMovies.slice(0, 50));
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch movies:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopMovies();
  }, []);

  useEffect(() => {
    if (!topMovies.length) return;

    let startIndex = 0;

    const showNextSet = () => {
      const nextMovies = [];
      for (let i = 0; i < 12; i++) {
        nextMovies.push(topMovies[(startIndex + i) % topMovies.length]);
      }
      setCurrentMovies(nextMovies);
      setFadeInIndex(-1);
      setFadeOut(false);

      let index = 0;
      const fadeInterval = setInterval(() => {
        setFadeInIndex(index);
        index++;
        if (index >= nextMovies.length) clearInterval(fadeInterval);
      }, 200);

      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          startIndex = (startIndex + 12) % topMovies.length;
          showNextSet();
        }, 500);
      }, 5000 + nextMovies.length * 200);
    };

    showNextSet();
  }, [topMovies]);

  // Search movies
  const fetchMovies = async (query) => {
    if (!query.trim()) {
      setFilteredMovies([]);
      setSearched(false);
      return;
    }
    try {
      const res = await axios.get(`http://localhost:8080/api/movies/search`, {
        params: { query },
      });
      const safeResults = res.data.filter(movie => !movie.adult);
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

  const handleLogout = () => {
    setUser(null); // clear user in context
    window.dispatchEvent(new Event("userAuthChange"));
  };

  const row1 = currentMovies.slice(0, 6);
  const row2 = currentMovies.slice(6, 12);

  useEffect(() => {
    const handleReset = () => resetSearch();
    const handleLogoutEvent = () => setUser(null);

    window.addEventListener("resetHomeSearch", handleReset);
    window.addEventListener("userAuthChange", handleLogoutEvent);

    return () => {
      window.removeEventListener("resetHomeSearch", handleReset);
      window.removeEventListener("userAuthChange", handleLogoutEvent);
    };
  }, [setUser]);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>
          {username ? `Welcome, ${username}` : "Welcome"}{" "}
        </h2>
        <SearchBar placeholder="Search movies..." onSearch={handleSearch} onReset={resetSearch} />
      </div>

     
      {loading && <p style={{ marginTop: "20px" }}>Loading movies...</p>}

      {/* Carousel */}
      {!loading && !searched && filteredMovies.length === 0 && (
        <div style={{ opacity: fadeOut ? 0 : 1, transition: "opacity 0.5s ease-in-out" }}>
          {[row1, row2].map((row, idx) => (
            <div
              key={idx}
              style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "20px" }}
            >
              {row.map((movie, index) => (
                <div
                  key={movie.id}
                  className="movie-card"
                  onClick={() => handleMovieClick(movie)}
                  style={{
                    cursor: "pointer",
                    width: "180px",
                    textAlign: "center",
                    opacity: index <= fadeInIndex ? 1 : 0,
                    transition: "opacity 0.5s ease-in-out",
                  }}
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