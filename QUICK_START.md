# 🚀 Aquagreen Hydroseed Landing - Quick Start Guide

## ✅ Current Status
- ✅ All three servers running and operational
- ✅ MAX Messenger integration fully configured
- ✅ Database operational with form submission capability
- ✅ 4 test leads successfully saved

## 🌐 Access Points

### User Interface
- **Main Site:** http://localhost:5173
  - Full landing page with hydroseeding services
  - Contact form that sends to MAX chat
  - Video demos and image gallery
  - Responsive design ready for mobile

### Admin Panel
- **Admin Dashboard:** http://localhost:5174
  - Dashboard skeleton ready for management features
  - Can be customized for content management

### Backend API
- **API Endpoint:** http://localhost:3001/api
- **Leads Endpoint:** http://localhost:3001/api/leads

---

## 📋 Form to MAX Integration

**How it works:**
1. User fills form on http://localhost:5173
2. Data POSTs to `http://localhost:3001/api/leads`
3. Backend saves to `/backend/data/leads.json`
4. Notification sent to MAX.ru chat (ID: 8755559)

**Sample notification in MAX chat:**
```
🔔 Новая заявка с сайта Газон АкваГрин!

👤 Имя: [user name from form]
📞 Телефон: [user phone from form]
🕐 [timestamp]
```

---

## 🛠️ Running the Servers

### Terminal 1: Backend
```bash
cd /Users/artemrogacev/Downloads/gazon59.ru/backend
npm run dev
```
Runs on port 3001 with nodemon (auto-reload on changes)

### Terminal 2: Client
```bash
cd /Users/artemrogacev/Downloads/gazon59.ru/fullstack/client
npm run dev
```
Runs on port 5173 (or next available port)

### Terminal 3: Admin
```bash
cd /Users/artemrogacev/Downloads/gazon59.ru/fullstack/admin
npm run dev
```
Runs on port 5174 (or next available port)

---

## 📊 Database

### Location
- `/Users/artemrogacev/Downloads/gazon59.ru/backend/data/leads.json`

### Structure
```json
{
  "leads": [
    {
      "id": 1776069433279,
      "name": "Test",
      "phone": "+7-999-123-45-67",
      "message": null,
      "status": "new",
      "createdAt": "2026-04-13T08:37:13.279Z"
    }
  ]
}
```

---

## 🔐 Configuration Files

### Backend Environment (`.env`)
```
PORT=3001
NODE_ENV=development
JWT_SECRET=aquagreen-secret-key-2024-change-in-production
MAX_MESSENGER_TOKEN=f9LHodD0cOJcVyQlLQlQ7U_bLNrgACgdrTmznRt54te6uzKK-ZwrCHfqEZCq-lp5L6GlGvq3cR26Kr4PmPRs
MAX_MESSENGER_CHAT_IDS=8755559
```

### Frontend Environment
```
VITE_API_BASE_URL=http://localhost:3001
```

---

## 🎯 Features Available

### User-Facing
- ✅ Complete hydroseeding landing page
- ✅ Contact form with validation
- ✅ Video demonstrations
- ✅ Image gallery of lawn samples
- ✅ Benefits section with animations
- ✅ Lawn type selector
- ✅ Customer reviews section
- ✅ Responsive mobile design

### Backend Services
- ✅ Form submission API
- ✅ JSON database persistence
- ✅ MAX Messenger notifications
- ✅ CORS enabled for frontend
- ✅ Rate limiting configured
- ✅ JWT authentication ready
- ✅ File upload support

---

## 📦 Dependencies Installed

- Backend: 134 npm packages (Express, Helmet, CORS, JWT, etc.)
- Client: 246 npm packages (React 19, Vite, Radix UI, Tailwind CSS)
- Admin: 248 npm packages (same as client)

---

## 🧪 Test the Integration

### Manual Test
1. Go to http://localhost:5173
2. Scroll to contact form
3. Enter test data:
   - Name: "Test User"
   - Phone: "+7-999-123-45-67"
4. Click submit
5. Check results:
   - Browser shows success message
   - `/backend/data/leads.json` updated with new entry
   - MAX.ru chat 8755559 receives notification

---

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill all node processes
killall -9 node
# Then restart servers
```

### Module Not Found
```bash
# Reinstall dependencies in affected directory
npm install
```

### Backend Not Responding
```bash
# Check if server is running
curl http://localhost:3001/api

# Check logs in backend terminal
# (Should show "Server running on port 3001")
```

---

## 📝 File Locations

```
/Users/artemrogacev/Downloads/gazon59.ru/
├── backend/
│   ├── server.js (main API)
│   ├── .env (configuration)
│   ├── data/
│   │   └── leads.json (form submissions)
│   └── package.json
│
├── fullstack/
│   ├── client/
│   │   ├── src/App.tsx (landing page)
│   │   ├── .env
│   │   └── package.json
│   │
│   └── admin/
│       ├── src/App.tsx (admin UI)
│       ├── .env
│       └── package.json
│
├── app/ (original template)
├── INTEGRATION_STATUS.md (this report)
└── aquagreen-quiz.html
```

---

## 💾 Deployment Notes

Before going to production:
1. Change JWT_SECRET to a secure random string
2. Update NODE_ENV to "production"
3. Configure proper HTTPS
4. Use environment variables from secure vault
5. Set up automated backups for leads.json
6. Configure CI/CD pipeline
7. Add proper logging system
8. Implement data validation middleware

---

**Last Updated:** April 13, 2026  
**System Status:** ✅ FULLY OPERATIONAL AND TESTED
