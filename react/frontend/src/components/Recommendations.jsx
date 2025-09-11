import React, { useMemo } from "react";

const GENRE_MAP = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

function Recommendations({ allMovies = [], diaryMovies = [], onMovieClick }) {
  // Collect diary movie IDs
  const diaryIds = useMemo(() => diaryMovies.map(m => m.tmdbId || m.id), [diaryMovies]);

  // Exclude diary movies
  const availableMovies = useMemo(
    () => allMovies.filter(m => !diaryIds.includes(m.id)),
    [allMovies, diaryIds]
  );

  if (!availableMovies.length) {
    return <p style={{ marginTop: "20px", fontStyle: "italic" }}>No recommendations available</p>;
  }

  
  const recommended = useMemo(() => {
    const genreBuckets = {};
    availableMovies.forEach(movie => {
      if (!movie.genre_ids) return;
      movie.genre_ids.forEach(id => {
        if (!genreBuckets[id]) genreBuckets[id] = [];
        genreBuckets[id].push(movie);
      });
    });

    const selected = [];
    const genreIds = Object.keys(genreBuckets);
    let index = 0;
    while (selected.length < 6 && index < genreIds.length) {
      const bucket = genreBuckets[genreIds[index]];
      if (bucket && bucket.length > 0) {
        const movie = bucket.shift();
        if (!selected.find(m => m.id === movie.id)) selected.push(movie);
      }
      index++;
      if (index >= genreIds.length) index = 0; 
    }

    return selected;
  }, [availableMovies]);

  return (
    <div style={{ marginTop: "30px" }}>
      <h3>Recommended for you</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
        {recommended.map(movie => (
          <div
            key={movie.id}
            style={{ width: "150px", textAlign: "center", cursor: "pointer" }}
            onClick={() => onMovieClick?.(movie)}
          >
            <img
              src={movie.poster_path
                ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                : "https://via.placeholder.com/150x225?text=No+Image"}
              alt={movie.title}
              style={{ width: "100%", borderRadius: "6px" }}
            />
            <p style={{ marginTop: "5px", fontWeight: "bold", fontSize: "14px" }}>
              {movie.title} ({movie.release_date?.slice(0, 4) || "N/A"})
            </p>
            <p style={{ fontSize: "12px", color: "#555" }}>
              {movie.genre_ids?.map(id => GENRE_MAP[id]).filter(Boolean).join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Recommendations;
