import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { request } from "./api.js";
import { normalizeTags } from "./utils.js";
import BookListItem from "./BookListItem.jsx";

function BookListPage() {
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
        String(book.title || "").toLowerCase().includes(value) ||
        String(book.author || "").toLowerCase().includes(value) ||
        String(book.content || "").toLowerCase().includes(value) ||
        tags.toLowerCase().includes(value)
      );
    });
  }, [books, keyword]);

  if (loading) {
    return <section className="page">불러오는 중...</section>;
  }

  return (
    <section className="page">
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
        {filteredBooks.length === 0 ? (
          <p className="empty-text">검색 결과가 없습니다.</p>
        ) : (
          filteredBooks.map((book) => <BookListItem key={book.id} book={book} />)
        )}
      </div>
    </section>
  );
}

export default BookListPage;
