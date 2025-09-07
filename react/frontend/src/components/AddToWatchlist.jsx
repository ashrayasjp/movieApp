import React from "react";
import axios from "axios";
import { useUser } from "./UserContext";

function AddToWatchlist({ movie, onAdded }) {
  const { user } = useUser();

  const handleAddToWatchlist = async () => {
    if (!user) return alert("Please log in to add movies.");

    try {
      await axios.post(
        "http://localhost:8080/api",
        {
          tmdbId: movie.id,
          movieTitle: movie.title,
          overview: movie.overview,
          posterUrl: movie.poster_path
            ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
            : "https://via.placeholder.com/300x450?text=No+Image",
          status: "watchlist",
          addedDate: new Date().toISOString().split("T")[0],
          username: user.username,
        },
        { withCredentials: true }
      );
      alert("Movie added to watchlist");
      if (onAdded) onAdded();
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
