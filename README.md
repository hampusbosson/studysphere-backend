⚠️ **Work In Progress:** This application is an early preview and not yet complete; it currently showcases core functionality—primarily summarizing PDFs via links.

# StudySphere

**StudySphere** is a full-stack web application helping students organize and access their course materials—PDFs, AI‑generated summaries, and quizzes—in one place. The project is split into two repositories: one for the frontend (React) and one for the backend (Node.js/Express).

---

## Repository Structure

- **[studysphere-backend](https://github.com/hampusbosson/studysphere-backend)**  
  Implements the REST API, database models, and AI summarization logic.

- **[studysphere-frontend](https://github.com/hampusbosson/studysphere-app-frontend)**  
  Provides the React UI, authentication flows, PDF viewing, and summary display.

---

## Quick Start

You’ll need two terminals (or tabs) to run both services concurrently.

### 1. Backend Setup

```bash
# 1. Clone the backend repo
git clone https://github.com/hampusbosson/studysphere-backend.git
cd studysphere-backend

# 2. Install dependencies
npm install

# 3. Copy & configure environment variables
cp .env.example .env
# • Set DATABASE_URL to your Postgres connection string
# • Set OPENAI_KEY to your OpenAI API key

# 4. Run database migrations & start server\ npx prisma migrate dev --name init\ npm run dev
```

The backend will run on **http://localhost:3000** by default.

### 2. Frontend Setup

```bash
# 1. Clone the frontend repo
git clone https://github.com/hampusbosson/studysphere-app-frontend.git
cd studysphere-frontend

# 2. Install dependencies
npm install

# 3. Copy & configure environment variables
cp .env.example .env
# • Set VITE_API_URL=http://localhost:3000/api

# 4. Start the development server
npm run dev
```

The frontend will run on **http://localhost:5173** by default and proxy all API calls to the backend.

---

## Features

- **User Authentication**: Sign up, login, email verification, password resets, and secure sessions.
- **Course & Lecture Management**: Create, rename, and delete courses; add lectures via PDF URLs.
- **PDF Viewer**: Inline PDF rendering with CORS proxy to handle external URLs.
- **AI Summarization**: Generate concise summaries of long PDFs.
- **Rich Text Editor**: Display and edit summaries with Tiptap, including headings, lists, and highlighting.
- **Global State Management**: React Contexts store courses, lectures, and summary flags to minimize API calls.
- **Dark-Themed UI**: Tailwind CSS powers a modern, responsive, dark interface.

---

## Development Tips

- Use **React Query** on the frontend to cache and refetch data automatically.
- Inspect API endpoints with tools like **Postman** or **Insomnia**.
- For AI usage, monitor token usage in your OpenAI dashboard.
- Update Prisma models and generate migrations with `npx prisma migrate dev`.

---

## Roadmap

1. **File Uploads**: Let users upload PDFs directly instead of linking URLs.
2. **Quiz Module**: Create and take interactive quizzes per lecture.
3. **Collaborative Notes**: Real‑time comments and highlights on lecture content.
4. **Calendar Scheduler**: Plan study sessions through an interactive calendar module.
6. **Offline Support**: Cache lectures and summaries for offline viewing.
7. **Custom Theming**: Allow users to switch between light/dark and personalize colors.




