# GitHost

A MERN-stack GitHub-style web app — repositories, issues, and JWT-secured ownership controls — paired with a small **version-control engine built from scratch** as a separate command-line tool.

This is two related pieces, and they are **not connected to each other yet**:

- **The web app** (React + Express + MongoDB) lets you sign up, create repositories, and track issues on them.
- **The CLI engine** (`node index.js init/add/commit/push/pull/revert`) is a standalone tool that mimics core Git commands using the local filesystem for staging/commits and AWS S3 as a remote — built to understand what Git is actually doing mechanically, not to replace it.

Creating a repository on the website stores its metadata only (name, description, visibility, owner); it does not create commits through the CLI engine.

## Features

- Email/password signup and login with JWT authentication
- Password hashing with bcrypt
- Repository CRUD (create, read, update description, delete, toggle public/private) — protected by JWT and an ownership check, so only a repository's owner can edit or delete it
- Issue tracking per repository (create, list, update, close/reopen, delete)
- A hand-built version-control CLI: `init`, `add`, `commit`, `push`, `pull`, `revert`, using local snapshotting and an S3 bucket as the remote store

## Tech stack

**Frontend:** React 19, Vite, React Router, Axios/fetch, `@primer/react` (GitHub's own component library)
**Backend:** Node.js, Express 5, Mongoose (MongoDB), JSON Web Tokens, bcryptjs
**CLI engine:** Node.js `fs`, `yargs` for command parsing, `uuid` for commit IDs, AWS SDK (S3) for push/pull

## Project structure

```
backend/
  controllers/   # route handlers (user, repo, issue) + the CLI engine (init/add/commit/push/pull/revert)
  middleware/    # authMiddleware (JWT verification), authorizeMiddleware (ownership checks)
  models/        # Mongoose schemas: User, Repository, Issue
  routes/        # Express route definitions
  config/        # AWS S3 client config
  index.js       # dual entry point — `start` boots the Express server, other commands run the CLI engine
frontend/
  src/components/  # Dashboard, Login/Signup, Profile, CreateRepo, RepoDetail
  src/AuthContext.jsx, useAuth.js  # auth state via React Context
```

## Running locally

**Backend**
```bash
cd backend
npm install
cp .env.example .env   # fill in MongoDB URI, JWT secret, and AWS values if you'll use push/pull
node index.js start
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

**Using the CLI engine** (from the `backend` folder, in a project you want to snapshot):
```bash
node index.js init
node index.js add <file>
node index.js commit "<message>"
node index.js push      # requires AWS credentials in .env
node index.js pull
node index.js revert <commitID>
```

## API overview

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/signup`, `/login` | — |
| GET | `/repo/all`, `/repo/:id`, `/repo/user/:userID` | — |
| POST | `/repo/create` | JWT |
| PUT / DELETE / PATCH | `/repo/update/:id`, `/repo/delete/:id`, `/repo/toggle/:id` | JWT + ownership |
| POST / GET | `/repo/:id/issue/create`, `/repo/:id/issue/all` | JWT (create) |
| PUT / DELETE | `/issue/update/:id`, `/issue/delete/:id` | JWT |

## Known limitations

- Issue routes check that you're logged in, but not that you own the parent repository
- The CLI engine's commit history isn't wired to the web app's repository pages
- No automated tests, CI, or deployment yet
- No rate limiting on login/signup, no refresh tokens
- The contribution heatmap on the profile page uses randomly generated placeholder data, not real activity

## License

No license specified yet.
