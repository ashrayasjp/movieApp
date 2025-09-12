import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../PersonDetail.css";

function PersonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [person, setPerson] = useState(null);
  const [actedMovies, setActedMovies] = useState([]);
  const [directedMovies, setDirectedMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPersonData = async () => {
      try {
        setLoading(true); 

        const res = await axios.get(`http://localhost:8080/api/movies/person/${id}`);
        const data = res.data;
        setPerson(data);

        const credits = data.movie_credits || {};
        const uniqueById = (arr) => {
          const seen = new Set();
          return arr.filter(item => item.poster_path && !seen.has(item.id) && seen.add(item.id));
        };

        const castMovies = uniqueById(credits.cast || []);
        const crewMovies = uniqueById((credits.crew || []).filter(c => c.job === "Director"));

        castMovies.sort((a, b) => (b.release_date || "").localeCompare(a.release_date || ""));
        crewMovies.sort((a, b) => (b.release_date || "").localeCompare(a.release_date || ""));

        setActedMovies(castMovies);
        setDirectedMovies(crewMovies);
      } catch (err) {
        console.error("Failed to fetch person data:", err);
      } finally {
        setLoading(false); 
      }
    };

    fetchPersonData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (loading) return <p>Loading person data...</p>;
  if (!person) return <p>Person not found.</p>;

  const role = person.known_for_department === "Directing" ? "Director" : "Actor";

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", padding: "20px" }}>
      {/* Person Info */}
      <div style={{ flex: 1.2, minWidth: "300px" }}>
        <h2>{person.name}</h2>
        <img
          src={person.profile_path ? `https://image.tmdb.org/t/p/w300${person.profile_path}` : "https://via.placeholder.com/300x450?text=No+Image"}
          alt={person.name}
          style={{ width: "250px", height: "350px", borderRadius: "8px", marginBottom: "10px" }}
        />
        <p style={{ fontWeight: "bold", marginBottom: "15px" }}>{role}</p>
        {person.biography && <p style={{ textAlign: "justify", maxWidth: "600px" }}>{person.biography}</p>}
        <p>Birthday: {person.birthday || "N/A"}</p>
      </div>

      {/* Filmography */}
      <div style={{ flex: 1, minWidth: "300px" }}>
        {actedMovies.length > 0 && (
          <div>
            <h3>Acted In</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
              {actedMovies.map((movie, index) => (
                <div
                  key={movie.id}
                  className="fade-in"
                  style={{ width: "120px", cursor: "pointer", textAlign: "center", animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                    alt={movie.title || movie.name}
                    style={{ width: "100%", borderRadius: "6px" }}
                  />
                  <p style={{ fontSize: "12px", fontWeight: "bold", margin: "5px 0" }}>
                    {movie.title || movie.name} ({movie.release_date?.slice(0, 4) || "N/A"})
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {directedMovies.length > 0 && (
          <div style={{ marginTop: "30px" }}>
            <h3>Directed</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
              {directedMovies.map((movie, index) => (
                <div
                  key={movie.id}
                  className="fade-in"
                  style={{ width: "120px", cursor: "pointer", textAlign: "center", animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                    alt={movie.title || movie.name}
                    style={{ width: "100%", borderRadius: "6px" }}
                  />
                  <p style={{ fontSize: "12px", fontWeight: "bold", margin: "5px 0" }}>
                    {movie.title || movie.name} ({movie.release_date?.slice(0, 4) || "N/A"})
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {actedMovies.length === 0 && directedMovies.length === 0 && <p>No movies found.</p>}
      </div>
    </div>
  );
}

export default PersonDetail;
