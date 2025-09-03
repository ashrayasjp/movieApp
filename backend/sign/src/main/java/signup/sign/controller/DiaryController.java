package signup.sign.controller;

import signup.sign.model.Movie;
import signup.sign.repository.MovieRepository;
import signup.sign.dto.MovieDto;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DiaryController {

    @Autowired
    private MovieRepository movieRepository;

    @PostMapping
    public ResponseEntity<String> addMovie(@RequestBody MovieDto dto) {

        if ("watchlist".equals(dto.getStatus()) &&
                movieRepository.existsByTmdbIdAndUsernameAndStatus(dto.getTmdbId(), dto.getUsername(), "watchlist")) {
            return ResponseEntity
                    .status(400)
                    .body("Movie already in watchlist");
        }

        Movie movie = new Movie();
        movie.setTmdbId(dto.getTmdbId());
        movie.setMovieTitle(dto.getMovieTitle());
        movie.setOverview(dto.getOverview());
        movie.setPosterUrl(dto.getPosterUrl());
        movie.setStatus(dto.getStatus());
        movie.setUsername(dto.getUsername());
        if (dto.getAddedDate() != null) {
            movie.setAddedDate(LocalDate.parse(dto.getAddedDate()));
        } else {
            movie.setAddedDate(LocalDate.now());
        }

        movieRepository.save(movie);
        return ResponseEntity.ok("Movie added successfully");
    }

    @GetMapping("/diary/{username}")
    public List<Movie> getDiaryByUser(@PathVariable String username) {
        return movieRepository.findByUsernameAndStatus(username, "diary");
    }

    @GetMapping("/watchlist/{username}")
    public List<Movie> getWatchlistByUser(@PathVariable String username) {
        return movieRepository.findByUsernameAndStatus(username, "watchlist");
    }

    @DeleteMapping("/watchlist/{id}")
    public ResponseEntity<String> deleteMovieFromWatchlist(@PathVariable Long id) {
        if (!movieRepository.existsById(id)) {
            return ResponseEntity.status(404).body("Movie not found with id: " + id);
        }
        movieRepository.deleteById(id);
        return ResponseEntity.ok("Movie deleted successfully");
    }

    @DeleteMapping("/diary/{id}")
    public ResponseEntity<String> deleteMovieFromDiary(@PathVariable Long id) {
        if (!movieRepository.existsById(id)) {
            return ResponseEntity.status(404).body("Movie not found with id: " + id);
        }
        movieRepository.deleteById(id);
        return ResponseEntity.ok("Movie deleted successfully");
    }
}
