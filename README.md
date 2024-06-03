# Event Management API

This project is an Event Management API built using Node.js, Express, and MongoDB. It allows users to register, login, create events, and manage participants. The API supports CRUD operations for events.

## Prerequisites

- Node.js
- MongoDB
- Postman (for testing the API endpoints)

## Installation

1. Clone the repository:
    ```bash
  git clone git@github.com:itsgolyaa/Event-Management.git
```

2. Install dependencies:
    ```bash
    npm install
    express
    bcrypt
    mongoose
    ```

3. Create a `.env` file in the root directory and add your secret key:
    ```plaintext
    MYSECRET=your_secret_key
    ```
The server will be running on `http://localhost:3000`.

## API Endpoints

### User Registration

**POST** `/bookMyEvent/register`

**Body:**
```json
{
  "fullName": "FirstName LastName",
  "email": "firstName.LastName@example.com",
  "password": "password123",
  "role": "user"
}

**POST** `/bookMyEvent/login
**Body:**
```json
{
  "email": "firstName.LastName@example.com",
  "password": "password123"
}

**POST** `/bookMyEvent/events
**Body:**
```json
{
  "jwt" : "User token after login",
  "event" : "Name of the even",
  "eventDate" : "date of the event mm/dd/yyyy",
  "Participants" : []
}
`
