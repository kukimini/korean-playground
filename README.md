# KOREAN PLAYGROUND

미얀마 사람을 위한 한국어 독학 웹사이트예요. 강의 영상과 무료 PDF(강의, 실습)를 단계별로 보여 줘요.
화면은 미얀마어가 기본이고, 위쪽 버튼으로 한국어/영어로 바꿀 수 있어요.

빌드 과정이 없는 정적 사이트라서 GitHub Pages, Cloudflare Pages, Vercel 어디에나 그대로 올릴 수 있어요.

## 고치는 파일은 세 개뿐

| 파일 | 내용 |
| --- | --- |
| `data/lessons.json` | 코스(로드맵)와 강의 목록 |
| `data/site.json` | 페이스북/유튜브/틱톡 주소, 대기자 신청 폼 주소, 광고 켜기 |
| `data/i18n.json` | 버튼과 안내 문구 (미얀마어/한국어/영어) |

## 새 강의 추가하기

1. PDF를 `files/<강의 id>/` 폴더에 올려요. 예: `files/hangul-06/lecture.pdf`, `files/hangul-06/practice.pdf`
2. `data/lessons.json`의 `lessons` 맨 끝에 아래 묶음을 복사해 붙이고 내용을 바꿔요.

```json
{
  "id": "hangul-06",
  "course": "hangul",
  "number": 6,
  "glyph": "안",
  "published": true,
  "youtube": "https://www.youtube.com/watch?v=...",
  "title": { "my": "미얀마어 제목", "ko": "한국어 제목", "en": "English title" },
  "summary": { "my": "안녕하세요", "ko": "안녕하세요", "en": "안녕하세요" },
  "files": [
    { "type": "lecture", "path": "files/hangul-06/lecture.pdf" },
    { "type": "practice", "path": "files/hangul-06/practice.pdf" }
  ]
}
```

- `glyph`는 카드에 크게 보이는 글자 하나예요.
- `path`가 비어 있으면 "준비 중"으로 보여요.
- `youtube`에는 유튜브 주소를 그대로 붙여 넣으면 돼요(공유 링크 youtu.be도 OK). 사이트에서 봐도 유튜브 조회수로 올라가요.
- `youtube`가 비어 있으면 "영상 곧 공개"로 보여요.
- `published`를 `false`로 하면 목록에서 숨겨요.
- 앞 묶음 끝에 쉼표(`,`)를 꼭 붙여요.

코스를 열 때는 `courses`에서 그 코스의 `status`를 `"soon"`에서 `"open"`으로 바꿔요.
코스 색(`color`)은 디자인 규칙을 따라요: 한글 orange, 회화 yellow, TOPIK blue, EPS green, 복습 violet.

## 내 컴퓨터에서 미리 보기

```
python3 -m http.server 8000
```

그다음 브라우저에서 http://localhost:8000 을 열어요. (파일을 더블클릭해서 열면 데이터가 안 읽혀요.)

© 2026 KOREAN PLAYGROUND
