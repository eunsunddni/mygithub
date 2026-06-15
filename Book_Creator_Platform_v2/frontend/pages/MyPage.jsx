import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { request } from '../components/api.js';

function MyPage() {
  const [myBooks, setMyBooks] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const currentUser = localStorage.getItem('username');

  useEffect(() => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    async function loadMyData() {
      try {
        const [books, reviews] = await Promise.all([
          request(`/books?createdBy=${currentUser}`),
          request(`/reviews?createdBy=${currentUser}`),
        ]);
        setMyBooks(books || []);
        setMyReviews(reviews || []);
      } catch (err) {
        console.error('데이터 불러오기 실패:', err);
      }
      setLoading(false);
    }

    loadMyData();
  }, []);

  if (loading) return <div className="mypage-loading">불러오는 중...</div>;

  return (
    <div className="mypage-container">

      <div className="mypage-profile">
        <div className="mypage-avatar">{currentUser?.charAt(0).toUpperCase()}</div>
        <div>
          <p className="mypage-welcome">안녕하세요</p>
          <p className="mypage-username">{currentUser}님</p>
        </div>
      </div>

      <div className="mypage-stats">
        <div className="mypage-stat-card">
          <span className="mypage-stat-num">{myBooks.length}</span>
          <span className="mypage-stat-label">등록한 도서</span>
        </div>
        <div className="mypage-stat-card">
          <span className="mypage-stat-num">{myReviews.length}</span>
          <span className="mypage-stat-label">작성한 리뷰</span>
        </div>
      </div>

      <section className="mypage-section">
        <h3 className="mypage-section-title">내가 등록한 도서</h3>
        {myBooks.length === 0 ? (
          <p className="mypage-empty">등록한 도서가 없습니다.</p>
        ) : (
          <ul className="mypage-list">
            {myBooks.map(book => (
              <li key={book.id} className="mypage-list-item">
                <Link to={`/detail/${book.id}`} className="mypage-item-title">
                  {book.title}
                </Link>
                <div className="mypage-item-meta">
                  <span>{book.author}</span>
                  <span>❤️ {book.likes}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mypage-section">
        <h3 className="mypage-section-title">내가 쓴 리뷰</h3>
        {myReviews.length === 0 ? (
          <p className="mypage-empty">작성한 리뷰가 없습니다.</p>
        ) : (
          <ul className="mypage-list">
            {myReviews.map(review => (
              <li key={review.id} className="mypage-list-item">
                <Link to={`/detail/${review.bookId}`} className="mypage-item-title">
                  {review.content}
                </Link>
                <div className="mypage-item-meta">
                  <span>❤️ {review.likes}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  );
}

export default MyPage;