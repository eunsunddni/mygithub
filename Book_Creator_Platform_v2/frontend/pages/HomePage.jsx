import '../App.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function HomePage({ books, reviews }) {

  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();
  const handleSearch = () => {

  if (!keyword.trim()) {
    return;
  }

  navigate(
    `/list?keyword=${encodeURIComponent(keyword)}`
  );
};

  const topBooks = [...books]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 8);

  const topReviews = [...reviews]
  .sort((a, b) => b.likes - a.likes)
  .slice(0, 4);

  return (
    <div className="app">

      <div className="search-box">

        <input
          type="text"
          placeholder="도서 제목으로 검색..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />

        <button onClick={handleSearch}>
          검색
        </button>

      </div>

      <section className="top-book-section">

        <div className="section-title">
          <h2 className="section-main-title">
            월간 인기 도서
          </h2>
        </div>

      <div className="home-book-list">

        {topBooks.map((book) => (

          <div
            className="home-book-card"
            key={book.id}
          >

            <Link
              to={`/detail/${book.id}`}
              className="image-link"
            >

              <div className="home-image-wrap">

                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                />

              </div>

            </Link>

            <div className="home-book-content">

              <h3 className="home-book-title">
                {book.title}
              </h3>

              <div className="home-book-meta">

                <div className="home-book-like">
                  ❤️{book.likes}
                </div>

                <span className="home-author">
                  {book.author}
                </span>

              </div>
            </div>

          </div>

        ))}

      </div>

      </section>

      <section className="review-section">

        <div className="review-title-wrap">

          <h2 className="section-main-title">
            인기 리뷰
          </h2>

        </div>

        <div className="review-list">

          {topReviews.map((review) => (
        <Link
          to={`/detail/${review.bookId}`}
          className="review-card-link"
          key={review.id}
        >
          <div className="review-card">
            <div className="review-top">
              <div>
                <h3>{review.nickname}</h3>
                <span>
                  {
                    books.find(
                      (b) =>
                        String(b.id) ===
                        String(review.bookId)
                    )?.title
                  }
                </span>
              </div>
              <div className="review-like">
                ❤️ {review.likes}
              </div>
            </div>
            <p>{review.content}</p>
          </div>
        </Link>

          ))}

        </div>

      </section>

    </div>
  );
}

export default HomePage;