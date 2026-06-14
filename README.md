# Eventify - Full-Stack Event Booking Platform

Eventify is a full-stack MERN application that allows users to seamlessly browse, register, and book events. It features an administrative dashboard for event organizers to create and manage free and paid events. All bookings can be managed manually by an admin to handle payments directly.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [License](#license)

## Features
- **User Authentication**: Secure login & registration with JWT and bcrypt.
- **2FA OTP Verification**: 
  - Mandatory Email OTP to activate your account upon Registration (or delayed login attempts).
  - Mandatory Email OTP to finalize and secure event ticket booking.
- **Role-Based Access**: 
  - **Admin**: Create, edit, and delete events. Confirm and reject all incoming booking requests, mark them as 'Paid' or 'Not Paid'.
  - **User**: Browse events, submit ticket booking requests via OTP, view personal dashboard, and cancel bookings.
- **Event Management**: Create free and paid events with detailed descriptions, external image URLs, dates, categories, and seating capacity.
- **Smart Booking System**:
  - Mandatory 2FA OTP to authorize a booking request.
  - All booking requests enter a secure 'Pending' queue for Admin verification.
  - Seat availability accurately updates and validates against overbooking.
- **Admin Analytics Dashboard**: Track live data such as Pending Requests, Total Revenue, and Total Confirmed Paid Clients.
- **Email Notifications**: Professional automated email delivery using Nodemailer.
- **Responsive UI/UX**: Built entirely with React, Tailwind CSS, and fully responsive for mobile and desktop.

## Tech Stack
- **Frontend**: React, React Router, Tailwind CSS, Vite, React Icons, React Toastify
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt, Nodemailer
- **Database**: MongoDB (local or MongoDB Atlas)

## Project Structure
```
Eventify/
├── Backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── package.json
│   └── server.js
└── Frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```

## Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v24.11.1 or later)
- [MongoDB](https://www.mongodb.com/) (local or [MongoDB Atlas Free Tier](https://www.mongodb.com/cloud/atlas/register))

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/princeasodariya0/Eventify.git
cd Eventify
```

### 2. Backend Setup
```bash
cd Backend
npm install
```

### 3. Frontend Setup
```bash
cd ../Frontend
npm install
```

## Environment Variables
Create a `.env` file in the `Backend/` directory with the following variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=supersecretjwtkey_eventify
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
PORT=5000
```

> **Note**: For `EMAIL_PASS`, you need to generate an "App Password" from your Google Account settings (standard passwords won't work due to 2FA).

## Running the Application

### Backend (Terminal 1)
```bash
cd Backend
npm start
```

### Frontend (Terminal 2)
```bash
cd Frontend
npm run dev
```

## License
ISC
