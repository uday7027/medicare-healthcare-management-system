# 🏥 Medicare
## Smart Healthcare Information and Teleconsultation System

Medicare is a full-stack healthcare web application designed to provide patients, doctors, and hospital staff with a centralized platform for healthcare management.

The system supports patient registration, appointment booking, doctor availability management, medical record storage, online teleconsultation, prescription management, and NLP-based medical information summarization and translation.

A key feature of the system is **Machine Learning-based appointment no-show prediction**, which uses patient appointment history and other relevant information to predict the possibility of a patient missing an appointment and support better appointment scheduling.

---

## ✨ Features

### 👤 Patient

- Patient self-registration and login
- Patient profile management
- Search and view doctors
- View doctor availability
- Book appointments
- Select online or offline appointment mode
- View appointment history and upcoming appointments
- Upload medical records such as PDFs, documents, and images
- Access personal medical records
- View prescriptions and doctor notes
- Generate simplified summaries of medical information
- Translate supported medical information
- Access online consultation through the generated teleconsultation link

### 👨‍⚕️ Doctor

- Secure doctor login
- Doctor profile management
- Manage/view appointment schedules
- View allocated patients
- Access medical records of allocated patients
- Add prescriptions
- Add medical notes
- View relevant patient information
- Conduct online consultations

### 🧑‍💼 Hospital Staff

- Staff login
- Manage doctor information
- Update doctor availability
- Manage schedules
- View appointment details
- Manage hospital-related administrative information
- Assist with appointment management

### 🤖 Machine Learning

- Uses a trained ML model for appointment no-show prediction
- Uses previous appointment history and relevant appointment/patient features
- Produces a no-show prediction/decision
- Supports appointment scheduling and better-slot recommendation

> The ML model is maintained as a separate component and is integrated with the Spring Boot backend through an API/service layer.

### 🧠 NLP

- Medical information summarization
- Patient-friendly presentation of medical notes
- Translation of supported medical information

### 📹 Teleconsultation

- Supports online appointment mode
- Generates a secure consultation link
- Provides appointment information to both patient and doctor
- Enables online doctor-patient consultation

### 🔐 Security

- Role-based access
- JWT-based authentication
- Protected backend APIs
- Controlled access to patient medical records
- Patient and allocated doctor access to relevant medical records

---

# 🏗️ System Architecture

```text
                         ┌───────────────────┐
                         │      Patient      │
                         └─────────┬─────────┘
                                   │
                         ┌─────────▼─────────┐
                         │   React Frontend  │
                         │   Vite + Tailwind │
                         └─────────┬─────────┘
                                   │
                              REST APIs
                                   │
                         ┌─────────▼─────────┐
                         │  Spring Boot API  │
                         │      Backend      │
                         └─────┬────┬────┬───┘
                               │    │    │
                ┌──────────────┘    │    └──────────────┐
                │                   │                   │
        ┌───────▼────────┐  ┌──────▼─────────┐  ┌──────▼─────────┐
        │   PostgreSQL   │  │  ML Prediction │  │  NLP Module    │
        │    Database    │  │    Service     │  │ Summary /      │
        │                │  │                │  │ Translation     │
        └────────────────┘  └────────────────┘  └────────────────┘

                         ┌────────────────────┐
                         │ Teleconsultation   │
                         │ Integration        │
                         └────────────────────┘
```

---

# 🔄 Main Application Workflow

```text
Patient Registration
        │
        ▼
     Login
        │
        ▼
 Select Doctor
        │
        ▼
View Doctor Availability
        │
        ▼
 Select Appointment
        │
        ▼
Patient + Appointment History
        │
        ▼
 No-Show Prediction
        │
        ├───────────────┐
        │               │
        ▼               ▼
   Lower Risk       Higher Risk
        │               │
        ▼               ▼
 Confirm Slot       Better Slot /
                    Scheduling Decision
        │               │
        └───────┬───────┘
                ▼
        Appointment Created
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
     Offline           Online
        │                │
        │                ▼
        │       Secure Meeting Link
        │                │
        │          ┌─────┴─────┐
        │          ▼           ▼
        │       Patient      Doctor
        │
        └────────────┬────────────
                     ▼
              Appointment
                Completed
                     │
                     ▼
          Prescription / Notes
                     │
                     ▼
            NLP Summary /
              Translation
```

---

# 🧠 Machine Learning Workflow

The no-show prediction component is intended to work as follows:

```text
Patient Information
        +
Previous Appointment History
        +
Current Appointment Information
        │
        ▼
   ML Prediction API
        │
        ▼
 No-Show Prediction
        │
        ▼
Appointment Scheduling Logic
        │
        ├── Suitable ──► Confirm Appointment
        │
        └── Risk Detected ──► Recommend Better Slot
```

The exact ML model, features, prediction threshold, and API contract should be documented here after the trained model is integrated.

---

# 🛠️ Technology Stack

## Frontend

- React.js
- Vite
- JavaScript
- Tailwind CSS
- REST API

## Backend

- Java 17
- Spring Boot 3.5.6
- Spring Data JPA
- Hibernate
- Spring Security
- JWT
- Maven
- REST APIs
- Embedded Apache Tomcat

## Database

- PostgreSQL
- pgAdmin

## Machine Learning

- Python-based ML service
- Trained no-show prediction model

## NLP

- NLP-based summarization
- Translation functionality

## Development Tools

- IntelliJ IDEA
- Visual Studio Code
- PostgreSQL / pgAdmin

---

# 📂 Project Structure

## Backend

```text
Medicare-backend/
└── medicare/
    └── medicare/
        ├── src/
        │   ├── main/
        │   │   ├── java/
        │   │   │   └── com/
        │   │   │       └── medicare/
        │   │   │           └── medicare/
        │   │   │               ├── Config/
        │   │   │               ├── Controller/
        │   │   │               ├── Entity/
        │   │   │               ├── Repository/
        │   │   │               ├── Security/
        │   │   │               ├── Service/
        │   │   │               └── MedicareApplication.java
        │   │   │
        │   │   └── resources/
        │   │       └── application.properties
        │   │
        │   └── test/
        │
        ├── pom.xml
        └── mvnw
```

### Backend Layers

| Folder | Purpose |
|---|---|
| `Controller` | Handles API/HTTP requests |
| `Service` | Contains application/business logic |
| `Repository` | Communicates with PostgreSQL through JPA |
| `Entity` | Represents database entities/tables |
| `Security` | Authentication, JWT and authorization |
| `Config` | Application configuration |
| `resources` | Configuration and other resources |
| `pom.xml` | Maven dependencies and project configuration |

---

## Frontend

```text
medicare-frontend/
├── public/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── routes/
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
├── vite.config.js
├── tailwind.config.js
└── index.html
```

### Frontend Folders

| Folder | Purpose |
|---|---|
| `pages` | Application pages/screens |
| `components` | Reusable UI components |
| `api` | Communication with backend APIs |
| `context` | Shared React application state |
| `hooks` | Reusable React logic |
| `routes` | Application navigation |
| `assets` | Images and frontend resources |
| `public` | Static files |

---

# 🗄️ Database

The application uses PostgreSQL.

The current backend creates/manages entities including:

```text
users
patients
doctors
staff
appointments
medical_records
doctor_available_days
```

### Main relationships

```text
User
 ├── Patient
 ├── Doctor
 └── Staff

Patient
 ├── Appointments
 └── Medical Records

Doctor
 ├── Appointments
 └── Available Days
```

---

# 🔐 Authentication and Authorization

The backend uses **Spring Security and JWT authentication**.

The current application supports the following roles:

```text
PATIENT
DOCTOR
STAFF
```

Role-based authorization controls which APIs and application features can be accessed by each type of user.

For medical records, access is restricted to the relevant patient and allocated doctor.

---

# ⚙️ Local Setup

## Prerequisites

Install the following:

- Java JDK 17
- Node.js and npm
- PostgreSQL
- pgAdmin
- IntelliJ IDEA
- Visual Studio Code

---

## 1. Backend Setup

Open the backend project in IntelliJ IDEA.

Locate:

```text
MedicareApplication.java
```

Before running the backend, make sure PostgreSQL is running.

Database configuration is located at:

```text
src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/medicare
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```

Replace `YOUR_PASSWORD` with the PostgreSQL password configured on the local machine.

---

## 2. Start Backend

Run:

```text
MedicareApplication.java
```

The Spring Boot backend runs on:

```text
http://localhost:8080
```

A successful startup should contain messages similar to:

```text
Tomcat started on port 8080
Started MedicareApplication
```

---

## 3. Frontend Setup

Open the frontend folder in Visual Studio Code.

Open the terminal and run:

```bash
npm install
```

Then start the development server:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

---

# 🔗 Frontend and Backend

The local development environment consists of:

| Component | Address |
|---|---|
| React Frontend | `http://localhost:5173` |
| Spring Boot Backend | `http://localhost:8080` |
| PostgreSQL | `localhost:5432` |

The communication flow is:

```text
React
  │
  │ HTTP/REST API
  ▼
Spring Boot
  │
  │ JPA/JDBC
  ▼
PostgreSQL
```

---

# 📅 Appointment Status

Appointments can have the following statuses:

```text
SCHEDULED
CONFIRMED
CHECKED_IN
COMPLETED
CANCELLED
NO_SHOW
```

---

# 📁 Medical Records

Patients can upload medical records such as:

- PDF files
- Documents
- Images/photos
- Medical reports

The backend stores metadata associated with each medical record, including information such as filename, MIME type, storage path, upload time, and patient association.

Access should be restricted through backend authorization rather than relying only on frontend visibility.

---

# 📹 Online Appointment

For online appointments:

```text
Patient
   │
   ▼
Select Online Mode
   │
   ▼
Appointment Created
   │
   ▼
Teleconsultation Session
   │
   ▼
Secure Meeting Link
   │
   ├──────────► Patient
   │
   └──────────► Doctor
```

---

# 🧠 NLP Workflow

```text
Doctor's Medical Note
        │
        ▼
    NLP Module
        │
   ┌────┴─────┐
   ▼          ▼
Summary    Translation
   │          │
   └────┬─────┘
        ▼
     Patient
```

---

# 🧪 Testing

The major application workflows to test include:

### Authentication

- Patient registration
- Patient login
- Doctor login
- Staff login
- Invalid credentials
- Role-based access

### Appointment

- Doctor availability
- Appointment booking
- Duplicate appointment prevention
- Appointment cancellation
- Appointment status updates
- No-show prediction integration

### Medical Records

- File upload
- File access
- Patient access restriction
- Doctor access restriction
- Unauthorized access prevention

### Online Consultation

- Online appointment creation
- Meeting link generation
- Patient access
- Doctor access

### Doctor Module

- Patient access
- Prescription creation
- Medical notes
- Appointment management

### NLP

- Summary generation
- Translation

---

# 📸 Screenshots

Add project screenshots here after finalizing the UI.

Example:

```markdown
## Screenshots

### Patient Dashboard

![Patient Dashboard](screenshots/patient-dashboard.png)

### Doctor Dashboard

![Doctor Dashboard](screenshots/doctor-dashboard.png)

### Appointment Booking

![Appointment Booking](screenshots/appointment-booking.png)
```

---

# 🔮 Future Scope

Possible future improvements include:

- Mobile application
- Email/SMS appointment reminders
- Online payment integration
- Advanced doctor recommendation
- AI-assisted medical report analysis
- Advanced medical NLP
- Pharmacy integration
- Laboratory integration
- Healthcare analytics dashboard
- Improved ML model monitoring and retraining
- Multi-hospital support

---

# 👨‍💻 Project Team

**Medicare — Smart Healthcare Information and Teleconsultation System**

Developed by:

- **Uday Shinde**
- **Gaurav Todkar**
- **Parth Sutar**

---

# 📜 Project Purpose

This project has been developed as an academic/final-year project to demonstrate the integration of modern web technologies, database management, Machine Learning, NLP, authentication, and teleconsultation functionality in a healthcare management platform.

---

## ⚠️ Development Note

The Machine Learning model is being integrated as a separate component of the system.

Once the final ML integration is completed, this README should be updated with:

- ML model name
- ML framework
- Model file format
- Input features
- Prediction output
- Prediction API endpoint
- ML service setup instructions
- Required Python dependencies
- ML service startup command

This ensures that another developer can reproduce the complete system on a different computer.
