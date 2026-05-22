import { Link, NavLink } from "react-router-dom";

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

export default Header;
