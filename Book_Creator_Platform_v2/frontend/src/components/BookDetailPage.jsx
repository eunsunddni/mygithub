import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { request } from "./api.js";
import {
  FALLBACK_COVER,
  formatDate,
  getLatestDate,
  normalizeTags,
} from "./utils.js";
import ReviewForm from "./ReviewForm.jsx";
import ReviewItem from "./ReviewItem.jsx";

function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);

  function getSafeUpdatedAt(item) {
    if (!item?.createdAt) return item?.updatedAt || "";

    const createdTime = new Date(item.createdAt).getTime();
    const updatedTime = new Date(item.updatedAt).getTime();

    if (!item.updatedAt || Number.isNaN(updatedTime)) {
      return item.createdAt;
    }

    if (updatedTime < createdTime) {
      return item.createdAt;
    }

    return item.updatedAt;
  }

  async function loadDetail() {
    try {
      const [bookData, reviewData] = await Promise.all([
        request(`/books/${id}`),
        request(`/reviews?bookId=${id}`),
      ]);

      setBook(bookData);
      setReviews(reviewData || []);
    } catch (error) {
      alert("도서 상세 정보를 불러오지 못했습니다.");
      navigate("/books");
    }
  }

  useEffect(() => {
    loadDetail();
  }, [id]);

  const sortedReviews = useMemo(() => {
    return [...reviews].sort(
      (a, b) => new Date(getLatestDate(b)) - new Date(getLatestDate(a))
    );
  }, [reviews]);

  async function handleBookLike() {
    try {
      const updatedBook = await request(`/books/${book.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          likes: Number(book.likes || 0) + 1,
          updatedAt: new Date().toISOString(),
        }),
      });

      setBook(updatedBook);
    } catch (error) {
      alert("도서 좋아요 처리에 실패했습니다.");
    }
  }

  async function handleDeleteBook() {
    const ok = confirm("이 도서를 삭제하시겠습니까?");
    if (!ok) return;

    try {
      const relatedReviews = await request(`/reviews?bookId=${book.id}`);

      await Promise.all(
        relatedReviews.map((review) =>
          request(`/reviews/${review.id}`, {
            method: "DELETE",
          })
        )
      );

      await request(`/books/${book.id}`, {
        method: "DELETE",
      });

      alert("도서가 삭제되었습니다.");
      navigate("/books");
    } catch (error) {
      alert("도서 삭제에 실패했습니다.");
    }
  }

  async function handleReviewLike(review) {
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

  async function handleDeleteReview(reviewId) {
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

  async function handleEditReview(review) {
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

  if (!book) {
    return <section className="page">불러오는 중...</section>;
  }

  return (
    <section className="page">
      <section className="detail-layout">
        <div className="detail-cover-area">
          <img
            src={book.coverImageUrl || FALLBACK_COVER}
            alt={book.title}
            className="detail-cover"
          />
        </div>

        <div className="detail-info">
          <div className="detail-top-row">
            <h2>{book.title}</h2>

            <div className="detail-action-row">
              <button
                className="sub-button"
                onClick={() => navigate(`/edit/${book.id}`)}
              >
                수정
              </button>

              <button className="danger-button" onClick={handleDeleteBook}>
                삭제
              </button>
            </div>
          </div>

          <p className="book-author">{book.author}</p>

          <button className="like-button" onClick={handleBookLike}>
            ❤️ {book.likes}
          </button>

          <div className="tag-row">
            {normalizeTags(book.tag).map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>

          <p className="detail-content">{book.content}</p>

          <div className="date-box">
            <p>생성일: {formatDate(book.createdAt)}</p>
            <p>수정일: {formatDate(getSafeUpdatedAt(book))}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>리뷰 작성</h2>
        <ReviewForm
          book={book}
          onCreate={(savedReview) => setReviews((prev) => [savedReview, ...prev])}
        />
      </section>

      <section className="section">
        <h2>리뷰</h2>

        <div className="review-list">
          {sortedReviews.length === 0 ? (
            <p className="empty-text">아직 이 책에 대한 리뷰가 없습니다.</p>
          ) : (
            sortedReviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                bookTitle={book.title}
                onLike={() => handleReviewLike(review)}
                onEdit={() => handleEditReview(review)}
                onDelete={() => handleDeleteReview(review.id)}
              />
            ))
          )}
        </div>
      </section>
    </section>
  );
}

export default BookDetailPage;
