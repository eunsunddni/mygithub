import { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';

import HomePage from './pages/HomePage';
import ListPage from './pages/ListPage';
import CreatePage from './pages/CreatePage';
import DetailPage from './pages/DetailPage';
import ReviewListPage from './pages/ReviewListPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage';
import { request } from './components/api.js';

function App() {
  const [books, setBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState([]);
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem('username') || null
  );

  const handleLogin = (username) => {
    setCurrentUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setCurrentUser(null);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const booksRes = await fetch('http://localhost:8080/books');
        const reviewsRes = await fetch('http://localhost:8080/reviews');
        const res1 = await booksRes.json();
        setBooks(res1);
        const res2 = await reviewsRes.json();
        setReviews(res2);
      } catch (err) {
        console.error('데이터 불러오기 실패:', err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    setTags([...new Set(books.flatMap(b => b.tags ? b.tags : []))]);
  }, [books]);

  const handleCreateBook = async (newBook) => {
      const savedBook = await request('/books', {
          method: 'POST',
          body: JSON.stringify(newBook),
      });
      setBooks([savedBook, ...books]);
      return savedBook;
  };

  const handleBookLikes = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    const likedBooks = JSON.parse(localStorage.getItem('likedBooks') || '[]');
    const already = likedBooks.includes(String(id));

    try {
      const book = books.find(b => String(b.id) === String(id));
      const res = await fetch(`http://localhost:8080/books/${id}/likes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ likes: already ? book.likes - 1 : book.likes + 1 }),
      });
      if (!res.ok) throw new Error('좋아요 실패');
      const updatedBook = await res.json();
      setBooks((prevBooks) =>
        prevBooks.map((b) => String(b.id) === String(id) ? updatedBook : b)
      );
      if (already) {
        localStorage.setItem('likedBooks', JSON.stringify(likedBooks.filter(i => i !== String(id))));
      } else {
        localStorage.setItem('likedBooks', JSON.stringify([...likedBooks, String(id)]));
      }
    } catch (err) {
      console.error(err);
    }
  };
    
  const handleReviewLike = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    const likedReviews = JSON.parse(localStorage.getItem('likedReviews') || '[]');
    const already = likedReviews.includes(String(id));

    try {
      const review = reviews.find(r => r.id === id);
      const updated = await request(`/reviews/${id}/likes`, {
        method: 'PATCH',
        body: JSON.stringify({ likes: already ? review.likes - 1 : review.likes + 1 }),
      });
      setReviews(reviews.map((r) => (r.id === id ? updated : r)));
      if (already) {
        localStorage.setItem('likedReviews', JSON.stringify(likedReviews.filter(i => i !== String(id))));
      } else {
        localStorage.setItem('likedReviews', JSON.stringify([...likedReviews, String(id)]));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewEdit = async (id, edited) => {
    const updated = await request(`/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(edited),
    });
    setReviews(reviews.map(r => String(r.id) === String(id) ? updated : r));
    return updated;
  };

  const handleBookEdit = async (id, edited) => {
      try {
          const updated = await request(`/books/${id}`, {
              method: 'PATCH',
              body: JSON.stringify(edited),
          });
          setBooks(books.map(b => String(b.id) === String(id) ? updated : b));
      } catch (err) {
          console.error(err);
      }
  };

  const handleBookDelete = async (id) => {
      try {
          await request(`/books/${id}`, { method: 'DELETE' });
          setBooks(books.filter(b => String(b.id) !== String(id)));
      } catch (err) {
          console.error(err);
      }
  };

  const handleReviewDelete = async (id) => {
    try {
      await request(`/reviews/${id}`, { method: 'DELETE' });
      setReviews(reviews.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewAdd = (saved) => {
    try {
      setReviews([...reviews, saved]);
    } catch {
      alert('새로고침 필요.');
    }
  };

  if (loading) {
    return <div>전체 데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div>
      <header className="header">
        <div className="logo">
          <h1 className="logo">📚 도서관리</h1>
        </div>
        <nav>
          {localStorage.getItem('role') === 'ADMIN' && (
            <Link to="/admin">관리자</Link>
          )}
          <Link to="/">홈</Link>
          <Link to="/list">도서목록</Link>
          <Link to="/reviews">리뷰목록</Link>
          <Link to="/create" className="add-book-btn">+ 새 도서 등록</Link>
          {currentUser ? (
            <>
              <Link to="/mypage" className="nav-username">{currentUser}님</Link>
              <button className="nav-logout-btn" onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-pill-btn">로그인</Link>
              <Link to="/signup" className="nav-pill-btn">회원가입</Link>
            </>
          )}
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage books={books} reviews={reviews} />} />
          <Route path="/list" element={<ListPage books={books} tags={tags} />} />
          <Route path="/create" element={<CreatePage onCreateBook={handleCreateBook} />} />
          <Route path="/detail/:id" element={
            <DetailPage
              books={books}
              reviews={reviews}
              onBookEdit={handleBookEdit}
              onBookDelete={handleBookDelete}
              onBookLikes={handleBookLikes}
              onReviewLike={handleReviewLike}
              onReviewEdit={handleReviewEdit}
              onReviewDelete={handleReviewDelete}
              onReviewAdd={handleReviewAdd}
            />}
          />
          <Route path="/reviews" element={<ReviewListPage reviews={reviews} books={books} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;