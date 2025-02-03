# GISWebApp

## About the Project

This application provides users with an intuitive platform to manage and interact with geospatial data through a user-friendly interface. The project consists of two main parts:

1. **Frontend**: A responsive web application built with React.js and OpenLayers that allows users to visualize and interact with data layers on a map.
2. **Backend**: A Django-based REST API that handles geospatial data.

### Key Features:
- Interactive map interface for managing geographical layers from database, geojson upload and handle WMS/WMTS layers.
- REST API for seamless interaction between the frontend and data layers.
- Scalable backend infrastructure using Django and PostGIS for geospatial data.
- Simple setup and deployment process for development or production use.

This project aims to simplify geospatial data management for both developers and end-users.


# Project Documentation

## Overview 
This project consists of two main components: **Backend** and **Frontend**. Below is a detailed description of how to set up, develop, and deploy each part of the project.

---

## **Backend Documentation**

### **Overview**
The backend is built using [**Django**]

---

### **Setup Instructions**
1. Install Python 3.11.1 or higher.

2. Navigate to the backend directory:
   ```bash
   cd WebApp
   ```

3. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv\Scripts\activate
   ```

4. Install project dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Configure the database in `settings.py` (e.g., PostgreSQL):
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'database_name',
           'USER': 'database_user',
           'PASSWORD': 'database_password',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }

6. (Optional) Query your data from database in `models.py`, `views.py` and setup endpoints in `urls.py`


7. Start the development server:
   ```bash
   python manage.py runserver
   ```
   Access the backend at `http://localhost:8000`.

---

### **Technology Stack**
- **Django**
- **Django REST Framework (DRF)**: For building RESTful APIs
- **PostgreSQL/PostGis**: Database system

---

### **API Endpoints**
The backend exposes the following endpoints via a REST API for the frontend:

- **Layers Management**:
  - `GET /api/layers/`: Fetch all available map layers.

---

## **Frontend Documentation**

### **Overview**
- The frontend is built using **React.js** and bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
- It is responsible for the user interface and consuming the REST API provided by the backend.

---

### **Setup Instructions**
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
3. Add your database data to the respective file:

   - File: **`layers.js`**
   - Note: This step is **optional**.


4. Run the development server:
   ```bash
   npm start
   ```

5. Open your browser at [http://localhost:3000](http://localhost:3000) to view the application.

---

### **Available Scripts**
You can use the following scripts in the project directory:

- **`npm start`**: Starts the development server (`http://localhost:3000`).
- **`npm test`**: Launches the test runner in interactive watch mode.
- **`npm run build`**: Builds the app for production into the `build` folder.
- **`npm run eject`**: Ejects the CRA configuration for advanced customizations.

---
### **Technology Stack**
- **React.js**
- **Axios**: For HTTP requests
- **React Router**: For routing (if implemented)

---

## **Deployment**

### **Frontend Deployment**
1. Build the frontend for production:
   ```bash
   npm run build
   ```

2. Deploy the contents of the `build/` directory using any static hosting service (e.g., AWS S3, Netlify, Vercel).

---

## **License**
This project is licensed under the MIT License - see the `LICENSE.md` file for details.