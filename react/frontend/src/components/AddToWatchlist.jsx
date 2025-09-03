import React from "react";
import axios from "axios";

function AddToWatchlist({ movie, currentWatchlist, onAdded }) {
  const handleAddToWatchlist = async () => {
    const username = localStorage.getItem("username")?.trim();
    if (!username) return alert("Please log in to add movies.");
    if (currentWatchlist?.some((m) => m.tmdbId === movie.id)) {
      return alert("Movie already in watchlist");
    }

    
    if (currentWatchlist?.some((m) => m.tmdbId === movie.id)) {
      return alert("Movie already in watchlist");
    }

    try {
      await axios.post("http://localhost:8080/api", {
        tmdbId: movie.id,
        movieTitle: movie.title,
        overview: movie.overview,
        posterUrl: `https://image.tmdb.org/t/p/w300${movie.poster_path}`,
        status: "watchlist",
        addedDate: new Date().toISOString().split("T")[0],
        username,
      });
      alert("Movie added to watchlist");
      if (onAdded) onAdded(); 
    } catch (err) {
      console.error("Error adding movie:", err);
      alert("Movie already in watchlist.");
    }
  };

  return (
    <button onClick={handleAddToWatchlist} className="btn">
      Add to Watchlist
    </button>
  );
}

export default AddToWatchlist;
