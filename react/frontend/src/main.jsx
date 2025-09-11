import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";
import Signup from "./pages/Signup.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import MovieDetail from "./pages/MovieDetail.jsx";
import Diary from "./pages/Diary.jsx";
import Watchlist from "./pages/Watchlist.jsx";
import Header from "./components/Header.jsx";
import { UserProvider } from './components/UserContext';
import { LikesProvider } from "./components/LikesContext";
import { useUser } from './components/UserContext';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <LikesProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/watchlist" element={<Watchlist />} />
        </Routes>
      </BrowserRouter>
      </LikesProvider>
    </UserProvider>
  </StrictMode>
);
