import { useState } from 'react';

function BookDetailEdit({book, onEdit, onCancel}) {
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [content, setContent] = useState(book.content);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-image-1');
  const [quality, setQuality] = useState('low');
  const [coverImageUrl, setCoverImageUrl] = useState(book.coverImageUrl);
  const [generating, setGenerating] = useState(false);

  const handleGenerateCover = async () => {
    if (!apiKey.trim()) {
      alert('OpenAI API Key를 입력하세요');
      return;
    }
    if (!title.trim() && !content.trim()) {
      alert('제목 또는 내용을 입력해야 표지를 생성할 수 있습니다');
      return;
    }

    const prompt =
      `다음 책에 어울리는 표지 일러스트를 생성해 주세요.\n` +
      `제목: ${title}\n` +
      `저자: ${author}\n` +
      `내용: ${content}`;

    setGenerating(true);
    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          prompt,
          n: 1,
          size: '1024x1024',
          quality,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || '이미지 생성 실패');

      const item = data?.data?.[0];
      const url = item?.b64_json
        ? `data:image/png;base64,${item.b64_json}`
        : item?.url;
      if (!url) throw new Error('응답에서 이미지를 찾을 수 없습니다');
      setCoverImageUrl(url);
    } catch (err) {
      alert(`표지 생성 오류: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (!title.trim() || !author.trim()) {
      alert('제목과 저자를 입력하세요');
      return;
    }
    const isConfirmed = window.confirm("정말 수정하시겠습니까?");
    if (!isConfirmed) return;
    try {
      await onEdit({ title, author, content, coverImageUrl});
    } catch (err) {
      alert(`등록 실패: ${err.message}`);
    }
  };


  return (
    <div className="create-form">
      <div className="form-group">
        <label>제목</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="책 제목" />
      </div>

      <div className="form-group">
        <label>저자</label>
        <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="저자 이름" />
      </div>

      <div className="form-group">
        <label>내용</label>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="책 소개" rows={5} />
      </div>

      <div className="form-group">
        <label>OpenAI API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          autoComplete="off"
        />
      </div>

      <div className="form-group">
        <label>생성 모델</label>
        <select value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="gpt-image-1">gpt-image-1 (1024x1024)</option>
          <option value="gpt-image-2">gpt-image-2 (1024x1024)</option>
        </select>
      </div>

      <div className="form-group">
        <label>품질</label>
        <select value={quality} onChange={(e) => setQuality(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <button type="button" onClick={handleGenerateCover} disabled={generating}>
        {generating ? '생성 중...' : 'AI 표지 생성'}
      </button>

      {coverImageUrl && (
        <div className="form-group">
          <label>생성된 표지</label>
          <img
            src={coverImageUrl}
            alt="generated cover"
            style={{ maxWidth: '300px', display: 'block' }}
          />
        </div>
      )}

      <button className="detail-btn" onClick={handleEdit}>수정하기</button>
      <button className="detail-btn" onClick={onCancel}>수정취소</button>
    </div>
  );
}

export default BookDetailEdit;