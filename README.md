# Text to Course Generator

Full-stack AI-powered learning app that generates structured courses from a topic, saves them per user, enriches lessons on demand, and supports code blocks, MCQs, video recommendations, and PDF export.

## Features

- Auth0 login/logout for users
- User-specific course generation and course list
- Ownership-protected course and lesson access
- Lesson enrichment on demand
- Lesson content blocks for headings, paragraphs, code, MCQs, and video
- YouTube video lookup for lesson video blocks
- Lesson PDF export

## Tech Stack

- Frontend: React, Vite, React Router, Auth0
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: Auth0
- External APIs: YouTube Data API

## Project Structure

- [`client`](/Users/narayanprasadsharma/Desktop/Dev/text-to-course/client)
- [`server`](/Users/narayanprasadsharma/Desktop/Dev/text-to-course/server)

## Run Locally

### 1. Install dependencies

In [`client`](/Users/narayanprasadsharma/Desktop/Dev/text-to-course/client):

```bash
npm install
```

In [`server`](/Users/narayanprasadsharma/Desktop/Dev/text-to-course/server):

```bash
npm install
```

### 2. Configure environment variables

Create [`client/.env`](/Users/narayanprasadsharma/Desktop/Dev/text-to-course/client/.env):

```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=https://text-to-course-api
```

Create [`server/.env`](/Users/narayanprasadsharma/Desktop/Dev/text-to-course/server/.env):

```env
PORT=5001
MONGO_URL=your-mongodb-connection-string
YOUTUBE_API_KEY=your-youtube-api-key
AUTH0_ISSUER=https://your-auth0-domain/
AUTH0_AUDIENCE=https://text-to-course-api
```

### 3. Start the backend

In [`server`](/Users/narayanprasadsharma/Desktop/Dev/text-to-course/server):

```bash
npm run dev
```

### 4. Start the frontend

In [`client`](/Users/narayanprasadsharma/Desktop/Dev/text-to-course/client):

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` and backend runs on `http://localhost:5001`.

## Auth0 Notes

- Create a Single Page Application for the frontend
- Create an Auth0 API with identifier `https://text-to-course-api`
- Add `http://localhost:5173` as:
  - Allowed Callback URL
  - Allowed Logout URL
  - Allowed Web Origin

## Current MVP Flow

1. Log in with Auth0
2. Generate a course from a topic
3. View only your saved courses
4. Open a course and its lessons
5. Auto-enrich lessons on demand
6. Watch related video content
7. Download lesson PDF
