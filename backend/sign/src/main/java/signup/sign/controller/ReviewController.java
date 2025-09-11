package signup.sign.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import signup.sign.model.UserReview;
import signup.sign.repository.UserReviewRepository;
import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ReviewController {

    @Autowired
    private UserReviewRepository reviewRepository;

    @GetMapping("/{movieId}")
    public List<UserReview> getReviews(@PathVariable Long movieId) {
        return reviewRepository.findByMovieId(movieId);
    }

    @PostMapping("/{movieId}")
    public ResponseEntity<?> addReview(@PathVariable Long movieId, @RequestBody UserReview review) {
        review.setMovieId(movieId);
        reviewRepository.save(review);
        return ResponseEntity.ok(review);
    }

    @DeleteMapping("/{movieId}/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @PathVariable Long movieId,
            @PathVariable Long reviewId,
            @RequestParam String username) {

        Optional<UserReview> reviewOpt = reviewRepository.findByIdAndUsername(reviewId, username);
        if (reviewOpt.isEmpty()) {
            return ResponseEntity.status(403).body("You can only delete your own review.");
        }

        reviewRepository.delete(reviewOpt.get());
        return ResponseEntity.ok("Review deleted successfully.");
    }

    // DELETE all reviews for a specific movie
    @DeleteMapping("/movie/{movieId}/clear")
    public ResponseEntity<?> clearReviews(@PathVariable Long movieId) {
        List<UserReview> reviews = reviewRepository.findByMovieId(movieId);
        if (reviews.isEmpty()) {
            return ResponseEntity.status(404).body("No reviews found for this movie.");
        }
        reviewRepository.deleteAll(reviews);
        return ResponseEntity.ok("All reviews cleared for movie ID " + movieId);
    }

    @PutMapping("/{movieId}/{reviewId}")
    public ResponseEntity<?> updateReview(
            @PathVariable Long movieId,
            @PathVariable Long reviewId,
            @RequestBody UserReview updatedReview) {
        // Find the review by ID and username
        Optional<UserReview> reviewOpt = reviewRepository.findByIdAndUsername(reviewId, updatedReview.getUsername());
        if (reviewOpt.isEmpty()) {
            return ResponseEntity.status(403).body("You can only edit your own review.");
        }

        UserReview review = reviewOpt.get();
        review.setText(updatedReview.getText());

        return ResponseEntity.ok(review);
    }
}
