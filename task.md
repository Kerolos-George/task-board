# Task Management System

## Objective

Build a production-minded task management application that demonstrates the ability to design, implement, test, and document a complete full-stack solution.

---

# Functional Requirements

## Authentication & Users

- Users can register.
- Users can log in.
- Passwords must be securely hashed.
- Authenticated routes must be protected.
- Support two user roles:
  - Admin
  - Member

---

## Projects

Users should be able to:

- Create projects.
- View projects.
- Update projects.
- Delete projects.

Additional requirements:

- Admins can add members to a project.
- Admins can remove members from a project.
- Users should only see projects they have access to.

---

## Tasks

Users should be able to:

- Create tasks inside a project.
- View tasks.
- Update tasks.
- Delete tasks.

Each task must include:

- Title
- Description
- Status
- Priority
- Due Date
- Creator
- Assignee

Supported task statuses:

- To Do
- In Progress
- Done

Task filtering should support:

- Status
- Priority
- Assignee

Unauthorized users must not be able to modify projects or tasks they do not have access to.

---

## Frontend

Provide:

- Login screen
- Registration screen
- Project list
- Task board or task table
- Create/Edit forms

Requirements:

- Client-side validation
- Loading states
- Success states
- Empty states
- Error states
- Responsive layout for desktop and mobile

---

# Engineering Expectations

- Clear project structure.
- Proper separation of concerns.
- Validate and sanitize request data.
- Centralized error handling.
- Use environment variables for configuration and secrets.
- Include database migrations or seed data where applicable.
- Write clean, readable, and maintainable code.
- Include at least five meaningful automated backend tests.

---

# Bonus Features (Optional)

- Docker Compose setup.
- API documentation.
- Real-time task updates.
- Pagination.
- Sorting.
- Search.
- Audit log for task status changes.
- Deployment to a publicly accessible environment.

---

# Submission Requirements

The repository should include:

- Complete source code.
- README with setup instructions.
- Architecture overview.
- Environment variable documentation.
- Database setup instructions.
- Test commands.
- `.env.example` file.
- API documentation or Postman collection.
- Seed instructions or test credentials for both Admin and Member accounts.
- Live deployment URL (if deployed).

---

# Evaluation Criteria

The project will be evaluated based on:

- Backend architecture and API quality.
- Frontend implementation and user experience.
- Database design.
- Code quality and maintainability.
- Automated testing.
- Documentation and setup.
- Git practices.

---

# Notes

- Reasonable technical decisions may be made where requirements are not explicitly defined.
- Bonus features should only be attempted after completing the core requirements.
- AI development tools may be used, but the implementation should be fully understood.
- Be prepared to explain design decisions, run the project, and implement small changes during the follow-up interview.