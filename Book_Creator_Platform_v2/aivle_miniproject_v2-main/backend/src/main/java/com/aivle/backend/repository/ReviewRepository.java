package com.aivle.backend.repository;

import com.aivle.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByBookId(Long bookId);
    List<Review> findByCreatedBy(String createdBy);

    void deleteByBookId(Long bookId);
}
