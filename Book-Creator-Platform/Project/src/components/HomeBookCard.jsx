import { FALLBACK_COVER } from "./utils.js";

function HomeBookCard({ book, reviewCount, onClick, onLike }) {
  return (
    <article className="home-book-card" onClick={onClick}>
      <img
        src={book.coverImageUrl || FALLBACK_COVER}
        alt={book.title}
        className="home-book-cover"
      />

      <div className="home-book-info">
        <h3>{book.title}</h3>
        <p>{book.author}</p>

        <div className="card-meta">
          <button className="mini-like-button" onClick={onLike}>
            ❤️ {book.likes}
          </button>
          <span>리뷰 {reviewCount}</span>
        </div>
      </div>
    </article>
  );
}

export default HomeBookCard;
