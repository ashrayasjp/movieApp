package signup.sign.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import signup.sign.model.UserReview;
import java.util.List;
import java.util.Optional;

public interface UserReviewRepository extends JpaRepository<UserReview, Long> {

    List<UserReview> findByMovieId(Long movieId);

    // To safely fetch a review by id and username
    Optional<UserReview> findByIdAndUsername(Long id, String username);
}
