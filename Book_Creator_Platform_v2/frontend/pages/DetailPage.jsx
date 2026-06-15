import BookReportDetailList from '../components/BookReportDetailList';
import BookDetailEdit from '../components/BookDetailEdit';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { formatDate } from "../components/utils.js";

function DetailPage({
  books,
  reviews,
  onReviewAdd,
  onReviewLike,
  onReviewEdit,
  onReviewDelete,
  onBookDelete,
  onBookEdit,
  onBookLikes
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const book = books.find(
    b => String(b.id) === String(id)
  );
  const currentUser = localStorage.getItem('username');
  const isOwner = !!currentUser && book?.createdBy === currentUser;

  const [isEditing, setIsEditing] = useState(false);

  const [sortType, setSortType] = useState('latest');

  const sortedReviews = useMemo(() => {
    const filtered = reviews.filter(
      p => String(p.bookId) === String(book.id)
    );

    return [...filtered].sort((a, b) => {
      if (sortType === 'likes') {
        if (b.likes !== a.likes) {
          return b.likes - a.likes;
        }

        return (
          new Date(b.createdAt) -
          new Date(a.createdAt)
        );
      }

      // 최신순
      return (
        new Date(b.createdAt) -
        new Date(a.createdAt)
      );
    });
  }, [reviews, book?.id, sortType]);

  const handleBookDelete = () => {
    const isConfirmed = window.confirm(
      "정말 삭제하시겠습니까?"
    );

    if (!isConfirmed) return;

    onBookDelete(id);
    navigate('/');
  };

  const handleBookEdit = (edited) => {
    onBookEdit(id, edited);
    setIsEditing(false);
  };

  const handleBookEditCancel = () => {
    setIsEditing(false);
  };

  if (!book) {
    return <div>도서를 찾을 수 없습니다.</div>;
  }

  if (isEditing) {
    return (
      <BookDetailEdit
        book={book}
        onEdit={handleBookEdit}
        onCancel={handleBookEditCancel}
      />
    );
  }

  return (
    <>
      <div className="detail-content-area">
        <div className="detail-main">
          <div className="detail-poster">
            {book.coverImageUrl !== '' ? (
              <img
                src={book.coverImageUrl}
                alt="img"
              />
            ) : null}
          </div>

          <div className="detail-info">
            <h2 className="detail-title">
              {book.title}
            </h2>

            <p className="detail-content-quote">
              {book.content}
            </p>

            {book.tags?.length > 0 && (
              <p className="detail-tag-line">
                {book.tags.map(
                  tag => `#${tag} `
                )}
              </p>
            )}

            <div className="detail-meta">
              <span className="detail-meta-item">
                생성 {formatDate(book.createdAt)}
              </span>

              <span className="detail-meta-item">
                수정 {formatDate(book.updatedAt)}
              </span>
            </div>
          </div>

          <div className="detail-action">
              <button onClick={() => onBookLikes(id)}>
                  ❤️ {book.likes}
              </button>

              {isOwner && (
                  <>
                      <button onClick={() => setIsEditing(true)}>
                          수정하기
                      </button>
                      <button onClick={handleBookDelete}>
                          삭제하기
                      </button>
                  </>
              )}
          </div>
        </div>
      </div>

        <div className="review-sort-menu">
        <button
            className={sortType === 'latest' ? 'active' : ''}
            onClick={() => setSortType('latest')}
        >
            최신순
        </button>

        <button
            className={sortType === 'likes' ? 'active' : ''}
            onClick={() => setSortType('likes')}
        >
            좋아요순
        </button>
        </div>

      <BookReportDetailList
        review={sortedReviews}
        book={book}
        onCreate={onReviewAdd}
        onReviewLike={onReviewLike}
        onReviewEdit={onReviewEdit}
        onReviewDelete={onReviewDelete}
      />
    </>
  );
}

export default DetailPage;