# Campus Management System (CMS)

A responsive web-based **Campus Management System** built using **HTML, CSS, and JavaScript** to manage common academic and campus-related activities through dedicated Admin and Student panels.

## Features

### Admin Panel

* Dashboard with campus statistics
* Student management
* Teacher management
* Attendance management
* Results management
* Notice management
* Search functionality
* Add, edit and delete records
* Profile management

### Student Panel

* Student dashboard
* View attendance
* View attendance percentage
* View results and percentage
* View campus notices
* Profile management

### Authentication & UI

* Admin and Student role-based login
* Protected Admin and Student routes
* Session handling
* Form validation
* Dark/Light theme
* Responsive design
* Mobile navigation
* Toast notifications
* Confirmation modals

## Technologies Used

* HTML5
* CSS3
* JavaScript (Vanilla JS)
* LocalStorage
* SessionStorage

## Project Structure

```text
campus-management-system/
│
├── index.html
├── style.css
├── script.js
├── README.md

## Data Storage

The project uses browser-based Web Storage APIs for data persistence.

* `localStorage` is used for users, students, teachers, attendance, results, notices and theme preferences.
* `sessionStorage` is used for the current login session.

No external backend or database is required to run the current version.

## How to Run

1. Clone or download this repository.
2. Open the project folder.
3. Open `index.html` in a modern web browser.
4. The application will run directly in the browser.

## Project Status

**Completed**

## Screenshots

### Landing Page

![Landing Page](screenshots/landing-page.png)

### Login

![Login](screenshots/login.png)

### Admin Dashboard

![Admin Dashboard](screenshots/admin-dashboard.png)

### Student Dashboard

![Student Dashboard](screenshots/student-dashboard.png)

### Attendance

![Attendance](screenshots/attendance.png)

### Results

![Results](screenshots/results.png)

## Disclaimer

This is an academic/project implementation focused on frontend functionality and browser-based data storage. It does not currently use a server-side backend or external database.
