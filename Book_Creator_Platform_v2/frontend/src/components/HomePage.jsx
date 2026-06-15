import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { request } from "./api.js";
import { getReviewCountByBookId } from "./utils.js";
import HomeBookCard from "./HomeBookCard.jsx";
import HomeReviewCard from "./HomeReviewCard.jsx";

function HomePage() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadHomeData() {
    try {
      setLoading(true);

      const [bookData, reviewData] = await Promise.all([
        request("/books"),
        request("/reviews"),
      ]);

      setBooks(bookData || []);
      setReviews(reviewData || []);
    } catch (error) {
      alert("홈 데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHomeData();
  }, []);

  const topBooks = useMemo(() => {
    return [...books].sort((a, b) => b.likes - a.likes).slice(0, 10);
  }, [books]);

  const topReviews = useMemo(() => {
    return [...reviews].sort((a, b) => b.likes - a.likes).slice(0, 10);
  }, [reviews]);

  function getBookTitle(review) {
    if (review.bookTitle) return review.bookTitle;

    const book = books.find((item) => Number(item.id) === Number(review.bookId));
    return book ? book.title : "알 수 없는 도서";
  }

  async function handleBookLike(event, book) {
    event.stopPropagation();

    try {
      const updatedBook = await request(`/books/${book.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          likes: Number(book.likes || 0) + 1,
          updatedAt: new Date().toISOString(),
        }),
      });

      setBooks((prev) =>
        prev.map((item) => (item.id === updatedBook.id ? updatedBook : item))
      );
    } catch (error) {
      alert("도서 좋아요 처리에 실패했습니다.");
    }
  }

  async function handleReviewLike(event, review) {
    event.stopPropagation();

    try {
      const updatedReview = await request(`/reviews/${review.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          likes: Number(review.likes || 0) + 1,
        }),
      });

      setReviews((prev) =>
        prev.map((item) =>
          item.id === updatedReview.id ? updatedReview : item
        )
      );
    } catch (error) {
      alert("리뷰 좋아요 처리에 실패했습니다.");
    }
  }

  async function handleDeleteReview(event, reviewId) {
    event.stopPropagation();

    if (!confirm("리뷰를 삭제하시겠습니까?")) return;

    try {
      await request(`/reviews/${reviewId}`, {
        method: "DELETE",
      });

      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
    } catch (error) {
      alert("리뷰 삭제에 실패했습니다.");
    }
  }

  async function handleEditReview(event, review) {
    event.stopPropagation();

    const nextContent = prompt("수정할 리뷰 내용을 입력하세요.", review.content);
    if (nextContent === null) return;

    const trimmed = nextContent.trim();

    if (!trimmed) {
      alert("리뷰 내용은 비워둘 수 없습니다.");
      return;
    }

    try {
      const updatedReview = await request(`/reviews/${review.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          content: trimmed,
          updatedAt: new Date().toISOString(),
        }),
      });

      setReviews((prev) =>
        prev.map((item) =>
          item.id === updatedReview.id ? updatedReview : item
        )
      );
    } catch (error) {
      alert("리뷰 수정에 실패했습니다.");
    }
  }

  if (loading) {
    return <section className="page">불러오는 중...</section>;
  }

  return (
    <section className="page">
      <section className="section">
        <div className="section-title-row">
          <h2>인기 도서 TOP 10</h2>
          <Link to="/books" className="text-link">
            전체 보기
          </Link>
        </div>

        <div className="home-book-row">
          {topBooks.map((book) => (
            <HomeBookCard
              key={book.id}
              book={book}
              reviewCount={getReviewCountByBookId(reviews, book.id)}
              onClick={() => navigate(`/books/${book.id}`)}
              onLike={(event) => handleBookLike(event, book)}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <h2>인기 리뷰 TOP 10</h2>

        <div className="review-list">
          {topReviews.length === 0 ? (
            <p className="empty-text">아직 등록된 리뷰가 없습니다.</p>
          ) : (
            topReviews.map((review) => (
              <HomeReviewCard
                key={review.id}
                review={review}
                bookTitle={getBookTitle(review)}
                onClick={() => navigate(`/books/${review.bookId}`)}
                onLike={(event) => handleReviewLike(event, review)}
                onEdit={(event) => handleEditReview(event, review)}
                onDelete={(event) => handleDeleteReview(event, review.id)}
              />
            ))
          )}
        </div>
      </section>
    </section>
  );
}

export default HomePage;
