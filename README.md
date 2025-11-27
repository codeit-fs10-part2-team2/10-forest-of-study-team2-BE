# Forest of Study - Backend API

백엔드 API 서버입니다.

## 기술 스택

- Node.js
- Express.js
- Prisma ORM
- MySQL
- Swagger (API 문서화)

## 시작하기

### 1. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 입력하세요:

### 2. 의존성 설치

```bash
npm install
```

### 3. Prisma 클라이언트 생성

```bash
npm run prisma:generate
```

### 4. 데이터베이스 마이그레이션

```bash
npm run prisma:migrate
```

또는 스키마를 데이터베이스에 직접 푸시:

```bash
npm run prisma:push
```

### 5. 서버 실행

개발 모드 (nodemon):

```bash
npm run dev
```

프로덕션 모드:

```bash
npm start
```

## API 엔드포인트

### Study (공부방)

- `GET /api/studies` - 모든 공부방 조회
- `GET /api/studies/:id` - 공부방 상세 조회
- `POST /api/studies` - 공부방 생성
- `PUT /api/studies/:id` - 공부방 수정
- `DELETE /api/studies/:id` - 공부방 삭제

### Point (포인트)

- `GET /api/points/study/:studyId` - 특정 공부방의 포인트 조회
- `POST /api/points/study/:studyId` - 포인트 생성
- `DELETE /api/points/study/:studyId/:pointId` - 포인트 삭제

### Habit (습관)

- `GET /api/habits/study/:studyId` - 특정 공부방의 습관 조회
- `POST /api/habits/study/:studyId` - 습관 생성
- `PUT /api/habits/study/:studyId` - 습관 수정
- `DELETE /api/habits/study/:studyId/:habitId` - 습관 삭제

### Emoji (이모지)

- `GET /api/emojis/study/:studyId` - 특정 공부방의 이모지 조회
- `POST /api/emojis` - 이모지 생성
- `DELETE /api/emojis/:id` - 이모지 삭제

## API 문서 (Swagger)

서버 실행 후 다음 URL에서 API 문서를 확인할 수 있습니다:

- 개발 환경: `http://localhost:3000/api-docs`
- 프로덕션 환경: `${API_URL}/api-docs`

## CORS 설정

프론트엔드 URL이 기본적으로 허용됩니다:
- 로컬 개발 환경 (localhost:3000, 5173 등)
- Vercel 배포 URL: `https://forestofstudy-ew74jenyo-taetaehoos-projects.vercel.app`
- Netlify 배포 URL: `https://foreststudy.netlify.app`

추가 프론트엔드 URL을 허용하려면 `.env` 파일의 `CORS_ORIGIN`에 쉼표로 구분하여 추가하세요:

```env
CORS_ORIGIN=https://example.com,https://another-domain.com
```

## MIME 타입 설정

JavaScript 파일이 올바른 MIME 타입 (`text/javascript`)으로 서빙되도록 설정되어 있습니다. `.js` 및 `.mjs` 파일이 `application/octet-stream` 대신 `text/javascript`로 서빙됩니다.

## Prisma 스튜디오

데이터베이스 데이터를 시각적으로 확인할 수 있습니다:

```bash
npm run prisma:studio
```
