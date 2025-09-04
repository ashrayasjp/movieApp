import React from "react";
import axios from "axios";

function AddToWatchlist({ movie, onAdded }) {
  const handleAddToWatchlist = async () => {
    const username = localStorage.getItem("username")?.trim();
    if (!username) return alert("Please log in to add movies.");

    try {
      // Post to backend API for adding to watchlist
      await axios.post("http://localhost:8080/api", {
        tmdbId: movie.id,
        movieTitle: movie.title,
        overview: movie.overview,
        posterUrl: movie.poster_path
          ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
          : "https://via.placeholder.com/300x450?text=No+Image",
        status: "watchlist",
        addedDate: new Date().toISOString().split("T")[0],
        username,
      });
      alert("Movie added to watchlist");
      if (onAdded) onAdded(); // refresh parent component
    } catch (err) {
      console.error("Error adding movie:", err);
      alert(err.response?.data || "Movie could not be added.");
    }
  };

  return (
    <button onClick={handleAddToWatchlist} className="btn">
      Add to Watchlist
    </button>
  );
}

export default AddToWatchlist;
