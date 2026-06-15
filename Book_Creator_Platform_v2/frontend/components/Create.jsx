import { useState } from 'react';

function Create({ onCreate }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-image-1');
  const [quality, setQuality] = useState('low');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatingTag, setGeneratingTag] = useState(false);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");


  const updateTag = (index, value) => {
    const next = [...tags];
    next[index] = value;
    setTags(next);
  };

const deleteTag = (index) => {
  setTags(tags.filter((_, i) => i !== index));
};

const addTag = () => {
  if (!newTag.trim()) return;
  setTags(prev => [...(prev || []), newTag.trim()]);
  setNewTag("");
};
  const handleGenerateCover = async () => {

    if (!apiKey.trim()) {
      alert('OpenAI API Key를 입력하세요');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      alert('올바른 OpenAI API Key 형식이 아닙니다');
      return;
    }

    if (!title.trim() && !content.trim()) {
      alert('제목 또는 내용을 입력해야 표지를 생성할 수 있습니다');
      return;
    }

    if (title.trim().length > 100) {
      alert('제목은 100자 이하로 입력하세요');
      return;
    }

    setGenerating(true);

    try {

      const prompt =
        `다음 책에 어울리는 표지 일러스트를 생성해 주세요.\n` +
        `제목: ${title.trim()}\n` +
        `저자: ${author.trim()}\n` +
        `내용: ${content.trim()}`;

      const res = await fetch(
        'https://api.openai.com/v1/images/generations',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model,
            prompt,
            n: 1,
            size: '1024x1024',
            quality,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error?.message || '이미지 생성 실패'
        );
      }

      const item = data?.data?.[0];

      const url = item?.b64_json
        ? `data:image/png;base64,${item.b64_json}`
        : item?.url;

      if (!url) {
        throw new Error(
          '응답에서 이미지를 찾을 수 없습니다'
        );
      }

      setCoverImageUrl(url);

    } catch (err) {

      alert(`표지 생성 오류: ${err.message}`);

    } finally {

      setGenerating(false);

    }
  };

  const handleSubmit = async () => {

    if (!title.trim() || !author.trim()) {
      alert('제목과 저자를 입력하세요');
      return;
    }

    if (title.trim().length < 2) {
      alert('제목은 2자 이상 입력하세요');
      return;
    }

    if (author.trim().length < 2) {
      alert('저자명은 2자 이상 입력하세요');
      return;
    }

    const now = new Date().toISOString();

    try {

      await onCreate({
        title: title.trim(),
        author: author.trim(),
        content: content.trim(),
        likes: 0,
        coverImageUrl,
        tags: tags,

        createdAt: now,
        updatedAt: now,
      });

    } catch (err) {

      alert(`등록 실패: ${err.message}`);

    }
  };

  const handleCreateTag = async () => {
    
    if (!apiKey.trim()) {
      alert('OpenAI API Key를 입력하세요');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      alert('올바른 OpenAI API Key 형식이 아닙니다');
      return;
    }

    if (!title.trim() && !content.trim()) {
      alert('제목 또는 내용을 입력해야 표지를 생성할 수 있습니다');
      return;
    }

    if (title.trim().length > 100) {
      alert('제목은 100자 이하로 입력하세요');
      return;
    }
    setGeneratingTag(true);
    const tag_data = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `너는 책의 요약 내용을 보고, 책에 알맞은 태그를 만드는 역할이야.
           태그의 종류는 다음과 같아. 
            "소설·문학",
            "인문·역사",
            "경제·자기계발",
            "과학·기술",
            "실용·취미",
            "학습·아동",
           이 중에 해당하는 영역을 출력해줘. 부가적인 설명없이 tag만 list형식으로 출력해. 그리고 주어진 태그 종류 외에는 사용하지마
           이중에 아무것도 해당되지 않으면 '없음'태그를 부여해.
           출력은 반디시 JSON 배열만 한다.
           [출력 예시]
           ["실용·취미"]
           ["인문·역사", "과학·기술"]
           `
        },
        { role: 'user', content: content }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    };


    try{
    const res = await fetch ( "https://api.openai.com/v1/chat/completions",
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify(tag_data)
      }
    );

    const data = await res.json();

    const resultText = data.choices[0].message.content;


    const parsed = JSON.parse(resultText)['tags'];

    setTags(parsed);
    }catch{

    }finally {
      setGeneratingTag(false);

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
<div className="create-tag-box">
  {tags?.map((tag, index) => (
    <div className="create-tag-chip" key={index}>
      <span className="create-tag-hash">#</span>

      <input
        className="create-tag-input"
        value={tag}
        size={Math.max(tag.length, 2)}
        onChange={(e) => updateTag(index, e.target.value)}
      />

      <button
        className="create-tag-delete"
        onClick={() => deleteTag(index)}
        type="button"
      >
        ×
      </button>
    </div>
  ))}

  <div className="create-tag-add">
    <input
      className="create-tag-add-input"
      value={newTag}
      onChange={(e) => setNewTag(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") addTag();
      }}
      placeholder="태그 추가"
    />

    <button
      className="create-tag-add-button"
      onClick={addTag}
      type="button"
    >
      추가
    </button>

    <button
      className="create-tag-auto-button"
      onClick={handleCreateTag}
      disabled={generatingTag}
      type="button"
    >
      {generatingTag ? "생성 중..." : "자동 생성"}
    </button>
  </div>
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

      <button className="detail-btn" onClick={handleSubmit}>등록하기</button>
    </div>
  );
}

export default Create;
