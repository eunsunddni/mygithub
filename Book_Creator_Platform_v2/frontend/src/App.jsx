import { Link, Route, Routes } from "react-router-dom";
import Header from "./components/Header.jsx";
import HomePage from "./components/HomePage.jsx";
import BookListPage from "./components/BookListPage.jsx";
import BookFormPage from "./components/BookFormPage.jsx";
import BookDetailPage from "./components/BookDetailPage.jsx";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Header />

      <main className="main">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/books" element={<BookListPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />

          <Route path="/create" element={<BookFormPage />} />
          <Route path="/create/:id" element={<BookFormPage />} />

          <Route path="/edit/:id" element={<BookFormPage />} />

          <Route
            path="*"
            element={
              <div className="page">
                <h2>페이지를 찾을 수 없습니다.</h2>
                <Link to="/" className="primary-button">
                  홈으로 이동
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
