import React from "react";
import axios from "axios";
import { useUser } from "../components/UserContext"; // adjust path if needed

function AddToDiary({ movie, onAdded }) {
  const { user } = useUser();

  const handleAddToDiary = async () => {
    if (!user?.username) return alert("Please log in to add movies.");

    try {
      await axios.post("http://localhost:8080/api", {
        tmdbId: movie.id,
        movieTitle: movie.title,
        overview: movie.overview,
        posterUrl: movie.poster_path
          ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
          : "https://via.placeholder.com/300x450?text=No+Image",
        status: "diary",
        addedDate: new Date().toISOString().split("T")[0],
        username: user.username,
      });
      alert("Movie added to diary");
      if (onAdded) onAdded();
    } catch (err) {
      console.error("Error adding movie:", err);
      alert(err.response?.data || "Failed to add movie.");
    }
  };

  return (
    <button onClick={handleAddToDiary} className="btn">
      Add to Diary
    </button>
  );
}

export default AddToDiary;
