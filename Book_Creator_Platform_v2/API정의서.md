# API 정의서

## 1. 기본 정보

| 항목 | 내용 |
| --- | --- |
| API 이름 | 도서관리시스템 API |
| 버전 | v1 |
| 기본 URL | `http://localhost:8080` |
| 데이터 형식 | JSON |
| 인증 방식 | JWT Bearer Token |
| 주요 리소스 | Book, Review |

---

## 2. 공통 오류 응답

### Response 예시

```json
{
  "status": 404,
  "error": "NOT_FOUND",
  "message": "도서를 찾을 수 없습니다.",
  "path": "/books/999",
  "timestamp": "2026-05-22T10:00:00"
}
```

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| `status` | Number | HTTP 상태 코드 |
| `error` | String | 에러 종류 |
| `message` | String | 에러 메시지 |
| `path` | String | 요청 경로 |
| `timestamp` | String | 에러 발생 시각 |

### 공통 상태 코드

| 상태 코드 | 설명 |
| ---: | --- |
| 400 Bad Request | 필수 필드 누락 또는 잘못된 요청 |
| 401 Unauthorized | 인증 토큰 없음 또는 만료 |
| 403 Forbidden | 권한 없음 |
| 404 Not Found | 요청한 리소스를 찾을 수 없음 |
| 500 Internal Server Error | 서버 내부 오류 |

---

# 3. Books API

## 3.1 도서 목록 조회

### Request

```txt
GET /books
```

### 설명

전체 도서 목록을 조회한다.

### Query Parameter

| 이름 | 위치 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | ---: | --- |
| `keyword` | query | String | 선택 | 도서명, 작가명, 내용, 태그 검색어 |
| `sort` | query | String | 선택 | 정렬 기준. `latest`, `likes`, `title` |

### Request 예시

```txt
GET /books
GET /books?keyword=소설
GET /books?sort=likes
GET /books?keyword=SF&sort=latest
```

### Response

```json
[
  {
    "id": 1,
    "title": "돌이킬 수 있는",
    "author": "문목하",
    "tag": ["한국소설", "SF"],
    "content": "촉망받는 신입 수사관 윤서리...",
    "coverImageUrl": "https://image.aladin.co.kr/product/...",
    "likes": 0,
    "createdAt": "2026-05-22T09:00:00",
    "updatedAt": "2026-05-22T09:00:00"
  }
]
```

### 상태 코드

| 코드 | 설명 |
| ---: | --- |
| 200 OK | 도서 목록 조회 성공 |

---

## 3.2 도서 상세 조회

### Request

```txt
GET /books/{id}
```

### 설명

특정 도서의 상세 정보를 조회한다.

### Path Variable

| 이름 | 타입 | 필수 여부 | 설명 |
| --- | --- | ---: | --- |
| `id` | Long | 필수 | 조회할 도서 ID |

### Request 예시

```txt
GET /books/1
```

### Response

```json
{
  "id": 1,
  "title": "돌이킬 수 있는",
  "author": "문목하",
  "tag": ["한국소설", "SF"],
  "content": "촉망받는 신입 수사관 윤서리...",
  "coverImageUrl": "https://image.aladin.co.kr/product/...",
  "likes": 0,
  "createdAt": "2026-05-22T09:00:00",
  "updatedAt": "2026-05-22T09:00:00"
}
```

### 상태 코드

| 코드 | 설명 |
| ---: | --- |
| 200 OK | 도서 상세 조회 성공 |
| 404 Not Found | 해당 도서를 찾을 수 없음 |

---

## 3.3 도서 등록

### Request

```txt
POST /books
```

### 설명

새로운 도서를 등록한다.

### Request Body

```json
{
  "title": "새 도서 제목",
  "author": "작가명",
  "tag": ["한국소설", "감성"],
  "content": "도서 내용 또는 줄거리",
  "coverImageUrl": ""
}
```

### Request Body 필드

| 필드명 | 타입 | 필수 여부 | 설명 |
| --- | --- | ---: | --- |
| `title` | String | 필수 | 도서 제목 |
| `author` | String | 필수 | 작가명 |
| `tag` | Array | 선택 | 도서 태그 목록 |
| `content` | String | 필수 | 도서 내용 또는 줄거리 |
| `coverImageUrl` | String | 선택 | 표지 이미지 URL 또는 AI 생성 Data URL |

### Response

```json
{
  "id": 2,
  "title": "새 도서 제목",
  "author": "작가명",
  "tag": ["한국소설", "감성"],
  "content": "도서 내용 또는 줄거리",
  "coverImageUrl": "",
  "likes": 0,
  "createdAt": "2026-05-22T10:00:00",
  "updatedAt": "2026-05-22T10:00:00"
}
```

### 상태 코드

| 코드 | 설명 |
| ---: | --- |
| 201 Created | 도서 등록 성공 |
| 400 Bad Request | 필수 필드 누락 또는 잘못된 요청 |

---

## 3.4 도서 수정

### Request

```txt
PATCH /books/{id}
```

### 설명

기존 도서 정보를 부분 수정한다.

### Path Variable

| 이름 | 타입 | 필수 여부 | 설명 |
| --- | --- | ---: | --- |
| `id` | Long | 필수 | 수정할 도서 ID |

### Request Body

```json
{
  "title": "수정된 도서 제목",
  "author": "수정된 작가명",
  "tag": ["해외소설", "고전"],
  "content": "수정된 도서 내용",
  "coverImageUrl": "https://image.aladin.co.kr/product/..."
}
```

### Request Body 필드

| 필드명 | 타입 | 필수 여부 | 설명 |
| --- | --- | ---: | --- |
| `title` | String | 선택 | 수정할 도서 제목 |
| `author` | String | 선택 | 수정할 작가명 |
| `tag` | Array | 선택 | 수정할 태그 목록 |
| `content` | String | 선택 | 수정할 도서 내용 |
| `coverImageUrl` | String | 선택 | 수정할 표지 이미지 URL |

### Response

```json
{
  "id": 1,
  "title": "수정된 도서 제목",
  "author": "수정된 작가명",
  "tag": ["해외소설", "고전"],
  "content": "수정된 도서 내용",
  "coverImageUrl": "https://image.aladin.co.kr/product/...",
  "likes": 0,
  "createdAt": "2026-05-22T09:00:00",
  "updatedAt": "2026-05-22T11:00:00"
}
```

### 상태 코드

| 코드 | 설명 |
| ---: | --- |
| 200 OK | 도서 수정 성공 |
| 400 Bad Request | 잘못된 요청 |
| 404 Not Found | 해당 도서를 찾을 수 없음 |

---

## 3.5 AI 표지 이미지 저장

### Request

```txt
PATCH /books/{id}/cover
```

### 설명

Frontend에서 OpenAI API를 통해 생성한 표지 이미지 Data URL을 도서의 `coverImageUrl` 필드에 저장한다.

### Path Variable

| 이름 | 타입 | 필수 여부 | 설명 |
| --- | --- | ---: | --- |
| `id` | Long | 필수 | 표지를 저장할 도서 ID |

### Request Body

```json
{
  "coverImageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

### Request Body 필드

| 필드명 | 타입 | 필수 여부 | 설명 |
| --- | --- | ---: | --- |
| `coverImageUrl` | String | 필수 | AI 생성 표지 이미지 Data URL |

### Response

```json
{
  "id": 1,
  "title": "돌이킬 수 있는",
  "author": "문목하",
  "tag": ["한국소설", "SF"],
  "content": "촉망받는 신입 수사관 윤서리...",
  "coverImageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "likes": 0,
  "createdAt": "2026-05-22T09:00:00",
  "updatedAt": "2026-05-22T11:30:00"
}
```

### 상태 코드

| 코드 | 설명 |
| ---: | --- |
| 200 OK | 표지 이미지 저장 성공 |
| 400 Bad Request | 표지 이미지 URL 누락 |
| 404 Not Found | 해당 도서를 찾을 수 없음 |

---

## 3.6 도서 좋아요 증가

### Request

```txt
PATCH /books/{id}/like
```

### 설명

특정 도서의 좋아요 수를 1 증가시킨다.

사용자 인증 기능이 없으므로 중복 좋아요 방지는 처리하지 않는다.

### Path Variable

| 이름 | 타입 | 필수 여부 | 설명 |
| --- | --- | ---: | --- |
| `id` | Long | 필수 | 좋아요를 누를 도서 ID |

### Request Body

없음.

### Response

```json
{
  "id": 1,
  "title": "돌이킬 수 있는",
  "author": "문목하",
  "tag": ["한국소설", "SF"],
  "content": "촉망받는 신입 수사관 윤서리...",
  "coverImageUrl": "https://image.aladin.co.kr/product/...",
  "likes": 1,
  "createdAt": "2026-05-22T09:00:00",
  "updatedAt": "2026-05-22T09:00:00"
}
```

### 상태 코드

| 코드 | 설명 |
| ---: | --- |
| 200 OK | 도서 좋아요 증가 성공 |
| 404 Not Found | 해당 도서를 찾을 수 없음 |

---

## 3.7 도서 삭제

### Request

```txt
DELETE /books/{id}
```

### 설명

특정 도서를 삭제한다.

도서 삭제 시 해당 도서에 연결된 리뷰도 함께 삭제한다.

### Path Variable

| 이름 | 타입 | 필수 여부 | 설명 |
| --- | --- | ---: | --- |
| `id` | Long | 필수 | 삭제할 도서 ID |

### Request 예시

```txt
DELETE /books/1
```

### Response

응답 본문 없음.

### 상태 코드

| 코드 | 설명 |
| ---: | --- |
| 204 No Content | 도서 삭제 성공 |
| 404 Not Found | 해당 도서를 찾을 수 없음 |

---

# 4. Reviews API

## 4.1 리뷰 전체 조회

### Request

```txt
GET /reviews
```

### 설명

전체 리뷰 목록을 조회한다.

### Response

```json
[
  {
    "id": 1,
    "bookId": 1,
    "bookTitle": "돌이킬 수 있는",
    "nickname": "독서왕",
    "content": "흥미로운 설정이 좋았습니다.",
    "likes": 0,
    "createdAt": "2026-05-22T10:00:00",
    "updatedAt": "2026-05-22T10:00:00"
  }
]
```

### 상태 코드

| 코드 | 설명 |
| ---: | --- |
| 200 OK | 리뷰 전체 조회 성공 |

---

## 4.2 특정 도서 리뷰 조회

### Request

```txt
GET /reviews?bookId={bookId}
```

### 설명

특정 도서에 작성된 리뷰 목록을 조회한다.

### Query Parameter

| 이름 | 위치 | 타입 | 필수 여부 | 설명 |
| --- | --- | --- | ---: | --- |
| `bookId` | query | Long | 필수 | 리뷰가 연결된 도서 ID |

### Request 예시

```txt
GET /reviews?bookId=1
```

### Response

```json
[
  {
    "id": 1,
    "bookId": 1,
    "bookTitle": "돌이킬 수 있는",
    "nickname": "독서왕",
    "content": "흥미로운 설정이 좋았습니다.",
    "likes": 0,
    "createdAt": "2026-05-22T10:00:00",
    "updatedAt": "2026-05-22T10:00:00"
  }
]
```

### 상태 코드

| 코드 | 설명 |
| ---: | --- |
| 200 OK | 특정 도서 리뷰 조회 성공 |
| 404 Not Found | 해당 도서를 찾을 수 없음 |

---

## 4.3 리뷰 등록

### Request

```txt
POST /books/{bookId}/reviews
```

### 설명

특정 도서에 리뷰를 등록한다.

### Path Variable

| 이름 | 타입 | 필수 여부 | 설명 |
| --- | --- | ---: | --- |
| `bookId` | Long | 필수 | 리뷰를 등록할 도서 ID |

### Request Body

```json
{
  "nickname": "독서왕",
  "content": "흥미로운 설정이 좋았습니다."
}
```

### Request Body 필드

| 필드명 | 타입 | 필수 여부 | 설명 |
| --- | --- | ---: | --- |
| `nickname` | String | 필수 | 리뷰 작성자 닉네임 |
| `content` | String | 필수 | 리뷰 내용 |

### Response

```json
{
  "id": 1,
  "bookId": 1,
  "bookTitle": "돌이킬 수 있는",
  "nickname": "독서왕",
  "content": "흥미로운 설정이 좋았습니다.",
  "likes": 0,
  "createdAt": "2026-05-22T10:00:00",
  "updatedAt": "2026-05-22T10:00:00"
}
```

### 상태 코드

| 코드 | 설명 |
| ---: | --- |
| 201 Created | 리뷰 등록 성공 |
| 400 Bad Request | 닉네임 또는 리뷰 내용 누락 |
| 404 Not Found | 해당 도서를 찾을 수 없음 |

---

## 4.4 리뷰 등록 호환 API

### Request

```txt
POST /reviews
```

### 설명

기존 Frontend의 `json-server` 호출 방식과 호환하기 위한 리뷰 등록 API이다.

이 API를 사용할 경우 요청 본문에 `bookId`를 포함한다.

### Request Body

```json
{
  "bookId": 1,
  "nickname": "독서왕",
  "content": "흥미로운 설정이 좋았습니다."
}
```

### Request Body 필드

| 필드명 | 타입 | 필수 여부 | 설명 |
| --- | --- | ---: | --- |
| `bookId` | Long | 필수 | 리뷰를 등록할 도서 ID |
| `nickname` | String | 필수 | 리뷰 작성자 닉네임 |
| `content` | String | 필수 | 리뷰 내용 |

### Response

```json
{
  "id": 1,
  "bookId": 1,
  "bookTitle": "돌이킬 수 있는",
  "nickname": "독서왕",
  "content": "흥미로운 설정이 좋았습니다.",
  "likes": 0,
  "createdAt": "2026-05-22T10:00:00",
  "updatedAt": "2026-05-22T10:00:00"
}
```

### 상태 코드

| 코드 | 설명 |
| ---: | --- |
| 201 Created | 리뷰 등록 성공 |
| 400 Bad Request | bookId, 닉네임 또는 리뷰 내용 누락 |
| 404 Not Found | 해당 도서를 찾을 수 없음 |

---

## 4.5 리뷰 수정

### Request

```txt
PATCH /reviews/{id}
```

### 설명

기존 리뷰 내용을 수정한다.

### Path Variable

| 이름 | 타입 | 필수 여부 | 설명 |
| --- | --- | ---: | --- |
| `id` | Long | 필수 | 수정할 리뷰 ID |

### Request Body

```json
{
  "content": "수정된 리뷰 내용입니다."
}
```

### Request Body 필드

| 필드명 | 타입 | 필수 여부 | 설명 |
| --- | --- | ---: | --- |
| `content` | String | 필수 | 수정할 리뷰 내용 |

### Response

```json
{
  "id": 1,
  "bookId": 1,
  "bookTitle": "돌이킬 수 있는",
  "nickname": "독서왕",
  "content": "수정된 리뷰 내용입니다.",
  "likes": 0,
  "createdAt": "2026-05-22T10:00:00",
  "updatedAt": "2026-05-22T11:00:00"
}
```

### 상태 코드

| 코드 | 설명 |
| ---: | --- |
| 200 OK | 리뷰 수정 성공 |
| 400 Bad Request | 리뷰 내용 누락 |
| 404 Not Found | 해당 리뷰를 찾을 수 없음 |

---

## 4.6 리뷰 좋아요 증가

### Request

```txt
PATCH /reviews/{id}/like
```

### 설명

특정 리뷰의 좋아요 수를 1 증가시킨다.

사용자 인증 기능이 없으므로 중복 좋아요 방지는 처리하지 않는다.

### Path Variable

| 이름 | 타입 | 필수 여부 | 설명 |
| --- | --- | ---: | --- |
| `id` | Long | 필수 | 좋아요를 누를 리뷰 ID |

### Request Body

없음.

### Response

```json
{
  "id": 1,
  "bookId": 1,
  "bookTitle": "돌이킬 수 있는",
  "nickname": "독서왕",
  "content": "흥미로운 설정이 좋았습니다.",
  "likes": 1,
  "createdAt": "2026-05-22T10:00:00",
  "updatedAt": "2026-05-22T10:00:00"
}
```

### 상태 코드

| 코드 | 설명 |
| ---: | --- |
| 200 OK | 리뷰 좋아요 증가 성공 |
| 404 Not Found | 해당 리뷰를 찾을 수 없음 |

---

## 4.7 리뷰 삭제

### Request

```txt
DELETE /reviews/{id}
```

### 설명

특정 리뷰를 삭제한다.

### Path Variable

| 이름 | 타입 | 필수 여부 | 설명 |
| --- | --- | ---: | --- |
| `id` | Long | 필수 | 삭제할 리뷰 ID |

### Request 예시

```txt
DELETE /reviews/1
```

### Response

응답 본문 없음.

### 상태 코드

| 코드 | 설명 |
| ---: | --- |
| 204 No Content | 리뷰 삭제 성공 |
| 404 Not Found | 해당 리뷰를 찾을 수 없음 |

---

# 5. OpenAI Image Generation API

## 5.1 AI 표지 생성

### Request

```txt
POST https://api.openai.com/v1/images/generations
```

### 설명

도서 제목, 태그, 내용을 기반으로 AI 표지 이미지를 생성한다.

해당 요청은 Spring Boot 서버가 아니라 Frontend에서 OpenAI API로 직접 보낸다.

### Headers

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {사용자_OPENAI_API_KEY}"
}
```

### Request Body

```json
{
  "model": "gpt-image-2",
  "prompt": "도서 제목, 태그, 내용을 기반으로 구성한 표지 생성 프롬프트",
  "n": 1,
  "size": "1024x1536",
  "quality": "medium",
  "output_format": "png"
}
```

### Response

```json
{
  "data": [
    {
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ]
}
```

### Frontend 처리

OpenAI 응답의 `b64_json`을 다음 형식의 Data URL로 변환한다.

```txt
data:image/png;base64,{b64_json}
```

이후 변환한 값을 Spring Boot API로 전달한다.

```txt
PATCH /books/{id}/cover
```

### 상태 코드

| 코드 | 설명 |
| ---: | --- |
| 200 OK | 이미지 생성 성공 |
| 400 Bad Request | 잘못된 요청 |
| 401 Unauthorized | OpenAI API 인증 실패 |

---

# 6. Auth API

## 6.1 회원가입

### Request

```txt
POST /auth/register
```

### 설명

새 사용자 계정을 생성한다.

### Request Body

```json
{
  "username": "user1",
  "password": "password123"
}
```

### Request Body 필드

| 필드명 | 타입 | 필수 여부 | 설명 |
| --- | --- | ---: | --- |
| `username` | String | 필수 | 사용자 아이디 |
| `password` | String | 필수 | 비밀번호 |

### Response

응답 본문 없음.

### 상태 코드

| 코드 | 설명 |
| ---: | --- |
| 201 Created | 회원가입 성공 |
| 400 Bad Request | 필수 필드 누락 또는 중복 아이디 |

---

## 6.2 로그인

### Request

```txt
POST /auth/login
```

### 설명

아이디와 비밀번호로 로그인하고 JWT 토큰을 발급받는다.

### Request Body

```json
{
  "username": "user1",
  "password": "password123"
}
```

### Request Body 필드

| 필드명 | 타입 | 필수 여부 | 설명 |
| --- | --- | ---: | --- |
| `username` | String | 필수 | 사용자 아이디 |
| `password` | String | 필수 | 비밀번호 |

### Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "USER"
}
```

### Response 필드

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| `token` | String | JWT 인증 토큰 |
| `role` | String | 사용자 권한 (`USER` 또는 `ADMIN`) |

> 발급받은 `token`은 이후 인증이 필요한 요청에서 `Authorization: Bearer <token>` 형식으로 사용한다.

### 상태 코드

| 코드 | 설명 |
| ---: | --- |
| 200 OK | 로그인 성공 |
| 400 Bad Request | 필수 필드 누락 |
| 401 Unauthorized | 아이디 또는 비밀번호 불일치 |

---

# 7. Admin API

## 7.1 전체 회원 목록 조회

### Request

```txt
GET /admin/users
```

### 설명

전체 회원 목록을 조회한다. ADMIN 권한이 필요하다.

### Response

```json
[
  {
    "id": 1,
    "username": "user1",
    "role": "USER",
    "createdAt": "2026-05-22T10:00:00"
  }
]
```

### Response 필드

| 필드명 | 타입 | 설명 |
| --- | --- | --- |
| `id` | Number | 회원 고유 ID |
| `username` | String | 사용자 아이디 |
| `role` | String | 권한 (`USER` 또는 `ADMIN`) |
| `createdAt` | String | 가입일시 (ISO 8601) |

### 상태 코드

| 코드 | 설명 |
| ---: | --- |
| 200 OK | 조회 성공 |
| 401 Unauthorized | 인증 토큰 없음 또는 만료 |
| 403 Forbidden | ADMIN 권한 없음 |

---

## 7.2 도서 삭제 (관리자)

### Request

```txt
DELETE /admin/books/{id}
```

### 설명

특정 도서를 삭제한다. ADMIN 권한이 필요하다.

도서 삭제 시 해당 도서에 연결된 리뷰도 함께 삭제한다.

### Path Variable

| 이름 | 타입 | 필수 여부 | 설명 |
| --- | --- | ---: | --- |
| `id` | Long | 필수 | 삭제할 도서 ID |

### Response

응답 본문 없음.

### 상태 코드

| 코드 | 설명 |
| ---: | --- |
| 204 No Content | 도서 삭제 성공 |
| 401 Unauthorized | 인증 토큰 없음 또는 만료 |
| 403 Forbidden | ADMIN 권한 없음 |
| 404 Not Found | 해당 도서를 찾을 수 없음 |

---

## 7.3 리뷰 삭제 (관리자)

### Request

```txt
DELETE /admin/reviews/{id}
```

### 설명

특정 리뷰를 삭제한다. ADMIN 권한이 필요하다.

### Path Variable

| 이름 | 타입 | 필수 여부 | 설명 |
| --- | --- | ---: | --- |
| `id` | Long | 필수 | 삭제할 리뷰 ID |

### Response

응답 본문 없음.

### 상태 코드

| 코드 | 설명 |
| ---: | --- |
| 204 No Content | 리뷰 삭제 성공 |
| 401 Unauthorized | 인증 토큰 없음 또는 만료 |
| 403 Forbidden | ADMIN 권한 없음 |
| 404 Not Found | 해당 리뷰를 찾을 수 없음 |

---

# 8. API 요약표

## 8.1 Books API

| 기능 | Method | URL |
| --- | --- | --- |
| 도서 목록 조회 | GET | `/books` |
| 도서 상세 조회 | GET | `/books/{id}` |
| 도서 등록 | POST | `/books` |
| 도서 수정 | PATCH | `/books/{id}` |
| AI 표지 이미지 저장 | PATCH | `/books/{id}/cover` |
| 도서 좋아요 증가 | PATCH | `/books/{id}/like` |
| 도서 삭제 | DELETE | `/books/{id}` |

## 8.2 Reviews API

| 기능 | Method | URL |
| --- | --- | --- |
| 리뷰 전체 조회 | GET | `/reviews` |
| 특정 도서 리뷰 조회 | GET | `/reviews?bookId={bookId}` |
| 리뷰 등록 | POST | `/books/{bookId}/reviews` |
| 리뷰 등록 호환 API | POST | `/reviews` |
| 리뷰 수정 | PATCH | `/reviews/{id}` |
| 리뷰 좋아요 증가 | PATCH | `/reviews/{id}/like` |
| 리뷰 삭제 | DELETE | `/reviews/{id}` |

## 8.3 OpenAI API

| 기능 | Method | URL |
| --- | --- | --- |
| AI 표지 생성 | POST | `https://api.openai.com/v1/images/generations` |

## 8.4 Auth API

| 기능 | Method | URL |
| --- | --- | --- |
| 회원가입 | POST | `/auth/register` |
| 로그인 | POST | `/auth/login` |

## 8.5 Admin API

| 기능 | Method | URL |
| --- | --- | --- |
| 전체 회원 목록 조회 | GET | `/admin/users` |
| 도서 삭제 (관리자) | DELETE | `/admin/books/{id}` |
| 리뷰 삭제 (관리자) | DELETE | `/admin/reviews/{id}` |