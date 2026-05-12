# Fullstack MERN Todo Application

A modern, responsive task management application built from the ground up using the MERN stack. This project showcases REST API design, state management in React, and containerized deployment strategies.

## Key Features

* **RESTful API**: Node.js and Express backend handling CRUD operations for tasks securely.
* **Dynamic Frontend**: React-based user interface with real-time state updates and clean component architecture.
* **Persistent Storage**: MongoDB integration using Mongoose schemas for flexible and rapid data retrieval.
* **Containerization**: Fully Dockerized environments using docker-compose to instantly spin up the database, backend, and frontend concurrently.

## Technology Stack

* **Frontend**: React.js
* **Backend**: Node.js, Express
* **Database**: MongoDB
* **Deployment**: Docker, Docker Compose

## Execution

Ensure Docker is installed and running on your system.

1. Navigate to the project root.
2. Build and start the containers:
   `
   docker-compose up --build
   `
3. The frontend will be accessible on your local port, cleanly proxying requests to the backend API!

---
*Developed by: Haider Ali*
