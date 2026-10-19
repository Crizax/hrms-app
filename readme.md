# TalentFlow HRMS: Human Resource Management System

A full-stack recruitment and applicant tracking platform. Employers publish job advertisements, manage openings, and move applicants through hiring stages on a Kanban board, while candidates search and filter verified roles, apply with one click, and track their real-time application status.

The backend is a **Spring Boot 3 REST API** secured with **Spring Security 6 & Stateless JWT** and backed by **MySQL (Aiven Cloud)**. The frontend is a modern **React** single-page application built with Vite and Tailwind CSS.

![Employer active job postings](assets/First%20Page.PNG)

---

## Table of contents

- [Screenshots](#screenshots)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [API reference](#api-reference)
- [Frontend overview](#frontend-overview)
- [Testing](#testing)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

---

## Screenshots

### Authentication & Role-Based Onboarding

Users sign in or register as either a **Candidate** or an **Employer** through a unified authentication portal secured with BCrypt password hashing and stateless JWT tokens.

![Sign in and registration portal](assets/Sign-In.jpg)

### Managing active job postings (Employer)

Employers view their active postings, switch between their own listings and the public job board, publish new openings via a slide-over drawer, or close filled advertisements to stop new applications.

![Employer job postings](assets/First%20Page.PNG)

### Applicant tracking pipeline (Employer)

Employers select one of their active job postings to review applicants on a three-stage Kanban board (**Pending Review**, **Accepted / Hired**, **Rejected**) with live stage counters. Accepting candidates up to the open position limit automatically closes the advertisement.

![Employer applicant tracking board](assets/applications%20employer.PNG)

### Tracking applications (Candidate)

The **My Applications** portal lists every role the logged-in candidate has applied to, complete with company monograms, submission dates, and real-time status badges.

![Candidate applications](assets/Applications.PNG)

### Talent Pool & Directory Management (Employer)

Employers can browse and manage platform directories including the **Talent Pool**, **Companies**, **Job Positions**, and **Cities**.

![Talent pool directory](assets/Talent%20pool.PNG)

---

## Features

**Authentication & Security**
- Stateless JWT authentication (`/api/auth/login`) with **BCrypt** password hashing
- Role-based access control (`ROLE_EMPLOYER` and `ROLE_JOBSEEKER`) enforced via Spring Security filter chains
- Ownership-verified mutations: user identity (`employerId` / `jobSeekerId`) is extracted directly from the signed JWT security context (`@AuthenticationPrincipal`) to prevent ID spoofing
- Cross-table email uniqueness validation across both employers and candidates

**For Candidates**
- Create a verified candidate profile
- Search and filter active job advertisements dynamically by **keyword**, **city**, **job position**, **minimum salary**, and **sort order** (`releaseDate`, `applicationDeadline`, `minSalary`, `maxSalary`) with server-side pagination
- Apply to open roles with one click
- Track real-time application status in the **My Applications** portal

**For Employers**
- Register a company account and publish job advertisements
- Deactivate/close job advertisements manually (`PUT /api/jobPost/{id}/deactivate`) or automatically when all open positions are filled
- Review candidate applications (with full name and `mailto:` contact links) on a Kanban pipeline board
- Manage shared directories for **Cities** and **Job Positions**

**Platform & Architecture**
- N+1 query prevention on job searches using JPA `@EntityGraph`
- Automatic deadline enforcement (expired advertisements are blocked from new applications and automatically marked inactive)
- Consistent `{ message, succes, data }` JSON response wrapper across endpoints
- Field-level Jakarta Validation error reporting and global `@ControllerAdvice` exception handling

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend language | Java 17 |
| Backend framework | Spring Boot 3.2, Spring Web, Spring Data JPA / Hibernate 6 |
| Security | Spring Security 6, JJWT (`0.12.6`), BCrypt |
| Database | MySQL 8 (Aiven Cloud) & H2 In-Memory Database (Testing) |
| Validation | Jakarta Bean Validation (`@NotBlank`, `@Size`, `@Email`, `@Future`, `@Past`, `@Positive`) |
| Utilities | Lombok, Jackson |
| Backend testing | JUnit 5, MockMvc, AssertJ |
| Frontend | React, Vite, Tailwind CSS, React Router |

---

## Repository structure

This monorepo contains the Spring Boot backend, the React frontend, and project screenshots.

```text
.
├── hmrs-app/        Spring Boot backend
├── frontend/        React frontend (Vite + Tailwind CSS)
├── assets/          Screenshots used in this README
└── readme.md
```

### Backend (`hmrs-app`)

```text
hrms/hrms/
├── controller/       REST controllers (Auth, JobAdvertisement, JobApplication, Employer, JobSeeker, City, JobPosition)
├── business/
│   ├── abstracts/    Service interfaces
│   └── concretes/    Transactional service implementations (Managers)
├── repository/       Spring Data JPA repositories with custom JPQL & @EntityGraph queries
├── entity/           JPA entities and enums (JobApplicationStatus)
├── dto/              Response DTOs (including AuthResponseDto & PagedResponse)
├── dto/request/      Validated incoming request payloads
├── config/           CORS and Spring Security filter chain configuration (SecurityBeans)
└── core/
    ├── security/     JWT filter, JwtService, CustomUserDetails, CustomUserDetailsService
    ├── exceptions/   GlobalExceptionHandler (@ControllerAdvice)
    └── utilities/    Result, DataResult, SuccessResult, ErrorResult wrappers
```

### Frontend (`frontend`)

```text
src/
├── api.js             Fetch client with automatic Bearer JWT injection and error normalization
├── role.jsx           Authentication context (user session, JWT storage, role mapping)
├── AuthPages.jsx      Split-screen Sign In, Candidate Sign Up, and Employer Sign Up portal
├── ui.jsx             Design system (Button, Badge, Drawer, EntityForm, SkeletonList, Notice)
├── ResourcePage.jsx   Reusable directory table with slide-over creation drawer
├── pages.jsx          Directory pages (Cities, Job Positions, Companies, Talent Pool)
├── JobAds.jsx         Paginated multi-filter job board, employer ad manager, and 1-click apply
├── Applications.jsx   Employer Kanban pipeline board and Candidate application tracker
└── App.jsx            Glassmorphic navigation shell and role-protected routing
```

---

## Getting started

### Prerequisites

- Java 17+
- Maven
- MySQL 8+ (local instance or Aiven Cloud MySQL)
- Node.js 18+

### 1. Run the backend

1. Configure your MySQL database connection and JWT secret in `hmrs-app/src/main/resources/application.properties` (see [Configuration](#configuration)).
2. Start the Spring Boot server:

```bash
cd hmrs-app
mvn spring-boot:run
```

The API will start at `http://localhost:8080`.

### 2. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The React app will start at `http://localhost:5173`.

### 3. Walkthrough

1. Click **Sign in / Register** in the top navigation bar and select **Employer Sign Up** to create a company account (you will be signed in automatically).
2. Add locations under **Cities** and role titles under **Positions**.
3. Open **Job Postings** and click **+ Post Advertisement** to publish an opening.
4. Click **Sign out**, switch to **Candidate Sign Up**, and register a candidate account.
5. On **Explore Jobs**, filter roles by keyword, city, position, or salary, and click **Apply Now**.
6. Sign back in as your **Employer** account, open **Applicant Pipeline**, select your job posting, and move the candidate to **Accepted / Hired**.

---

## Configuration

### Backend: `hmrs-app/src/main/resources/application.properties`

```properties
# MySQL Database Configuration (Local or Aiven Cloud)
spring.datasource.url=jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:defaultdb}?sslMode=REQUIRED&serverTimezone=UTC
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:your_password}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA & Hibernate Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Configuration (Base64-encoded 256-bit key)
app.jwt.secret=${JWT_SECRET:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}
app.jwt.expiration-ms=86400000

# Allowed CORS Origins
app.cors.allowed-origins=http://localhost:5173
```

### Frontend: `frontend/.env`

```env
VITE_API_URL=http://localhost:8080
```

---

## API reference

Protected endpoints require the header:

```http
Authorization: Bearer <your_jwt_token>
```

### Endpoints

| Resource | Method | Endpoint | Access | Description |
|---|---|---|---|---|
| **Auth** | POST | `/api/auth/login` | Public | Authenticate user and receive a signed JWT |
| **Employers** | POST | `/api/employers/register` | Public | Register a new employer account |
| | GET | `/api/employers/getAll` | Authenticated | List registered employers |
| **Candidates** | POST | `/api/candidateController/register` | Public | Register a new candidate account |
| | GET | `/api/candidateController/getAll` | Authenticated | List registered candidates |
| **Cities** | GET | `/api/cities/getAll` | Public | List all cities |
| | POST | `/api/cities/add` | Authenticated | Add a new city |
| **Positions** | GET | `/api/jobPosition/getAll` | Public | List all job positions |
| | POST | `/api/jobPosition/add` | Authenticated | Add a new job position |
| **Job Ads** | GET | `/api/jobPost/search` | Public | Paginated multi-filter search (`cityId`, `jobPositionId`, `minSalary`, `keyword`, `page`, `size`, `sortBy`, `sortDir`) |
| | GET | `/api/jobPost/getAll` | Public | List all job advertisements |
| | GET | `/api/jobPost/active` | Public | List active job advertisements |
| | GET | `/api/jobPost/active/by-employer?employerId=` | Public | List active advertisements for a specific employer |
| | POST | `/api/jobPost/add` | `ROLE_EMPLOYER` | Publish a job advertisement (linked to JWT employer) |
| | PUT | `/api/jobPost/{id}/deactivate` | `ROLE_EMPLOYER` | Close an active advertisement owned by the employer |
| **Applications** | POST | `/api/applications/apply` | `ROLE_JOBSEEKER` | Apply to an active job advertisement |
| | GET | `/api/applications/my-applications` | `ROLE_JOBSEEKER` | List applications submitted by the logged-in candidate |
| | GET | `/api/applications/by-advertisement/{adId}` | `ROLE_EMPLOYER` | List applicants for an advertisement owned by the employer |
| | POST | `/api/applications/update-status` | `ROLE_EMPLOYER` | Update application status (`PENDING`, `ACCEPTED`, `REJECTED`) |

### Sample requests

**Login**

```json
POST /api/auth/login
{
  "email": "careers@xenon.com",
  "password": "password123"
}
```

**Publish a job advertisement (`ROLE_EMPLOYER`)**

```json
POST /api/jobPost/add
{
  "jobPositionId": 1,
  "cityId": 1,
  "description": "Looking for a Full Stack Developer experienced with React and Spring Boot.",
  "openPositionCount": 2,
  "minSalary": 50000,
  "maxSalary": 65000,
  "applicationDeadline": "2026-10-30"
}
```

**Search job advertisements with filters & pagination**

```http
GET /api/jobPost/search?cityId=1&minSalary=45000&keyword=developer&page=0&size=6&sortBy=releaseDate&sortDir=desc
```

**Apply for a job (`ROLE_JOBSEEKER`)**

```json
POST /api/applications/apply
{
  "jobAdvertisementId": 1
}
```

**Update an application's stage (`ROLE_EMPLOYER`)**

```json
POST /api/applications/update-status
{
  "applicationId": 1,
  "status": "ACCEPTED"
}
```

---

## Frontend overview

- **JWT Auth & Role-Protected Navigation:** `role.jsx` persists the authenticated session and dynamically adapts navigation links for guests, candidates, and employers.
- **Multi-Filter Search & Pagination:** `JobAds.jsx` connects to `/api/jobPost/search` to provide live filtering by keyword, city, position, and salary alongside sorting and pagination controls.
- **Kanban Applicant Pipeline:** `Applications.jsx` groups candidates into **Pending Review**, **Accepted / Hired**, and **Rejected** columns with live counts and direct `mailto:` links.
- **Modern Design System:** `ui.jsx` provides reusable components including shimmer `SkeletonList` loaders, status dot badges, gradient monogram avatars, and slide-over `Drawer` forms.

---

## Testing

The backend includes unit and integration tests powered by JUnit 5, MockMvc, AssertJ, and an in-memory H2 test database (`@ActiveProfiles("test")`).

| Test class | Type | What it tests |
|---|---|---|
| `CityDaoTest` | Unit | Saving cities and enforcing unique city name constraints |
| `CityControllerTest` | Integration | City endpoints and validation error responses |
| `EmployerDaoTest` | Unit | Saving employers and duplicate email constraints |
| `JobSeekerDaoTest` | Unit | Saving job seekers and duplicate email / National ID constraints |
| `JobPositionDaoTest` | Unit | Saving and retrieving job positions |
| `JobAdvertisementDaoTest` | Unit | Saving job advertisements with foreign key relations |
| `JobAdvertisementControllerTest` | Integration | Job advertisement creation and validation rules |
| `JobApplicationDaoTest` | Unit | Submitting applications, status defaults, and duplicate prevention |

```bash
cd hmrs-app
mvn test
```

---

## Deployment

- **Database:** Hosted on **Aiven Cloud MySQL** with required SSL (`sslMode=REQUIRED`).
- **Backend:** Deployable to Railway, Render, or Docker. Supply `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, and `APP_CORS_ALLOWED_ORIGINS` as environment variables.
- **Frontend:** Deployable to Vercel, Netlify, or Cloudflare Pages. Set the build command to `npm run build`, the output directory to `dist`, and `VITE_API_URL` to your deployed backend URL.

---

## Roadmap

- [x] Authentication and authorization (Spring Security 6, Stateless JWT, `ROLE_JOBSEEKER` and `ROLE_EMPLOYER`)
- [x] Extract user identity directly from JWT tokens instead of request bodies
- [x] Server-side pagination, dynamic sorting, and multi-filter keyword search
- [x] Close/deactivate advertisements manually or automatically when open positions fill
- [x] Enrich employer applicant cards with candidate name and email details
- [ ] Candidate CV / Resume builder and PDF upload
- [ ] Automated email notifications when an application's stage changes