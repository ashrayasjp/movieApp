import React, { createContext, useContext, useState, useEffect } from "react";

const LikesContext = createContext();

export const LikesProvider = ({ children }) => {
  const [likedMovies, setLikedMovies] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("likedMovies") || "[]");
    setLikedMovies(stored);
  }, []);

  const toggleLike = (movie) => {
    setLikedMovies((prev) => {
      const exists = prev.find((m) => m.id === movie.id);
      let updated;
      if (exists) {
        updated = prev.filter((m) => m.id !== movie.id);
      } else {
        updated = [...prev, movie];
      }
      localStorage.setItem("likedMovies", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <LikesContext.Provider value={{ likedMovies, toggleLike }}>
      {children}
    </LikesContext.Provider>
  );
};

export const useLikes = () => useContext(LikesContext);
