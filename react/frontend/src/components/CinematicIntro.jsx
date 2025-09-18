import { useEffect, useState, useRef } from "react";
import axios from "axios";

function CinematicIntro({ onFinish }) {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [visible, setVisible] = useState(true);
  const audioRef = useRef(null);


  useEffect(() => {
    axios.get("http://localhost:8080/api/movies/top-rated")
      .then(res => setMovies(res.data))
      .catch(err => console.error(err));
  }, []);

  
  useEffect(() => {
    if (movies.length === 0) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % movies.length);
        setFade(true);
      }, 500);
    }, 1500);

    const timeout = setTimeout(() => handleFinish(), 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [movies]);

  
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.2;
      audio.play().catch(err => console.log("Autoplay blocked:", err));
    }
  }, [movies]);

  const handleFinish = () => {
    setFade(false);
    setTimeout(() => {
      setVisible(false);
      onFinish();
    }, 500);
  };

  if (!visible || movies.length === 0) return null;

  const currentBackdrop = `https://image.tmdb.org/t/p/original${movies[currentIndex].backdrop_path}`;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      <img
        src={currentBackdrop}
        alt={movies[currentIndex].title}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "opacity 0.5s ease-in-out",
          opacity: fade ? 1 : 0
        }}
      />
      <audio ref={audioRef} autoPlay loop>
        <source src="/audios/a1.mp3" type="audio/mpeg" />
      </audio>
      <button
        onClick={handleFinish}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          backgroundColor: "rgba(0,0,0,0.5)",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
          zIndex: 10000
        }}
      >
        Skip
      </button>
    </div>
  );
}

export default CinematicIntro;
