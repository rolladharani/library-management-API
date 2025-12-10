# Library Management System – REST API

This project is a backend REST API for managing library operations such as books, members, borrowing, returning, overdue management, and fines.  
Built using Node.js, Express.js, Sequelize ORM, and MySQL.

------------------------------------------------------------
FEATURES
------------------------------------------------------------

BOOKS
- Add, update, delete books
- Get all books / available books / book by ID

MEMBERS
- Add, update, delete members
- Auto-suspension based on overdue items
- Auto-reactivation after fine payment

TRANSACTIONS
- Borrow a book
- Return a book
- Detect overdue books automatically
- Create fines for overdue returns

FINES
- List all fines
- List unpaid fines
- Pay fine (updates member status automatically)

------------------------------------------------------------
TECH STACK
------------------------------------------------------------

- Node.js
- Express.js
- MySQL
- Sequelize ORM
- Postman for API testing

------------------------------------------------------------
PROJECT STRUCTURE
------------------------------------------------------------

src/
 ├── config/
 │    └── db.js
 ├── controllers/
 │    ├── bookController.js
 │    ├── memberController.js
 │    ├── transactionController.js
 │    └── fineController.js
 ├── models/
 │    ├── Book.js
 │    ├── Member.js
 │    ├── Transaction.js
 │    ├── Fine.js
 │    └── index.js
 ├── routes/
 │    ├── bookRoutes.js
 │    ├── memberRoutes.js
 │    ├── transactionRoutes.js
 │    └── fineRoutes.js
 └── services/
      └── memberService.js

------------------------------------------------------------
DATABASE CONFIG (.env)
------------------------------------------------------------

DB_NAME=library_db  
DB_USER=root  
DB_PASS=your_password  
DB_HOST=localhost  

------------------------------------------------------------
RUNNING THE PROJECT
------------------------------------------------------------

1. Install dependencies
   npm install

2. Start the server
   node index.js
   or
   npx nodemon index.js

------------------------------------------------------------
API ENDPOINTS
------------------------------------------------------------

BOOKS
POST    /books
GET     /books
GET     /books/available
GET     /books/:id
PUT     /books/:id
DELETE  /books/:id

MEMBERS
POST    /members
GET     /members
GET     /members/:id
PUT     /members/:id
DELETE  /members/:id

TRANSACTIONS
POST    /transactions/borrow
POST    /transactions/:id/return
GET     /transactions/overdue

FINES
GET     /fines
GET     /fines?status=unpaid
POST    /fines/:id/pay

------------------------------------------------------------
POSTMAN COLLECTION
------------------------------------------------------------

The Postman collection file is included:
Library-API.postman_collection.json

Import this file into Postman to test all endpoints.

------------------------------------------------------------
STATUS
------------------------------------------------------------

- All API endpoints implemented
- Overdue + fine logic working
- Auto-suspension and auto-reactivation completed
- Postman testing completed

