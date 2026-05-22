import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { OPENAI_IMAGE_API_URL, request } from "./api.js";
import { FALLBACK_COVER, formatDate, normalizeTags } from "./utils.js";

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
Create a vertical Korean book cover.

Requirements:
- 3:4 vertical book cover composition.
- Include this Korean book title clearly: "${title}".
- Reflect the story/content below.
- Tags or category: ${tagText || "general literature"}.
- Include meaningful imagery and Korean title typography.
- Do not include random extra text except the title.

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

      setCoverImageUrl(`data:image/png;base64,${b64Json}`);
      setUpdatedAt(new Date().toISOString());
    } catch (error) {
      alert("AI 표지 생성에 실패했습니다. API Key, 모델명, 사용량을 확인하세요.");
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
      const savedBook = isEditMode
        ? await request(`/books/${id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          })
        : await request("/books", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      navigate(`/books/${savedBook.id}`);
    } catch (error) {
      alert("도서 저장에 실패했습니다.");
    }
  }

  return (
    <section className="page">
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
            <select value={model} onChange={(event) => setModel(event.target.value)}>
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
            <img
              src={coverImageUrl || FALLBACK_COVER}
              alt="표지 미리보기"
              className="cover-preview"
            />
          </div>

          <p className="help-text">
            API 요청은 실습 안정성을 위해 1024x1536을 사용합니다. 화면에서는
            3:4 비율로 표시합니다. 정확히 1080x1440 파일이 필요하면 별도 리사이즈가 필요합니다.
          </p>
        </section>
      </form>
    </section>
  );
}

export default BookFormPage;
