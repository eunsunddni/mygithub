import { Link } from 'react-router-dom';
import { useState } from 'react';

function ReviewListPage({ reviews, books }) {

    const [sortType, setSortType] = useState('latest');

    const sortedReviews = [...reviews].sort((a, b) => {

        if (sortType === 'latest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }

        if (sortType === 'nickname') {
            return a.nickname.localeCompare(b.nickname);
        }

        if (sortType === 'likes') {
            return b.likes - a.likes;
        }

        return 0;
    });

    return (
        <div className="list-page">

        <div className="sort-menu">

            <button
                className={sortType === 'latest' ? 'active' : ''}
                onClick={() => setSortType('latest')}
            >
                최신순
            </button>

            <button
                className={sortType === 'nickname' ? 'active' : ''}
                onClick={() => setSortType('nickname')}
            >
                작성자순
            </button>

            <button
                className={sortType === 'likes' ? 'active' : ''}
                onClick={() => setSortType('likes')}
            >
                좋아요순
            </button>

        </div>
        <div className="review-list-page">

            {sortedReviews.map((review) => {

            const book = books.find(
                (b) =>
                String(b.id) ===
                String(review.bookId)
            );

            return (

                <Link
                key={review.id}
                to={`/detail/${review.bookId}`}
                className="review-card-link"
                >
            <div className="review-card" style={{'--book-cover': `url(${book?.coverImageUrl})`}}>
                <div className="review-top">
                    <div>
                        <h3>
                        {review.nickname}
                        </h3>
                        <span>
                        {book?.title}
                        </span>
                    </div>
                    <div className="review-like">
                        ❤️ {review.likes}
                    </div>
                    </div>

                    <p>
                    {review.content}
                    </p>

                </div>
                </Link>
            );
            })}

        </div>
        </div>
    );
    }

export default ReviewListPage;