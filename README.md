# CourseSpace - Premium SaaS Course Selling Platform

CourseSpace is a modern, enterprise-grade Course Selling Application built with the MERN stack. It features a beautiful, dark-mode focused UI, a custom YouTube video player, and a highly secure backend.

## ✨ Features

### Frontend (React & Vite)
- **Stunning Dark-Mode UI**: Built with pure CSS, featuring glassmorphism, responsive grids, and subtle micro-animations.
- **Admin Dashboard**: Full CRUD (Create, Read, Update, Delete) capabilities with a sleek Modal interface for managing courses.
- **Course Player**: Robust video player utilizing native YouTube embed API to flawlessly handle course lessons.
- **Interactive Toasts**: Beautiful success and error notifications using `react-hot-toast`.

### Backend (Node.js & Express)
- **Enterprise Security**: Hardened with `helmet` for HTTP security headers and `express-rate-limit` to prevent brute force/DDoS attacks.
- **Robust Validation**: `zod` is used strictly across all API endpoints to validate incoming payloads and prevent NoSQL injections.
- **Professional Logging**: Uses `winston` and `morgan` to log all HTTP requests and system errors to physical files, ensuring production observability.
- **Cloud Storage**: Integrated with `Cloudinary` and `multer` for secure, cloud-based image hosting for course thumbnails.
- **Authentication**: JWT-based authentication with properly segregated Admin and User middlewares.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- Cloudinary Account (for image uploads)

### Setup
1. Clone the repository.
2. Install dependencies for both frontend and backend:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
3. Set up your `.env` variables in the `backend` folder:
   ```env
   MONGO_URL=your_mongodb_url
   JWT_USER_PASSWORD=your_user_secret
   JWT_ADMIN_PASSWORD=your_admin_secret
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   ```
4. Start the application:
   ```bash
   # Run frontend
   npm run dev
   
   # Run backend
   node index.js
   ```

## 🛠 Tech Stack
- **Database**: MongoDB & Mongoose
- **Backend**: Express, Zod, JWT, Winston, Helmet
- **Frontend**: React, Vite, Lucide-React
- **Media**: Cloudinary API
