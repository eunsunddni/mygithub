import { useNavigate } from 'react-router-dom';
import Create from '../components/Create';

function CreatePage({ onCreateBook }) {
  const navigate = useNavigate();

  const handleCreate = async (newBook) => {
    const savedBook = await onCreateBook(newBook);
    navigate(`/detail/${savedBook.id}`);
  };

  return (
    <div className="app">
      <h2 style={{ textAlign: 'center', margin: '40px 0' }}>새 도서 등록</h2>
      <Create onCreate={handleCreate} />
    </div>
  );
}

export default CreatePage;