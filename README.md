<div align="center">

<img src="https://img.shields.io/badge/NEURAHIRE-AI%20Resume%20Analyser-7c6ff7?style=for-the-badge&logo=google&logoColor=white" alt="NEURAHIRE" />

<br /><br />

<p>
  <img src="https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Google%20Gemini-8E75B2?style=flat&logo=googlegemini&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" />
</p>

<h3>AI-powered resume analysis tool that scores your resume against any job description using Google Gemini 2.5 Flash.</h3>

</div>

---

## ✨ Features

- 🤖 **Gemini AI Analysis** — Powered by Google Gemini 2.5 Flash for intelligent, contextual resume parsing
- 🎯 **ATS Score** — 0–100 compatibility score showing how well your resume matches the job description
- 🔑 **Keyword Gap Analysis** — Highlights matched keywords (green) and missing keywords (red) side by side
- 💡 **3 Actionable Suggestions** — Tailored improvement tips to boost your score for each specific role
- 🔐 **Authentication** — Secure JWT-based user registration and login
- 📄 **PDF Parsing** — Extracts text from real-world PDF resumes using `pdf-parse`
- 🎨 **Professional UI** — Light + dark hybrid design, smooth Framer Motion animations, fully responsive
- 🔒 **Privacy First** — Resumes are processed in memory only, never stored

---

## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, Framer Motion, React Router |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB + Mongoose |
| **AI Engine** | Google Gemini 2.5 Flash (`@google/genai`) |
| **Auth** | JWT (JSON Web Tokens) + bcryptjs |
| **PDF Parsing** | pdf-parse v2 |
| **Styling** | Vanilla CSS (custom design system) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 20.16.0`
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- Google Gemini API Key — [Get one free here](https://aistudio.google.com/app/apikey)

### 1. Clone the repository

```bash
git clone https://github.com/kaveyan18/NEURAHIRE-.git
cd NEURAHIRE-
```

### 2. Install server dependencies

```bash
npm install
```

### 3. Install client dependencies

```bash
cd client
npm install
cd ..
```

### 4. Configure environment variables

Create a `.env` file inside the `server/` directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
```

> 💡 **Get your free Gemini API key** at [aistudio.google.com](https://aistudio.google.com/app/apikey)

### 5. Run the development servers

**In one terminal — start the backend:**
```bash
npm run dev
```
> Runs on `http://localhost:3001`

**In another terminal — start the frontend:**
```bash
cd client
npm run dev
```
> Runs on `http://localhost:5173`

---

## 📁 Project Structure

```
NEURAHIRE-/
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── components/         # Navbar, ScoreRing, UploadZone, etc.
│       ├── context/            # AuthContext (JWT state)
│       ├── layouts/            # DashboardLayout
│       └── pages/              # Dashboard, ResultPage, Login, Signup
│
├── server/                     # Express backend
│   ├── config/                 # OpenAI / Gemini config
│   ├── controllers/            # analyzeResumeController
│   ├── middleware/             # JWT auth middleware
│   ├── models/                 # User model (Mongoose)
│   ├── routes/                 # /api/analyse, /api/auth
│   └── services/               # ai.service.js, pdf.service.js
│
└── package.json                # Root scripts
```



## 🎨 UI Design

The application uses a **professional light + dark hybrid** design system:

- **Navbar / Shell** — Always dark (`#0c0b17`) for strong brand presence
- **Content Area** — Light surface (`#f5f4ff` lavender tint) with white cards
- **Accent** — Purple `#7c6ff7` throughout buttons, badges, and highlights
- **Status colours** — Semantic green (matched), red (missing), amber (fair match)
- **Typography** — `Inter` (body) + `Syne` (display headings)

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/kaveyan18">kaveyan</a></p>
</div>
