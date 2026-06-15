import { formatDate, getLatestDate, hslFromName } from "./utils.js";
import { useState } from 'react';

function ReviewItem({ review, onLike, onEdit, onDelete, currentUser }) {

  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(review.nickname);
  const [content, setContent] = useState(review.content);

  const isOwner = !!currentUser && review.createdBy === currentUser;

  const handleUpdate = async () => {
    if (!nickname.trim()) {
      alert("닉네임을 입력하세요.");
      return;
    }
    if (!content.trim()) {
      alert("리뷰 내용을 입력하세요.");
      return;
    }
    const updated = {
      nickname: nickname,
      content: content,
      updatedAt: new Date()
    };
    try {
      await onEdit(review.id, updated);
      setIsEditing(false);
    } catch {
      alert('리뷰 업데이트 실패');
      setIsEditing(true);
    }
  };

  if (isEditing) {
    return (
      <article className="detail-review-card">
        <div className="review-fix-form">
          <p>닉네임</p>
          <input
            className="review-fix-input"
            type="text"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
          />
          <p>리뷰 내용</p>
          <input
            className="review-fix-textarea"
            type="text"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <div className="review-actions">
            <button className="sub-button" onClick={handleUpdate}>
              수정하기
            </button>
            <button className="sub-button" onClick={() => setIsEditing(false)}>
              취소
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="detail-review-card">
      <div className="review-avatar" style={{ background: hslFromName(nickname) }}>
        {(nickname?.trim()?.[0] || "?").toUpperCase()}
      </div>
      <div className="review-body">
        <div className="review-head">
          <p className="review-nickname">{nickname}</p>
          <button className="like-btn" onClick={() => onLike(review.id)}>
            ❤️ {review.likes}
          </button>
        </div>
        <p className="review-content">{content}</p>
        <p className="review-date">
          {formatDate(getLatestDate(review))}
        </p>
        {isOwner && (
          <div className="review-actions">
            <button className="sub-button" onClick={() => setIsEditing(true)}>
              수정
            </button>
            <button className="sub-button" onClick={() => onDelete(review.id)}>
              삭제
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default ReviewItem;