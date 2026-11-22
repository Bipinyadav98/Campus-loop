# CampusLoop — Multi-College Academic Book Circulation & Rental Platform

A full-stack implementation of the project described in **Presentation - Multi-College Rental Platform**.

## Source-aligned product scope
- One centralized platform supporting multiple colleges
- College-wise secure ecosystem / tenant isolation
- Course + semester based book discovery
- Academic book rental and exchange
- Student-owned book reuse after semester completion
- Request and circulation tracking
- Institution/admin control
- Campus-friendly physical exchange / pickup
- Future-ready multi-college onboarding and integrations

## Stack from the presentation
- **Frontend:** React.js
- **Backend:** Node.js + Express.js
- **Database:** MongoDB via Mongoose
- **API:** RESTful APIs

Additional implementation utilities: React Router, Axios, JWT, bcryptjs, Lucide icons.

## Run locally
### 1. Backend
```bash
cd server
npm install
cp .env.example .env
# Put your MongoDB URI in .env
npm run dev
```

### 2. Frontend
```bash
cd client
npm install
npm run dev
```

The frontend defaults to `http://localhost:5173` and the API to `http://localhost:4000/api`.

### Demo mode
The UI includes realistic local demo data so the experience can be explored immediately. To persist data, connect MongoDB and use the REST API.
