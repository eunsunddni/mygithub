import { useState } from "react";
import { request } from "./api.js";
import ReviewItem from './BookReportDetailItem'

function BookReportDetailList({ book, review,  onCreate, onReviewLike, onReviewEdit, onReviewDelete }) {
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const currentUser = localStorage.getItem('username');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!nickname.trim()) {
      alert("닉네임을 입력하세요.");
      return;
    }

    if (!content.trim()) {
      alert("리뷰 내용을 입력하세요.");
      return;
    }

    const now = new Date().toISOString();

    const newReview = {
      bookId: book.id,
      nickname: nickname.trim(),
      content: content.trim(),
      likes: 0,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const savedReview = await request("/reviews", {
        method: "POST",
        body: JSON.stringify(newReview),
      });

      onCreate(savedReview);
      setNickname("");
      setContent("");
    } catch (error) {
      alert("리뷰 등록에 실패했습니다.");
    }
  }

  return (
    <article>
    <form className="review-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={nickname}
        onChange={(event) => setNickname(event.target.value)}
        placeholder="닉네임"
      />

      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="리뷰 내용을 입력하세요"
        rows={4}
      />

      <button type="submit" className="primary-button">
        리뷰 등록
      </button>
    </form>
    <ul className="detail-review-list" >
      {review.map (p =>
      <ReviewItem key={p.id}
        review={p}
        onLike={onReviewLike}
        onEdit={onReviewEdit}
        onDelete={onReviewDelete}
        currentUser={currentUser}
      /> 
      )}
    </ul>
    </article>
  );
}

export default BookReportDetailList;
