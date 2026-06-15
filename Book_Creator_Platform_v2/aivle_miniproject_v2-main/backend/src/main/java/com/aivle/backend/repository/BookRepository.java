package com.aivle.backend.repository;

import com.aivle.backend.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByCreatedBy(String createdBy);
}