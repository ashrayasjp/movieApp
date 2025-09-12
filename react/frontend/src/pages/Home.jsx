import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { UserContext } from "../components/UserContext";

function Home() {
  const { user, setUser } = useContext(UserContext);
  const username = user?.username;

  const [topMovies, setTopMovies] = useState([]);
  const [currentMovies, setCurrentMovies] = useState([]);
  const [fadeInIndex, setFadeInIndex] = useState(-1);
  const [fadeOut, setFadeOut] = useState(false);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState("all"); 

  const navigate = useNavigate();
  const fetchTopMovies = async () => {
    try {
      let allMovies = [];
      let page = 1;
      while (allMovies.length < 50) {
        const res = await axios.get("http://localhost:8080/api/movies/top-rated", { params: { page } });
        allMovies = [
          ...allMovies,
          ...res.data.filter(movie => !movie.adult && movie.poster_path)
        ];
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

  useEffect(() => { fetchTopMovies(); }, []);
  useEffect(() => {
    if (!topMovies.length) return;
    let startIndex = 0;

    const showNextSet = () => {
      const nextMovies = [];
      for (let i = 0; i < 12; i++) nextMovies.push(topMovies[(startIndex + i) % topMovies.length]);
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
  const fetchSearchResults = async (query, type = "all") => {
    if (!query.trim()) {
      setFilteredMovies([]);
      setFilteredPeople([]);
      setSearched(false);
      return;
    }

    try {
      let movies = [];
      let people = [];

      if (type === "all" || type === "movie") {
        const movieRes = await axios.get("http://localhost:8080/api/movies/search", { params: { query } });
        movies = movieRes.data.filter(movie => !movie.adult && movie.poster_path); // filter
      }

      if (type === "all" || type === "person") {
        const personRes = await axios.get("http://localhost:8080/api/movies/search/person", { params: { query } });
        people = (personRes.data || []).filter(p => p.profile_path); // filter
      }

      setFilteredMovies(movies);
      setFilteredPeople(people);
      setSearched(true);
    } catch (err) {
      console.error("Search failed:", err);
      setFilteredMovies([]);
      setFilteredPeople([]);
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
  const debouncedFetch = debounce(fetchSearchResults, 300);
  const handleSearch = (query) => debouncedFetch(query, searchType);
  const resetSearch = () => { 
    setFilteredMovies([]); 
    setFilteredPeople([]); 
    setSearched(false); 
  };

  const handleMovieClick = (movie, e) => { e.stopPropagation(); navigate(`/movie/${movie.id}`); };
  const handlePersonClick = (person, e) => { e.stopPropagation(); navigate(`/person/${person.id}`); };
  const handleLogout = () => { setUser(null); window.dispatchEvent(new Event("userAuthChange")); };

  const row1 = currentMovies.slice(0, 6);
  const row2 = currentMovies.slice(6, 12);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>{username ? `Welcome, ${username}` : "Welcome"}</h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <SearchBar
            placeholder="Search movies/directors/actors..."
            onSearch={handleSearch}
            onReset={resetSearch}
          />
        <select
  value={searchType}
  onChange={e => setSearchType(e.target.value)}
  style={{
    backgroundColor: '#dcf8e4',   
    color: 'black',               
    border: '1px solid #aaa',     
    borderRadius: '8px',          
    padding: '6px 12px',          
    fontSize: '14px',
    cursor: 'pointer',
    outline: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
    transition: 'all 0.2s ease',
  }}
  onMouseEnter={e => e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'}
  onMouseLeave={e => e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'}
>
  <option value="all">All</option>
  <option value="movie">Movies</option>
  <option value="person">People</option>
</select>
        </div>
      </div>

      {loading && <p style={{ marginTop: "20px" }}>Loading movies...</p>}

      {/* Carousel */}
      {!loading && !searched && filteredMovies.length === 0 && (
        <div style={{ opacity: fadeOut ? 0 : 1, transition: "opacity 0.5s ease-in-out" }}>
          {[row1, row2].map((row, idx) => (
            <div key={idx} style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "20px" }}>
              {row.map((movie, index) => (
                <div key={movie.id} className="movie-card" onClick={(e) => handleMovieClick(movie, e)}
                     style={{ cursor: "pointer", width: "180px", textAlign: "center", opacity: index <= fadeInIndex ? 1 : 0, transition: "opacity 0.5s ease-in-out" }}>
                  <img src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} alt={movie.title} style={{ width: "100%", borderRadius: "10px" }} />
                  <p style={{ margin: "8px 0", fontWeight: "bold", fontSize: "16px" }}>
                    {movie.title} ({movie.release_date?.slice(0, 4) || "N/A"})
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Search Results */}
      {searched && (filteredMovies.length === 0 && filteredPeople.length === 0) && <p style={{ marginTop: "20px" }}>No results found.</p>}

      {(filteredMovies.length > 0 || filteredPeople.length > 0) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop: "30px" }}>
          {filteredMovies.map(movie => (
            <div key={movie.id} className="movie-card" onClick={(e) => handleMovieClick(movie, e)} style={{ cursor: "pointer", width: "150px", textAlign: "center" }}>
              <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} style={{ width: "100%", borderRadius: "6px" }} />
              <p style={{ margin: "5px 0", fontWeight: "bold", fontSize: "14px" }}>
                {movie.title} ({movie.release_date?.slice(0, 4) || "N/A"})
              </p>
            </div>
          ))}
          {filteredPeople.map(person => (
            <div key={person.id} className="person-card" onClick={(e) => handlePersonClick(person, e)} style={{ cursor: "pointer", width: "150px", textAlign: "center" }}>
              <img src={`https://image.tmdb.org/t/p/w200${person.profile_path}`} alt={person.name} style={{ width: "100%", borderRadius: "6px" }} />
              <p style={{ margin: "5px 0", fontWeight: "bold", fontSize: "14px" }}>{person.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
