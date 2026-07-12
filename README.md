# BrewHouse ☕ — Full-Stack Coffee Shop (MERN)

A complete e-commerce coffee shop built with MongoDB, Express, React (Vite), and Node.js.

```
coffee-shop/
├── backend/     Node.js + Express REST API
└── frontend/    React (Vite) client
```

---

## 1. Prerequisites

- Node.js 18+ and npm
- A MongoDB Atlas account (free tier is fine) — https://www.mongodb.com/cloud/atlas
- Git (optional, for deployment)

---

## 2. Backend setup

```bash
cd coffee-shop/backend
npm install
cp .env.example .env
```

Open `.env` and fill in:

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/brewhouse?retryWrites=true&w=majority
JWT_SECRET=<any long random string>
CLIENT_URL=http://localhost:5173
```

Seed the database with sample coffee products and an admin account:

```bash
npm run seed
```

This creates an admin login: **admin@brewhouse.com / admin123** (change the password after first login).

Start the API in dev mode (auto-restarts on file changes):

```bash
npm run dev
```

The API runs at `http://localhost:5000`. Visit `http://localhost:5000/` — you should see a JSON status message.

---

## 3. Frontend setup

Open a **second terminal**:

```bash
cd coffee-shop/frontend
npm install
cp .env.example .env
```

By default `.env` points at `http://localhost:5000/api`, which matches the backend above — no changes needed for local dev.

Start the React dev server:

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 4. Try it out

1. Sign up for a new account, or log in as `admin@brewhouse.com` / `admin123`.
2. Browse the menu, filter by category, and use the search bar.
3. Open a product, customize milk/sugar/extra shot, and add it to your cart.
4. Go to Cart → Checkout, fill in a delivery address, and place the order.
5. Check **Profile** to see order history and live order status.
6. Log in as the admin and open **Admin** in the navbar to add/edit/delete coffee items and update order statuses.

---

## 5. Production build

**Frontend:**

```bash
cd coffee-shop/frontend
npm run build
```

Outputs static files to `frontend/dist/`.

**Backend:**

```bash
cd coffee-shop/backend
npm start
```

---

## 6. Deployment

### Backend → Render
1. Push `backend/` to a GitHub repo (or the whole `coffee-shop` repo, setting the root directory to `backend`).
2. On Render: New → Web Service → connect the repo.
   - Build command: `npm install`
   - Start command: `npm start`
3. Add environment variables in Render's dashboard: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` (set this to your deployed Vercel URL), `NODE_ENV=production`.

### Frontend → Vercel
1. Push `frontend/` to GitHub (or use the same repo, root directory `frontend`).
2. On Vercel: New Project → import the repo → framework preset "Vite".
3. Add environment variable `VITE_API_URL` = your Render backend URL + `/api` (e.g. `https://brewhouse-api.onrender.com/api`).
4. Deploy. `vercel.json` is already included so client-side routing (React Router) works on refresh.

### Database → MongoDB Atlas
1. Create a free cluster, add a database user, and whitelist `0.0.0.0/0` (or Render's IPs) under Network Access.
2. Copy the connection string into `MONGO_URI` on both your local `.env` and Render's environment variables.
3. Run `npm run seed` once (locally, pointed at the Atlas cluster) to populate sample products and the admin account.

### CORS
The backend's `CLIENT_URL` env var accepts a comma-separated list, so you can allow both local dev and your deployed frontend at once:
```
CLIENT_URL=http://localhost:5173,https://your-app.vercel.app
```

---

## 7. API Reference (quick overview)

| Method | Route                        | Access        | Description                          |
|--------|------------------------------|---------------|---------------------------------------|
| GET    | /api/products                | Public        | List products (`?category=&search=&badge=`) |
| GET    | /api/products/:id            | Public        | Get one product                       |
| POST   | /api/products                | Admin         | Create product                        |
| PUT    | /api/products/:id            | Admin         | Update product                        |
| DELETE | /api/products/:id            | Admin         | Delete product                        |
| POST   | /api/users/register          | Public        | Create account                        |
| POST   | /api/users/login             | Public        | Log in, get JWT                       |
| GET    | /api/users/profile           | Private       | Get own profile                       |
| PUT    | /api/users/profile           | Private       | Update own profile                    |
| GET    | /api/users                   | Admin         | List all users                        |
| GET    | /api/cart                    | Private       | Get own cart                          |
| POST   | /api/cart                    | Private       | Add item to cart                      |
| PUT    | /api/cart/:itemId            | Private       | Update item quantity                  |
| DELETE | /api/cart/:itemId            | Private       | Remove item                           |
| DELETE | /api/cart                    | Private       | Clear cart                            |
| POST   | /api/orders                  | Private       | Place order from cart                 |
| GET    | /api/orders/myorders         | Private       | Own order history                     |
| GET    | /api/orders/:id               | Private       | Get single order (owner or admin)     |
| GET    | /api/orders                  | Admin         | List all orders                       |
| PUT    | /api/orders/:id/status        | Admin         | Update order status                   |

---

## 8. Notes

- Passwords are hashed with bcrypt; the password field is never returned by the API.
- JWTs are stored in `localStorage` on the frontend and attached automatically via an Axios interceptor.
- Loyalty points are earned at a rate of 1 point per whole currency unit spent, credited when an order is placed.
- Order status flows: `Pending → Preparing → Out for Delivery → Delivered` (or `Cancelled`).
