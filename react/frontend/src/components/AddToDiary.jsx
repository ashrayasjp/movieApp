import React from "react";
import axios from "axios";

function AddToDiary({ movie, onAdded }) {
  const handleAddToDiary = async () => {
    const username = localStorage.getItem("username")?.trim();
    if (!username) return alert("Please log in to add movies.");

    try {
      await axios.post("http://localhost:8080/api", {
        tmdbId: movie.id,
        movieTitle: movie.title,
        overview: movie.overview,
        posterUrl: `https://image.tmdb.org/t/p/w300${movie.poster_path}`,
        status: "diary",
        addedDate: new Date().toISOString().split("T")[0],
        username,
      });
      alert("Movie added to diary");
      if (onAdded) onAdded(); 
    } catch (err) {
      console.error("Error adding movie:", err);
      alert("Failed to add movie.");
    }
  };

  return (
    <button onClick={handleAddToDiary} className="btn">
      Add to Diary
    </button>
  );
}

export default AddToDiary;
