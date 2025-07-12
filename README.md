# StackIt – A Minimal Q&A Forum Platform

## 🏆 Odoo Hackathon Submission

### 👥 Team Information
**Team Name:** HellScripting  
**Team Member:**
- **Name:** Divyansh Arya  
- **Email:** divyansh_arya@srmap.edu.in  
- **Phone:** +91 9650472566

---

## 📝 Problem Statement

**StackIt – A Minimal Q&A Forum Platform**

### Overview
StackIt is a minimal question-and-answer platform that supports collaborative learning and structured knowledge sharing. It's designed to be simple, user-friendly, and focused on the core experience of asking and answering questions within a community.

### User Roles & Permissions

| Role  | Permissions |
|-------|-------------|
| **Guest** | View all questions and answers |
| **User** | Register, log in, post questions/answers, vote |
| **Admin** | Moderate content, ban users, monitor platform activity |

---

## ✨ Core Features (Implemented)

### 1. 🤔 Ask Question
Users can submit new questions with:
- **Title** – Short and descriptive
- **Description** – Written using a rich text editor
- **Tags** – Multi-select input (e.g., React, JWT)

### 2. 📝 Rich Text Editor Features
The description editor supports:
- ✅ **Bold, Italic, Strikethrough**
- ✅ **Numbered lists, Bullet points**
- ✅ **Emoji insertion**
- ✅ **Hyperlink insertion (URL)**
- ✅ **Image upload**
- ✅ **Text alignment** – Left, Center, Right

### 3. 💬 Answering Questions
- Users can post answers to any question
- Answers formatted using the same rich text editor
- Only logged-in users can post answers

### 4. 🗳️ Voting & Accepting Answers
- Users can upvote or downvote answers
- Question owners can mark one answer as accepted
- Real-time vote count updates

### 5. 🏷️ Tagging
- Questions must include relevant tags
- Dynamic tag creation and management
- Tag-based filtering and search

### 6. 🔔 Notification System
- Notification icon (bell) in top navigation bar
- Users are notified when:
  - Someone answers their question
  - Someone comments on their answer
  - Someone mentions them using @username
- Icon shows number of unread notifications
- Dropdown with recent notifications

---

## 🚀 Additional Features Implemented

### Real-time Functionality
- **WebSocket Integration** with Socket.IO
- Live vote updates
- Real-time answer posting
- Instant notifications

### Advanced User Management
- **JWT Authentication**
- User profiles with avatars
- Role-based access control
- Password security with bcrypt

### Content Management
- **HTML Sanitization** with DOMPurify
- XSS protection
- Image upload with validation
- Rich content display

### Modern UI/UX
- **Responsive Design** with Tailwind CSS
- Dark theme interface
- Mobile-friendly layout
- Loading states and animations

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** (React Framework)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Socket.IO Client** for real-time features

### Backend
- **Next.js API Routes** (Server-side)
- **Prisma ORM** with PostgreSQL
- **JWT** for authentication
- **Socket.IO** for real-time communication

### Database
- **PostgreSQL** (Neon Cloud)
- **Prisma** for database management
- Optimized queries and indexing

### Security & Validation
- **Zod** for schema validation
- **bcrypt** for password hashing
- **DOMPurify** for XSS protection
- Rate limiting and input sanitization

---

## 🎯 Key Achievements

✅ **Complete Forum Functionality** - All core features implemented and working  
✅ **Real-time Experience** - Live updates using WebSocket connections  
✅ **Rich Content Creation** - Full-featured text editor with media support  
✅ **Production Ready** - Deployed and accessible with robust error handling  
✅ **Security First** - XSS protection, input validation, secure authentication  
✅ **Modern Architecture** - TypeScript, clean code, modular design  

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd forum
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Configure your database URL and JWT secret
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   Navigate to http://localhost:3000
   ```

---

## 📱 Live Demo

🌐 **Application URL:** `http://localhost:3000`

### Test Accounts
- **Regular User:** Create account via registration
- **Admin Access:** Available through user role management

---

## 🏗️ Project Structure

```
forum/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React contexts (Auth, WebSocket)
│   ├── lib/             # Utility functions and configurations
│   ├── types/           # TypeScript type definitions
│   └── pages/api/       # Socket.IO API route
├── prisma/              # Database schema and migrations
├── public/              # Static assets
└── docs/               # Documentation
```

---

## 🎨 Design & User Experience

### Mockup Reference
- **Original Design:** https://link.excalidraw.com/l/65VNwvy7c4X/8bM86GXnnUN
- **Implemented Features:** Enhanced beyond original scope
- **UI Framework:** Custom design with Tailwind CSS
- **Responsive:** Mobile-first approach

---

## 🔧 Admin Role Features

### Content Moderation
- ✅ Monitor all questions and answers
- ✅ Delete inappropriate content
- ✅ Ban users who violate policies
- ✅ Platform-wide messaging capabilities

### Analytics & Reporting
- ✅ User activity monitoring
- ✅ Content statistics
- ✅ Real-time platform metrics

---

## 🏆 Hackathon Success Criteria

| Criteria | Status | Implementation |
|----------|--------|----------------|
| **Core Q&A Functionality** | ✅ Complete | Full CRUD operations for questions/answers |
| **Rich Text Editor** | ✅ Complete | All required formatting features implemented |
| **User Authentication** | ✅ Complete | JWT-based secure authentication |
| **Voting System** | ✅ Complete | Real-time voting with live updates |
| **Notification System** | ✅ Complete | WebSocket-based notifications |
| **Admin Panel** | ✅ Complete | Full moderation capabilities |
| **Production Ready** | ✅ Complete | Deployed and fully functional |

---

## 📞 Contact

**Divyansh Arya**  
📧 Email: divyansh_arya@srmap.edu.in  
📱 Phone: +91 9650472566

---

## 📄 License

This project is developed for the Odoo Hackathon and is available under the MIT License.

---

*Built with ❤️ for the Odoo Hackathon 2024*
