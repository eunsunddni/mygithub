import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';

function ListPage({ books, tags }) {
  const [searchParams] = useSearchParams();

  const keyword = searchParams.get('keyword') || '';

  const [selectedTag, setSelectedTag] = useState('전체');

  const filteredBooks = books.filter((book) =>
  {
    const keyward_bool = book.title
      .toLowerCase()
      .includes(keyword.toLowerCase())
    const tag_bool = selectedTag === '전체'
      ? true
      : Array.isArray(book.tags) && book.tags.includes(selectedTag);

      return keyward_bool && tag_bool
  }
  );
  const [sortType, setSortType] = useState('latest');

  const sortedBooks = [...filteredBooks].sort((a, b) => {

    if (sortType === 'latest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    if (sortType === 'title') {
      return a.title.localeCompare(b.title);
    }

    if (sortType === 'likes') {
      return b.likes - a.likes;
    }

    return 0;
  });

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
  };

  return (
    <div className="list-page">

      <div className="sort-menu">
          {keyword && (

            <div className="search-result-title">

              "{keyword}" 검색 결과

              ({sortedBooks.length}권)

            </div>

          )}
        <button
          className={sortType === 'latest' ? 'active' : ''}
          onClick={() => setSortType('latest')}
        >
          최신순
        </button>

        <button
          className={sortType === 'title' ? 'active' : ''}
          onClick={() => setSortType('title')}
        >
          이름순
        </button>

        <button
          className={sortType === 'likes' ? 'active' : ''}
          onClick={() => setSortType('likes')}
        >
          좋아요순
        </button>

        <div className="tag-container">
          {['전체', ...tags].map((t) => {
            const isSelected = selectedTag === t;

            return (
              <button
                key={t}
                onClick={() => handleTagClick(t)}
                className={`tag-button ${isSelected ? 'active' : ''}`}
              >
                #{t}
              </button>
            );
          })}
        </div>
      </div>
      <div className="book-list">

        {sortedBooks.length === 0 ? (

          <div className="empty-result">
            검색 결과가 없습니다.
          </div>

        ) : (

          sortedBooks.map((book) => (
            <div
              className="book-card"
              key={book.id}
            >
              <Link
                to={`/detail/${book.id}`}
                className="image-link"
              >
                <div className="image-wrap">
                  <img
                    src={book.coverImageUrl}
                    alt={book.title}
                  />
                </div>
              </Link>
              <div className="book-content">
                <h2>
                  {book.title}
                </h2>
                <span className="search-author">
                  {book.author}
                </span>
                <div className="book-meta">
                  <div className="book-like">
                    ❤️ {book.likes}
                  </div>
                  {Array.isArray(book.tags) && book.tags.map((t) => (
                    <span className="book-tag" key={t}>
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))

        )}

      </div>

    </div>
  );
}

export default ListPage;