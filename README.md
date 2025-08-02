# FX-alert

**FX Alert** is a real-time currency exchange rate monitoring and alert system built with Node.js, TypeScript, and Express. The application provides:

🔸 **Real-time currency conversion** with support for historical rates  
🔸 **Live multiple currency exchange rate monitoring** 
🔸 **Email alerts** for verified users with customizable base/target currencies  
🔸 **RESTful API** with comprehensive currency data and user management  
🔸 **Multi-database architecture** using PostgreSQL, Firestore, and Redis caching  
🔸 **Cloud-native deployment** on Google Cloud Platform with Terraform infrastructure  

**Key Features:**
- Currency conversion with caching for performance
- User registration with email verification
- Automated email notifications with formatted rate reports
- Rate limiting and security middleware
- Health monitoring and database connectivity checks
- Support for 170+ global currencies

**Tech Stack:** TypeScript, Express.js, PostgreSQL, Firestore, Redis, SendGrid, Docker, Terraform, GCP

## 📚 API Documentation
## [**Readme.io**](https://fx-alert.readme.io/reference/getting-started#/)

## 📁 Project Structure

```
FX-alert/
├── src/
│   ├── api-docs/           # OpenAPI/Swagger documentation
│   ├── datastore/          # Database layer (PostgreSQL, Firestore, Redis)
│   ├── fx/                 # Forex API integration
│   ├── logger/             # GCP logging utilities
│   ├── mailer/             # Email templates and SendGrid integration
│   ├── model/              # Data models and DTOs
│   ├── secrets/            # GCP Secret Manager integration
│   └── server/             # Express server, routes, and handlers
├── terraform/              # Infrastructure as Code
│   ├── api-gateway/        # API Gateway configuration
│   ├── firestore/          # Firestore database setup
│   ├── network/            # VPC and networking
│   ├── postgres/           # PostgreSQL database setup
│   └── secrets/            # Secret Manager configuration
├── Dockerfile              # Production container
├── Dockerfile.dev          # Development container
├── docker-compose.yml      # Local development setup
└── deploy.sh              # Deployment script
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, 
email michael.anikamadu@gmail.com or create an issue in this repository.

## 👨‍💻 Author

**Michael Anikamadu**

- GitHub: [@Dilly3](https://github.com/Dilly3)
- Email: michael.anikamadu@gmail.com
- LinkedIn: [Michael A.Olisa](https://www.linkedin.com/in/michael-olisa/)

---

⭐ **If this project helped you, please give it a star!**