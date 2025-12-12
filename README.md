# BOARDIA - MERN STACK KANBAN PLATFORM
This is a comprehensive project management and task tracking platform built using the MERN stack (MongoDB, Express, React, Node.js). BOARDIA provides a collaborative Kanban interface, complete with secure authentication and real-time task management features.

## Key Features

* **Secure Authentication:** User registration and login managed via JSON Web Tokens (JWT).
* **Full Kanban Functionality:** Intuitive Drag-and-Drop (DND) implementation using `@hello-pangea/dnd` for fluid task status transitions.
* **Task Management (CRUD):** Complete Create, Read, Update, and Delete operations for tasks, managed via detailed modals.
* **Team Collaboration:**
    * Project owners can search for and invite members via email/name.
    * Visual representation of all team members on the Kanban Board header.
* **Enhanced User Experience (UX):**
    * Persistent Sidebar navigation featuring a "Recently Accessed Boards" list for quick access.
    * Modern Dark Mode theme implementation across the application interface.
* **Robust Data Model:** Efficient data relationships established between Users, Projects, Tasks, and Columns.

## Technology Stack

### Backend & Database
* **Node.js & Express:** Core server runtime and framework.
* **MongoDB & Mongoose:** NoSQL database and Object Data Modeling (ODM).
* **JWT & bcrypt:** Used for secure authentication and password hashing.
* **express-async-handler:** Streamlines error handling for asynchronous routes.

### Frontend
* **React (Vite):** Primary UI library.
* **Tailwind CSS:** Utility-first CSS framework for efficient styling.
* **@hello-pangea/dnd:** Implements the core Drag-and-Drop mechanics.
* **Axios:** Client-side HTTP library for API communication.
* **React Router DOM:** Manages application routing and navigation.

## Setup and Local Development

### Prerequisites
Please ensure you have the following installed:
* [Node.js](https://nodejs.org/en/) (Latest LTS recommended)
* [MongoDB Atlas/Local](https://www.mongodb.com/)

### 1. Cloning and Installation
```bash
# Clone the repository
git clone [https://github.com/USERNAME_ANDA/NAMA_REPO_ANDA.git](https://github.com/USERNAME_ANDA/NAMA_REPO_ANDA.git)
cd NAMA_REPO_ANDA

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install

#2. Environment Configuration (.env)
Create a file named .env inside the backend folder and configure your connection strings:
# MongoDB Atlas Connection String
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT Secret for authentication tokens
JWT_SECRET=your_strong_secret_key_here

# 3. Database Seeding (Optional)
To populate the database with an admin user and 10 dummy projects (Login credentials: admin@example.com / 123456):
cd backend
npm run data:import

#4. Running the Application
Run both the Backend and Frontend concurrently from their respective folders:
# Terminal 1 (from /backend folder)
npm run server

# Terminal 2 (from /frontend folder)
npm run dev

🤝 Contribution
Contributions are welcome! If you identify any bugs or have suggestions for improvements, please open an Issue or submit a Pull Request.

Developed by Tubagus Raka