import { useEffect, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import "./App.css";

const API_BASE_URL = "http://localhost:3000";
const OPENAI_IMAGE_API_URL = "https://api.openai.com/v1/images/generations";
const FALLBACK_COVER = "https://placehold.co/360x480?text=No+Cover";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`요청 실패: ${res.status}`);
  }

  const text = await res.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text);
}

function formatDate(dateString) {
  if (!dateString) return "";

  return new Date(dateString).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getLatestDate(item) {
  return item.updatedAt || item.createdAt;
}

function normalizeTags(tag) {
  if (Array.isArray(tag)) return tag;

  if (typeof tag === "string") {
    return tag
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function App() {
  return (
    <div className="app">
      <Header />

      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<BookListPage />} />
          <Route path="/create" element={<BookFormPage />} />
          <Route path="/edit/:id" element={<BookFormPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route
            path="*"
            element={
              <div className="page">
                <h2>페이지를 찾을 수 없습니다.</h2>
                <Link to="/">홈으로 이동</Link>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="header">
      <Link to="/" className="logo">
        걷기가 서재
      </Link>

      <nav className="nav">
        <NavLink to="/" className="nav-button">
          홈
        </NavLink>
        <NavLink to="/books" className="nav-button">
          도서목록
        </NavLink>
        <NavLink to="/create" className="nav-button nav-primary">
          새 도서 등록
        </NavLink>
      </nav>
    </header>
  );
}

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

  function getReviewBookTitle(review) {
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
          likes: book.likes + 1,
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

    const ok = confirm("리뷰를 삭제하시겠습니까?");
    if (!ok) return;

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
    return <div className="page">불러오는 중...</div>;
  }

  return (
    <div className="page">
      <section className="section">
        <div className="section-title-row">
          <h2>인기 도서 TOP 10</h2>
          <Link to="/books" className="text-link">
            전체 보기
          </Link>
        </div>

        <div className="home-book-row">
          {topBooks.map((book) => (
            <article
              key={book.id}
              className="home-book-card"
              onClick={() => navigate(`/books/${book.id}`)}
            >
              <img
                src={book.coverImageUrl || FALLBACK_COVER}
                alt={book.title}
                className="home-book-cover"
              />

              <div className="home-book-info">
                <h3>{book.title}</h3>
                <p>{book.author}</p>

                <div className="card-meta">
                  <button
                    className="mini-like-button"
                    onClick={(event) => handleBookLike(event, book)}
                  >
                    ❤️ {book.likes}
                  </button>

                  <span>
                    리뷰{" "}
                    {
                      reviews.filter(
                        (review) => Number(review.bookId) === Number(book.id)
                      ).length
                    }
                  </span>
                </div>
              </div>
            </article>
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
              <article
                key={review.id}
                className="review-card"
                onClick={() => navigate(`/books/${review.bookId}`)}
              >
                <div className="review-main">
                  <h3>{getReviewBookTitle(review)}</h3>
                  <p className="review-nickname">{review.nickname}</p>
                  <p className="review-content">{review.content}</p>
                </div>

                <div className="review-actions">
                  <button
                    className="mini-like-button"
                    onClick={(event) => handleReviewLike(event, review)}
                  >
                    👍 {review.likes}
                  </button>

                  <button
                    className="sub-button"
                    onClick={(event) => handleEditReview(event, review)}
                  >
                    수정
                  </button>

                  <button
                    className="danger-button"
                    onClick={(event) => handleDeleteReview(event, review.id)}
                  >
                    삭제
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function BookListPage() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooks() {
      try {
        setLoading(true);
        const data = await request("/books");
        setBooks(data || []);
      } catch (error) {
        alert("도서 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    const value = keyword.trim().toLowerCase();

    if (!value) return books;

    return books.filter((book) => {
      const tags = normalizeTags(book.tag).join(" ");

      return (
        book.title.toLowerCase().includes(value) ||
        book.author.toLowerCase().includes(value) ||
        book.content.toLowerCase().includes(value) ||
        tags.toLowerCase().includes(value)
      );
    });
  }, [books, keyword]);

  if (loading) {
    return <div className="page">불러오는 중...</div>;
  }

  return (
    <div className="page">
      <div className="section-title-row">
        <h2>도서 목록</h2>
        <Link to="/create" className="primary-button">
          새 도서 등록
        </Link>
      </div>

      <input
        className="search-input"
        type="text"
        placeholder="도서명, 작가, 내용, 태그 검색"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />

      <div className="book-list">
        {filteredBooks.map((book) => (
          <article key={book.id} className="book-list-item">
            <img
              src={book.coverImageUrl || FALLBACK_COVER}
              alt={book.title}
              className="book-list-cover"
            />

            <div className="book-list-body">
              <h3>{book.title}</h3>
              <p className="book-author">{book.author}</p>
              <p className="book-summary">{book.content}</p>

              <div className="tag-row">
                {normalizeTags(book.tag).map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>

              <button
                className="primary-button"
                onClick={() => navigate(`/books/${book.id}`)}
              >
                자세히 보기
              </button>
            </div>
          </article>
        ))}

        {filteredBooks.length === 0 && (
          <p className="empty-text">검색 결과가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

function BookFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  const [originalBook, setOriginalBook] = useState(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [tagText, setTagText] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");

  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-image-2");
  const [quality, setQuality] = useState("medium");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!isEditMode) {
      const now = new Date().toISOString();
      setCreatedAt(now);
      setUpdatedAt(now);
      return;
    }

    async function loadBook() {
      try {
        const book = await request(`/books/${id}`);
        setOriginalBook(book);

        setTitle(book.title || "");
        setAuthor(book.author || "");
        setTagText(normalizeTags(book.tag).join(", "));
        setContent(book.content || "");
        setCoverImageUrl(book.coverImageUrl || "");
        setCreatedAt(book.createdAt || "");
        setUpdatedAt(book.updatedAt || "");
      } catch (error) {
        alert("수정할 도서를 불러오지 못했습니다.");
        navigate("/books");
      }
    }

    loadBook();
  }, [id, isEditMode, navigate]);

  async function handleGenerateCover() {
    if (!apiKey.trim()) {
      alert("OpenAI API Key를 입력하세요.");
      return;
    }

    if (!title.trim()) {
      alert("표지 생성을 위해 도서명을 입력하세요.");
      return;
    }

    if (!content.trim()) {
      alert("표지 생성을 위해 책 내용을 입력하세요.");
      return;
    }

    const prompt = `
Create a vertical book cover image.

Requirements:
- Use a 3:4 vertical book-cover composition.
- Include the Korean book title clearly: "${title}".
- Reflect the story/content below.
- Genre/tags: ${tagText || "general literature"}.
- Mood should match the content.
- Do not include extra random text except the title.

Book content:
${content}
    `.trim();

    try {
      setGenerating(true);

      const res = await fetch(OPENAI_IMAGE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          prompt,
          n: 1,
          size: "1024x1536",
          quality,
          output_format: "png",
        }),
      });

      if (!res.ok) {
        throw new Error(`OpenAI 요청 실패: ${res.status}`);
      }

      const data = await res.json();
      const b64Json = data.data?.[0]?.b64_json;

      if (!b64Json) {
        throw new Error("이미지 응답 형식이 예상과 다릅니다.");
      }

      const imageSrc = `data:image/png;base64,${b64Json}`;
      setCoverImageUrl(imageSrc);
      setUpdatedAt(new Date().toISOString());
    } catch (error) {
      alert("AI 표지 생성에 실패했습니다. API Key, 사용량, 모델명을 확인하세요.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim()) {
      alert("도서명을 입력하세요.");
      return;
    }

    if (!author.trim()) {
      alert("작가명을 입력하세요.");
      return;
    }

    if (!content.trim()) {
      alert("책 내용을 입력하세요.");
      return;
    }

    const now = new Date().toISOString();

    const payload = {
      title: title.trim(),
      author: author.trim(),
      tag: normalizeTags(tagText),
      likes: originalBook?.likes ?? 0,
      content: content.trim(),
      coverImageUrl: coverImageUrl.trim(),
      createdAt: originalBook?.createdAt || createdAt || now,
      updatedAt: now,
    };

    try {
      let savedBook;

      if (isEditMode) {
        savedBook = await request(`/books/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        savedBook = await request("/books", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      navigate(`/books/${savedBook.id}`);
    } catch (error) {
      alert("도서 저장에 실패했습니다.");
    }
  }

  return (
    <div className="page">
      <h2>{isEditMode ? "도서 수정" : "새 도서 등록"}</h2>

      <form className="form-grid" onSubmit={handleSubmit}>
        <section className="form-panel">
          <h3>기본 정보</h3>

          <label>
            도서명
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="도서명을 입력하세요"
            />
          </label>

          <label>
            작가
            <input
              type="text"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="작가명을 입력하세요"
            />
          </label>

          <label>
            태그
            <input
              type="text"
              value={tagText}
              onChange={(event) => setTagText(event.target.value)}
              placeholder="예: 한국소설, SF, 감성"
            />
          </label>

          <label>
            책 내용
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="책 내용 또는 줄거리를 입력하세요"
              rows={12}
            />
          </label>

          <div className="date-box">
            <p>생성일: {formatDate(createdAt)}</p>
            <p>수정일: {formatDate(updatedAt)}</p>
          </div>

          <div className="button-row">
            <button type="submit" className="primary-button">
              {isEditMode ? "수정 완료" : "등록하기"}
            </button>

            <button
              type="button"
              className="sub-button"
              onClick={() => navigate(-1)}
            >
              취소
            </button>
          </div>
        </section>

        <section className="form-panel">
          <h3>AI 표지 생성</h3>

          <label>
            OpenAI API Key
            <input
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="API Key는 저장하지 않습니다"
            />
          </label>

          <label>
            생성 모델
            <select
              value={model}
              onChange={(event) => setModel(event.target.value)}
            >
              <option value="gpt-image-2">gpt-image-2</option>
              <option value="gpt-image-1">gpt-image-1</option>
            </select>
          </label>

          <label>
            품질
            <select
              value={quality}
              onChange={(event) => setQuality(event.target.value)}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="auto">auto</option>
            </select>
          </label>

          <button
            type="button"
            className="primary-button"
            onClick={handleGenerateCover}
            disabled={generating}
          >
            {generating ? "표지 생성 중..." : "표지 생성"}
          </button>

          <div className="cover-preview-box">
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt="생성된 표지"
                className="cover-preview"
              />
            ) : (
              <div className="cover-placeholder">표지 미리보기</div>
            )}
          </div>

          <p className="help-text">
            교안 기준 API 요청 size는 1024x1536을 사용했습니다. 화면에서는
            3:4 표지 비율로 표시되도록 CSS에서 조정합니다.
          </p>
        </section>
      </form>
    </div>
  );
}

function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [nickname, setNickname] = useState("");
  const [reviewContent, setReviewContent] = useState("");

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
          likes: book.likes + 1,
          updatedAt: new Date().toISOString(),
        }),
      });

      setBook(updatedBook);
    } catch (error) {
      alert("도서 좋아요 처리에 실패했습니다.");
    }
  }

  async function handleCreateReview(event) {
    event.preventDefault();

    if (!nickname.trim()) {
      alert("닉네임을 입력하세요.");
      return;
    }

    if (!reviewContent.trim()) {
      alert("리뷰 내용을 입력하세요.");
      return;
    }

    const now = new Date().toISOString();

    const newReview = {
      bookId: Number(book.id),
      bookTitle: book.title,
      nickname: nickname.trim(),
      content: reviewContent.trim(),
      likes: 0,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const savedReview = await request("/reviews", {
        method: "POST",
        body: JSON.stringify(newReview),
      });

      setReviews((prev) => [savedReview, ...prev]);
      setNickname("");
      setReviewContent("");
    } catch (error) {
      alert("리뷰 등록에 실패했습니다.");
    }
  }

  async function handleReviewLike(review) {
    try {
      const updatedReview = await request(`/reviews/${review.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          likes: review.likes + 1,
          updatedAt: new Date().toISOString(),
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
    const ok = confirm("리뷰를 삭제하시겠습니까?");
    if (!ok) return;

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
    return <div className="page">불러오는 중...</div>;
  }

  return (
    <div className="page">
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

            <button
              className="sub-button"
              onClick={() => navigate(`/edit/${book.id}`)}
            >
              수정
            </button>
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
            <p>수정일: {formatDate(book.updatedAt)}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>리뷰 작성</h2>

        <form className="review-form" onSubmit={handleCreateReview}>
          <input
            type="text"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="닉네임"
          />

          <textarea
            value={reviewContent}
            onChange={(event) => setReviewContent(event.target.value)}
            placeholder="리뷰 내용을 입력하세요"
            rows={4}
          />

          <button type="submit" className="primary-button">
            리뷰 등록
          </button>
        </form>
      </section>

      <section className="section">
        <h2>리뷰</h2>

        <div className="review-list">
          {sortedReviews.length === 0 ? (
            <p className="empty-text">아직 이 책에 대한 리뷰가 없습니다.</p>
          ) : (
            sortedReviews.map((review) => (
              <article key={review.id} className="review-card no-click">
                <div className="review-main">
                  <h3>{book.title}</h3>
                  <p className="review-nickname">{review.nickname}</p>
                  <p className="review-content">{review.content}</p>
                  <p className="review-date">
                    최근 작성/수정: {formatDate(getLatestDate(review))}
                  </p>
                </div>

                <div className="review-actions">
                  <button
                    className="mini-like-button"
                    onClick={() => handleReviewLike(review)}
                  >
                    👍 {review.likes}
                  </button>

                  <button
                    className="sub-button"
                    onClick={() => handleEditReview(review)}
                  >
                    수정
                  </button>

                  <button
                    className="danger-button"
                    onClick={() => handleDeleteReview(review.id)}
                  >
                    삭제
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default App;