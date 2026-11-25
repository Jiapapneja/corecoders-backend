# PlateShare — Recipe Sharing Community

A MERN recipe community built with React 18 + Vite, Tailwind CSS, Node.js/Express, Mongoose, MongoDB Atlas and Cloudinary.

## Features
- JWT signup/login
- Recipe publishing with cover and step images
- Browser image compression + signed direct Cloudinary uploads
- Cuisine/diet/difficulty/time filters
- Weighted MongoDB text search
- Reviews with atomic average-rating updates
- Cookbooks / collections
- Follow + personalised feed
- Cursor pagination
- Shopping-list generation with serving scaling
- Lazy-loaded, optimized Cloudinary images

## Local setup

### Backend
```bash
cd server
npm install
cp .env.example .env
npm run dev
```
Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` and Cloudinary values in `.env`.

### Frontend
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
Set `VITE_API_URL=http://localhost:5000/api`.

### Seed data
```bash
cd server
npm run seed
```
Seed login: `aanya@example.com` / `Password123!`.

## Deployment
- MongoDB Atlas: create an M0 cluster, database user and network access rule; copy the driver URI.
- Cloudinary: create an account and copy cloud name, API key and API secret. Keep the secret only on Render.
- Render: create a Web Service from the `server` directory. Build command `npm install`; start command `npm start`. Add all server environment variables.
- Vercel: import the `client` directory. Add `VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api`.
- Set Render `CLIENT_URL` to the exact Vercel origin, then redeploy.

## API highlights
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/recipes?cuisine=&diet=&maxTime=&cursor=`
- `POST /api/recipes`
- `PUT /api/recipes/:id`
- `POST /api/recipes/:id/reviews`
- `DELETE /api/recipes/:id/reviews/:reviewId`
- `POST /api/recipes/:id/like`
- `POST /api/users/:id/follow`
- `GET /api/feed`
- `GET /api/uploads/signature`
- `POST /api/collections`
- `POST /api/collections/:id/recipes/:recipeId`
- `POST /api/shopping-list`

## Security notes
Never commit `.env`. The Cloudinary API secret is never sent to the browser. The browser receives only a short-lived upload signature and public upload parameters.
