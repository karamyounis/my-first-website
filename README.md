# CourseHub Microservices Demo

A simple Udemy-style course marketplace demo. It uses small Node.js services with no external dependencies:

- API Gateway: `http://localhost:3000`
- Course Service: `http://localhost:3001`
- User Service: `http://localhost:3002`
- Enrollment Service: `http://localhost:3003`

## Run

```bash
npm start
```

Open `http://localhost:3000` in your browser.

## Check

In another terminal:

```bash
npm run check
```

## What It Shows

- Browse and filter courses.
- View course details and instructor/profile data composed by the gateway.
- Enroll a demo learner through the enrollment service.
- See service health in the frontend.
