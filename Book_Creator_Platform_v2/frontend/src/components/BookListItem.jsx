import { useNavigate } from "react-router-dom";
import { FALLBACK_COVER, normalizeTags } from "./utils.js";

function BookListItem({ book }) {
  const navigate = useNavigate();

  return (
    <article className="book-list-item">
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
  );
}

export default BookListItem;
