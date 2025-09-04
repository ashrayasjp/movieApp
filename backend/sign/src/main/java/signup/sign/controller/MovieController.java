package signup.sign.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    @Value("${tmdb.api.key}")
    private String apiKey;

    private final String TMDB_BASE = "https://api.themoviedb.org/3";
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    // Get top-rated movies
    @GetMapping("/top-rated")
    public List<Map<String, Object>> getTopRatedMovies(@RequestParam(defaultValue = "1") int page) {
        try {
            String url = TMDB_BASE + "/movie/top_rated?api_key=" + apiKey + "&page=" + page;
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            Map<String, Object> result = mapper.readValue(response.getBody(), new TypeReference<>() {
            });
            return mapper.convertValue(result.get("results"), new TypeReference<List<Map<String, Object>>>() {
            });
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    // Search movies
    @GetMapping("/search")
    public List<Map<String, Object>> searchMovies(@RequestParam String query) {
        try {
            String url = TMDB_BASE + "/search/movie?api_key=" + apiKey + "&query=" + query;
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            Map<String, Object> result = mapper.readValue(response.getBody(), new TypeReference<>() {
            });
            return mapper.convertValue(result.get("results"), new TypeReference<List<Map<String, Object>>>() {
            });
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    // Get movie details by TMDB ID
    @GetMapping("/{id}")
    public Map<String, Object> getMovieById(@PathVariable String id) {
        try {
            String url = TMDB_BASE + "/movie/" + id + "?api_key=" + apiKey;
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return mapper.readValue(response.getBody(), new TypeReference<>() {
            });
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of();
        }
    }

    @GetMapping("/{id}/credits")
    public Map<String, Object> getMovieCredits(@PathVariable String id) {
        try {
            String url = TMDB_BASE + "/movie/" + id + "/credits?api_key=" + apiKey;
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return mapper.readValue(response.getBody(), new TypeReference<>() {
            });
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of();
        }
    }
}
