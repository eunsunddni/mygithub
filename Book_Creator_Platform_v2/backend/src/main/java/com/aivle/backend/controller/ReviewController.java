package com.aivle.backend.controller;

import com.aivle.backend.entity.Review;
import com.aivle.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public List<Review> getReviews(
            @RequestParam(required = false) Long bookId,
            @RequestParam(required = false) String createdBy) {
        if (createdBy != null) {
            return reviewService.getMyReviews(createdBy);
        }
        return reviewService.getReviews(bookId);
    }

    @PostMapping
    public Review createReview(@RequestBody Review review, Principal principal) {
        String username = (principal != null) ? principal.getName() : null;
        return reviewService.createReview(review, username);
    }

    @PatchMapping("/{id}")
    public Review updateReview(@PathVariable Long id, @RequestBody Review request, Principal principal) {
        return reviewService.updateReview(id, request, principal.getName());
    }

    @PatchMapping("/{id}/likes")

    public Review likeReview(@PathVariable Long id, @RequestBody Review request) {
        return reviewService.likeReview(id, request.getLikes());
    }

    @DeleteMapping("/{id}")
    public void deleteReview(@PathVariable Long id, Principal principal) {
        reviewService.deleteReview(id, principal.getName());
    }
}