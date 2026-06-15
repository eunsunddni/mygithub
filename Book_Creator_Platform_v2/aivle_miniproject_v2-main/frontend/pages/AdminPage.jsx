import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../components/api.js';

function AdminPage() {
  const [books, setBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('books');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const role = localStorage.getItem('role');

  useEffect(() => {
    if (role !== 'ADMIN') {
      alert('관리자만 접근 가능합니다.');
      navigate('/');
      return;
    }

    async function loadData() {
      try {
        const [b, r, u] = await Promise.all([
          request('/books'),
          request('/reviews'),
          request('/admin/users'),
        ]);
        setBooks(b || []);
        setReviews(r || []);
        setUsers(u || []);
      } catch (err) {
        console.error('데이터 불러오기 실패:', err);
      }
      setLoading(false);
    }

    loadData();
  }, []);

  const handleDeleteBook = async (id) => {
    if (!window.confirm('도서를 삭제하시겠습니까?')) return;
    try {
      await request(`/admin/books/${id}`, { method: 'DELETE' });
      setBooks(books.filter(b => b.id !== id));
    } catch (err) {
      alert('삭제 실패');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('리뷰를 삭제하시겠습니까?')) return;
    try {
      await request(`/admin/reviews/${id}`, { method: 'DELETE' });
      setReviews(reviews.filter(r => r.id !== id));
    } catch (err) {
      alert('삭제 실패');
    }
  };

  if (loading) return <div className="mypage-loading">불러오는 중...</div>;

  const tabs = [
    { key: 'books', label: '도서 관리', count: books.length },
    { key: 'reviews', label: '리뷰 관리', count: reviews.length },
    { key: 'users', label: '회원 목록', count: users.length },
  ];

  return (
    <div className="admin-container">

      <div className="admin-header">
        <h2 className="admin-title">관리자 페이지</h2>
      </div>

      <div className="admin-tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`admin-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            <span className="admin-tab-count">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === 'books' && (
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>제목</th>
                <th>작가</th>
                <th>작성자</th>
                <th>좋아요</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.id}>
                  <td className="admin-td-muted">{book.id}</td>
                  <td className="admin-td-bold">{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.createdBy || '-'}</td>
                  <td>❤️ {book.likes}</td>
                  <td>
                    <button className="admin-delete-btn" onClick={() => handleDeleteBook(book.id)}>
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>닉네임</th>
                <th>내용</th>
                <th>작성자</th>
                <th>좋아요</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(review => (
                <tr key={review.id}>
                  <td className="admin-td-muted">{review.id}</td>
                  <td>{review.nickname}</td>
                  <td className="admin-td-content">{review.content}</td>
                  <td>{review.createdBy || '-'}</td>
                  <td>❤️ {review.likes}</td>
                  <td>
                    <button className="admin-delete-btn" onClick={() => handleDeleteReview(review.id)}>
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>아이디</th>
                <th>권한</th>
                <th>가입일</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className="admin-td-muted">{user.id}</td>
                  <td className="admin-td-bold">{user.username}</td>
                  <td>
                    <span className={`admin-role-badge ${user.role === 'ADMIN' ? 'admin' : 'user'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="admin-td-muted">{user.createdAt?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

export default AdminPage;