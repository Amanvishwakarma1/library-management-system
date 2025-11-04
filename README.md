# Library Management – Excel‑Aligned Dashboards (MERN)

Login-first app with **Admin** and **Student** roles, matching your Excel sections:
- Admin KPIs: Total Books, Members, Active Issues, Overdue Returns, Pending Requests
- Admin sections: Master List of Books, Movies, Members (User Management), Active Issues, Issue Requests
- Student: Browse Books, Issue Requests; KPIs: My Active Issues, My Overdues

## Run
### Server
```bash
cd server
cp .env.example .env   # put your MONGODB_URI and JWT_SECRET
npm install
npm run seed
npm run dev
```

### Client
```bash
cd client
npm install
npm run dev
```

## Demo users
- Admin: `admin@example.com` / `Admin@123`
- Student: `aman@student.com` / `Student@123`
