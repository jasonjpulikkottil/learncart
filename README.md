# LearnCart - Student Marketplace & Swap Platform

A modern, full-stack student marketplace built with Next.js, React, and MongoDB. Buy, sell, and swap textbooks, electronics, furniture, and more within your campus community.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwind-css)

## Features

- **User Authentication** - Secure login/signup with NextAuth.js and email verification
- **Listing Management** - Create, edit, and delete item listings with image uploads
- **Advanced Search & Filters** - Filter by category, condition, price range, and swap availability
- **Location-Based Search** - Find listings nearby using geolocation
- **Contact Options** - Email sellers or connect via WhatsApp
- **Admin Dashboard** - Manage users, listings, and reports
- **API Documentation** - Interactive Swagger/OpenAPI docs at `/api-docs`
- **Responsive Design** - Mobile-first UI with Tailwind CSS

## Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS, Lucide Icons
- **Backend:** Next.js API Routes, NextAuth.js
- **Database:** MongoDB with Mongoose ODM
- **Storage:** Vercel Blob for image uploads
- **Email:** Resend for transactional emails
- **Deployment:** Vercel

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
   - MongoDB Atlas connection
   - Create database: `learncart`
   - NextAuth secret
   - Vercel Blob token
   - Resend API key (optional)
   - Admin credentials
4. Example MongoDB URI:
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/learncart?retryWrites=true&w=majority

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)


## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas with Mongoose
- **Image Storage**: Vercel Blob
- **Icons**: Lucide React
- **Font**: Inter (Google Fonts)
- **Deployment**: Vercel


## License

This project is open source and available for educational purposes.

## Contributing

Contributions, issues, and feature requests are welcome!

**Built with ❤️ for students by Jason J Pulikkottil**
