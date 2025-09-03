package signup.sign.repository;

import signup.sign.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, Long> {
    List<Movie> findByStatus(String status);

    List<Movie> findByUsernameAndStatus(String username, String status);

    boolean existsByTmdbIdAndUsernameAndStatus(String tmdbId, String username, String status);

    void deleteByStatus(String status);

}
