function HomeReviewCard({
  review,
  bookTitle,
  onClick,
  onLike,
  onEdit,
  onDelete,
}) {
  return (
    <article className="review-card" onClick={onClick}>
      <div className="review-main">
        <h3>{bookTitle}</h3>
        <p className="review-nickname">{review.nickname}</p>
        <p className="review-content">{review.content}</p>
      </div>

      <div className="review-actions">
        <button className="mini-like-button" onClick={onLike}>
          👍 {review.likes}
        </button>
        <button className="sub-button" onClick={onEdit}>
          수정
        </button>
        <button className="danger-button" onClick={onDelete}>
          삭제
        </button>
      </div>
    </article>
  );
}

export default HomeReviewCard;
