# 🚢 Boat Safari Web Application

A comprehensive boat tour management system built with Spring Boot and modern web technologies. This application provides a complete platform for managing boat safari tours, bookings, staff, and customer relationships.

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [User Roles & Permissions](#-user-roles--permissions)
- [Database Schema](#-database-schema)
- [Frontend Pages](#-frontend-pages)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🏠 Public Features
- **Landing Page**: Modern, responsive homepage with company information
- **Trip Catalog**: Browse available boat safari trips with detailed information
- **Trip Booking**: Secure online booking system with payment integration
- **User Registration**: Customer account creation and management
- **Public Feedback**: View customer reviews and ratings

### 👤 Customer Portal
- **User Authentication**: Secure login and profile management
- **Booking History**: View past and upcoming bookings
- **Trip Booking**: Book new trips with real-time availability
- **Payment Processing**: Secure payment handling
- **Feedback System**: Submit and manage trip reviews
- **Profile Management**: Update personal information and preferences

### 🎯 Admin Dashboard
- **Comprehensive Analytics**: Charts and statistics for business insights
- **Trip Management**: Create, edit, and delete trip offerings with image uploads
- **Boat Management**: Manage fleet with status tracking and maintenance schedules
- **Booking Management**: View, confirm, and cancel customer bookings
- **Staff Management**: Add, edit, and manage staff members and roles
- **Payment History**: Track all transactions and financial reports
- **Report Generation**: Export data in PDF and Excel formats
- **User Management**: Oversee customer accounts and permissions

### 🧭 Staff Portals
- **Safari Guide Dashboard**: Trip assignments and route management
- **IT Support Dashboard**: System maintenance and user support
- **Staff Dashboard**: General staff functions and information access

### 🛠️ System Features
- **Role-Based Access Control**: Secure access based on user roles
- **JWT Authentication**: Token-based security system
- **Responsive Design**: Mobile-friendly interface across all devices
- **Modern UI/UX**: Glassmorphism design with smooth animations
- **Real-time Notifications**: System-wide notification system
- **Data Export**: PDF and Excel report generation
- **Image Management**: Trip image upload and display system

## 🛠️ Technology Stack

### Backend
- **Java 17**: Core programming language
- **Spring Boot 3.2.0-RC2**: Application framework
- **Spring Security**: Authentication and authorization
- **Spring Data JPA**: Database access layer
- **Hibernate**: ORM framework
- **JWT (JSON Web Tokens)**: Stateless authentication
- **Microsoft SQL Server**: Primary database
- **Maven**: Dependency management and build tool

### Frontend
- **HTML5 & CSS3**: Modern web standards
- **JavaScript (ES6+)**: Interactive functionality
- **Chart.js**: Data visualization and analytics
- **Font Awesome**: Icon library
- **Responsive Design**: Mobile-first approach
- **Glassmorphism UI**: Modern design aesthetic

### Development Tools
- **Spring Boot DevTools**: Hot reload for development
- **Lombok**: Boilerplate code reduction
- **Maven Wrapper**: Consistent build environment

## 📁 Project Structure

```
boat-safari-web/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/boatsafari/
│   │   │       ├── BoatSafariApplication.java
│   │   │       └── managementsystem/
│   │   │           ├── config/          # Security & JWT configuration
│   │   │           ├── controller/      # REST API controllers
│   │   │           ├── model/          # JPA entities
│   │   │           ├── repository/     # Data access layer
│   │   │           ├── service/        # Business logic
│   │   │           ├── util/           # Utility classes
│   │   │           └── schedule/       # Scheduled tasks
│   │   └── resources/
│   │       ├── static/                 # Frontend assets
│   │       │   ├── admin.html         # Admin dashboard
│   │       │   ├── index.html         # Landing page
│   │       │   ├── trips.html         # Trip catalog
│   │       │   ├── booking.html       # Booking system
│   │       │   ├── login.html         # Authentication
│   │       │   ├── assets/            # CSS, JS, images
│   │       │   └── img/               # Static images
│   │       ├── application.properties  # Configuration
│   │       └── db/                    # Database scripts
│   └── test/                          # Unit tests
├── target/                            # Build output
├── pom.xml                           # Maven dependencies
└── README.md                         # This file
```

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

- **Java Development Kit (JDK) 17 or higher**
- **Microsoft SQL Server** (Local or remote instance)
- **Maven 3.6+** (or use included Maven wrapper)
- **Git** (for version control)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/IT24102454/Boat-Safari-Web-.git
cd Boat-Safari-Web-
```

### 2. Database Setup
1. Install Microsoft SQL Server
2. Create a new database named `BoatSafariDB`
3. Update database credentials in `application.properties`

### 3. Configure Application Properties
Edit `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:sqlserver://localhost;databaseName=BoatSafariDB;encrypt=true;trustServerCertificate=true
spring.datasource.username=your_username
spring.datasource.password=your_password

# JWT Configuration
jwt.secret=your-secret-key-here

# Server Configuration
server.port=9091
```

### 4. Install Dependencies
```bash
# Using Maven wrapper (recommended)
./mvnw clean install

# Or using system Maven
mvn clean install
```

## ⚙️ Configuration

### Database Configuration
The application uses Microsoft SQL Server with the following default settings:
- **Host**: localhost
- **Port**: 1433 (default)
- **Database**: BoatSafariDB
- **Username**: sa
- **Password**: 1234

### JWT Security
Configure JWT settings in `application.properties`:
- **Secret Key**: Used for token signing
- **Token Expiration**: Configurable in security configuration

### Server Configuration
- **Default Port**: 9091
- **Context Path**: / (root)
- **Timezone**: Asia/Colombo

## 🏃‍♂️ Running the Application

### Development Mode
```bash
# Using Maven wrapper
./mvnw spring-boot:run

# Or using system Maven
mvn spring-boot:run

# Skip tests during development
./mvnw spring-boot:run -DskipTests
```

### Production Mode
```bash
# Build the JAR file
./mvnw clean package

# Run the JAR
java -jar target/boatsafari-0.0.1-SNAPSHOT.jar
```

### Accessing the Application
Once running, access the application at:
- **Main Application**: http://localhost:9091
- **Admin Dashboard**: http://localhost:9091/admin.html
- **API Base URL**: http://localhost:9091/api

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
POST /api/auth/logout         # User logout
```

### Trip Management
```
GET    /api/trips             # Get all trips
POST   /api/trips             # Create new trip
PUT    /api/trips/{id}        # Update trip
DELETE /api/trips/{id}        # Delete trip
GET    /api/trips/{id}        # Get trip by ID
```

### Booking Management
```
GET    /api/bookings          # Get all bookings
POST   /api/bookings          # Create booking
PUT    /api/bookings/{id}     # Update booking
DELETE /api/bookings/{id}     # Cancel booking
```

### User Management
```
GET    /api/admin/users       # Get all users (Admin only)
POST   /api/admin/users       # Create user (Admin only)
PUT    /api/admin/users/{id}  # Update user (Admin only)
DELETE /api/admin/users/{id}  # Delete user (Admin only)
```

### Boat Management
```
GET    /api/admin/boats       # Get all boats
POST   /api/admin/boats       # Add new boat
PUT    /api/admin/boats/{id}  # Update boat
DELETE /api/admin/boats/{id}  # Delete boat
```

## 👥 User Roles & Permissions

### CUSTOMER
- View public pages
- Book trips
- Manage personal bookings
- Submit feedback
- Access booking history

### ADMIN
- Full system access
- Manage trips, boats, and staff
- View analytics and reports
- Export data
- User management

### SAFARI_GUIDE
- View assigned trips
- Access guide dashboard
- Update trip status

### STAFF
- Access staff dashboard
- Basic system functions

### IT_SUPPORT / IT_ASSISTANT
- System maintenance
- User support functions
- Technical dashboards

## 🗄️ Database Schema

### Core Entities

#### Users
- Base user information
- Authentication credentials
- Role assignments

#### Trips
- Trip details and scheduling
- Pricing and capacity
- Route information
- Image management

#### Boats
- Fleet management
- Maintenance tracking
- Capacity and features
- Status monitoring

#### Bookings
- Customer reservations
- Payment tracking
- Status management
- Trip assignments

#### Feedback
- Customer reviews
- Rating system
- Response management

## 🌐 Frontend Pages

### Public Pages
- **index.html**: Landing page with company overview
- **trips.html**: Trip catalog with booking functionality
- **login.html**: User authentication
- **register.html**: New user registration
- **support.html**: Customer support information

### User Portal
- **profile.html**: User account management
- **booking.html**: Trip booking interface
- **booking-history.html**: Past and upcoming bookings
- **feedback.html**: Review and rating system
- **payment.html**: Payment processing

### Admin Interface
- **admin.html**: Comprehensive admin dashboard
- **feedback-management.html**: IT support dashboard

### Staff Portals
- **guide.html**: Safari guide dashboard
- **staff.html**: General staff interface
- **itsupport.html**: IT support tools

## 🔐 Security

### Authentication
- JWT-based stateless authentication
- Secure password hashing with BCrypt
- Role-based access control (RBAC)

### Authorization
- Method-level security annotations
- URL-based access restrictions
- API endpoint protection

### Data Protection
- SQL injection prevention via JPA
- XSS protection in frontend
- CSRF protection for state-changing operations
- Secure HTTP headers configuration

## 🚀 Deployment

### Environment Setup
1. Configure production database
2. Update application.properties for production
3. Set environment variables for sensitive data
4. Configure reverse proxy (nginx/Apache)

### Build for Production
```bash
./mvnw clean package -Pprod
```

### Docker Deployment (Optional)
```dockerfile
FROM openjdk:17-jre-slim
COPY target/boatsafari-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 9091
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 🧪 Testing

### Run Unit Tests
```bash
./mvnw test
```

### Run Integration Tests
```bash
./mvnw verify
```

### Test Coverage
```bash
./mvnw jacoco:report
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow Java coding standards
- Write unit tests for new features
- Update documentation
- Use meaningful commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Email**: support@boatsafari.local
- **GitHub Issues**: [Create an issue](https://github.com/IT24102454/Boat-Safari-Web-/issues)

## 🙏 Acknowledgments

- Spring Boot community for excellent documentation
- Chart.js for data visualization components
- Font Awesome for icon library
- Microsoft for SQL Server

---

**Made with ❤️ for Boat Safari Adventures**

*Last updated: October 23, 2025*