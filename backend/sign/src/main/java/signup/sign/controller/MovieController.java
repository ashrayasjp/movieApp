package signup.sign.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    @Value("${tmdb.api.key}")
    private String apiKey;

    private final String TMDB_BASE = "https://api.themoviedb.org/3";
    private final RestTemplate restTemplate = new RestTemplate();

    // Get popular movies
    @GetMapping("/popular")
    public String getPopularMovies(@RequestParam(defaultValue = "1") int page) {
        String url = TMDB_BASE + "/movie/popular?api_key=" + apiKey + "&page=" + page;
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        return response.getBody();
    }

    // Search movies
    @GetMapping("/search")
    public String searchMovies(@RequestParam String query) {
        String url = TMDB_BASE + "/search/movie?api_key=" + apiKey + "&query=" + query;
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        return response.getBody();
    }

    // Get movie details by TMDB ID
    @GetMapping("/{id}")
    public String getMovieById(@PathVariable String id) {
        String url = TMDB_BASE + "/movie/" + id + "?api_key=" + apiKey;
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        return response.getBody();
    }

    // Get movie credits (cast/crew)
    @GetMapping("/{id}/credits")
    public String getMovieCredits(@PathVariable String id) {
        String url = TMDB_BASE + "/movie/" + id + "/credits?api_key=" + apiKey;
        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
        return response.getBody();
    }

}
