<div align="center">

<img src="https://img.shields.io/badge/NEURAHIRE-AI%20Resume%20Analyser-7c6ff7?style=for-the-badge&logo=google&logoColor=white" alt="NEURAHIRE" />

<br /><br />

<p>
  <img src="https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Google%20Gemini-8E75B2?style=flat&logo=googlegemini&logoColor=white" />
  <img src="https://img.shields.io/badge/Razorpay-02042B?style=flat&logo=razorpay&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" />
</p>

<h3>Production-ready AI resume analysis SaaS with Google Gemini 2.0 Flash, Razorpay credits, and full ATS reporting.</h3>

</div>

---

## ✨ Features

- 🤖 **Gemini AI Analysis** — Powered by `gemini-flash-latest` (Gemini 2.0) with exponential backoff & retry logic for reliability
- 🎯 **ATS Score** — 0–100 compatibility score showing how well your resume matches the job description
- 🔑 **Keyword Gap Analysis** — Highlights matched keywords (green) and missing keywords (red) side by side
- 💳 **Credits System & Razorpay** — Users receive 2 free credits on signup, with Razorpay integration for seamless Pro upgrades
- 🚀 **Smart Caching** — Identical resume + JD inputs are hashed via SHA256 and served from the database to save Gemini API costs
- 🔐 **Production Security** — Hardened backend using `helmet`, strict dynamic CORS, and `express-rate-limit` (100 req / 15m)
- 📄 **PDF Parsing** — Extracts text from real-world PDF resumes using `pdf-parse`
- 🎨 **Premium UI** — Glassmorphic light/dark hybrid design, smooth Framer Motion animations, and responsive navigation

---

## 🖥️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite, Framer Motion, React Router |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB + Mongoose (Caching & Users) |
| **AI Engine** | Google Gemini 2.0 Flash (`gemini-flash-latest`) |
| **Payments** | Razorpay SDK |
| **Auth** | JWT (JSON Web Tokens) + bcryptjs |
| **Security** | Helmet, Express Rate Limit, Dynamic CORS |
| **PDF Parsing**| `pdf-parse` v2 |

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

RAZORPAY_KEY_ID=rzp_test_your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
FRONTEND_URL=http://localhost:5173
```

Create a `.env` file inside the `client/` directory (for Razorpay UI):

```env
VITE_RAZORPAY_KEY_ID=rzp_test_your_razorpay_key
VITE_API_URL=http://localhost:3001/api
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
│   ├── vercel.json             # Vercel SPA routing rules
│   ├── public/
│   │   └── _redirects          # Netlify SPA routing rules
│   └── src/
│       ├── components/         # PremiumModal, Navbar, UploadZone
│       ├── context/            # AuthContext (JWT state & credits)
│       └── pages/              # Dashboard, ResultPage, Login
│
├── server/                     # Express backend
│   ├── app.js                  # Main express config (Security, CORS, Rate Limit)
│   ├── controllers/            # analyse.controller.js, payment.controller.js
│   ├── middleware/             # JWT auth middleware
│   ├── models/                 # User.js, AnalysisCache.js
│   ├── routes/                 # /api/analyse, /api/auth, /api/payments
│   └── services/               # ai.service.js (exponential backoff)
│
└── package.json                # Root scripts (Starts Node backend)
```

---

## 🚀 Deployment (Vercel & Render)

This application is engineered for immediate deployment.

### 1. Deploying the Backend (Render / Railway)
1. Set the root build command to `npm install`
2. Set the start command to `npm start` (or `node server/index.js`)
3. Add all `server/.env` variables.
4. **Important**: Whitelist `0.0.0.0/0` in your MongoDB Atlas Network Access.

### 2. Deploying the Frontend (Vercel / Netlify)
1. Set the framework to **Vite** and root directory to `client`.
2. Add the `VITE_API_URL` (pointing to your deployed backend) and `VITE_RAZORPAY_KEY_ID`.
3. *(Optional)* Put your new frontend domain in the backend's `FRONTEND_URL` environment variable for strict CORS protection!



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
