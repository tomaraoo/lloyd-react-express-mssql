TASK REPORT SYSTEM

- Task CRUD and report system using React, Ant Design, Express, and MSSQL.

SETUP

- Requirements: Node.js, pnpm, MSSQL, and SQL Server Management Studio.
- Create task_report_db, select it, then import database.sql.
- Copy server/.env.example to server/.env and set the MSSQL credentials.
- Copy client/.env.example to client/.env.

INSTALL PACKAGES

- Server: cd server
- Run: pnpm install
- Client: cd client
- Run: pnpm install

RUN THE APPLICATION

- Server: cd server
- Run: pnpm dev
- Client: cd client
- Run: pnpm dev -Open http://localhost:5173.

TEST

- Register a user.
- Log in.
- Create a task.
- Edit the task. -Delete the task.
- Open Reports and test the filters and Print button.

CLIENT CHECKS

- Run: cd client
- Run: pnpm lint
- Run: pnpm build

CHALLENGES

- I was more familiar with writing and debugging PHP and MySQL, so learning JavaScript syntax and MSSQL was challenging.
