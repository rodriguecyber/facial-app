# Simple Node.js App

A simple Node.js application with Express.js.

## Features

- Hello World endpoint
- Health check endpoint
- Docker support
- Unit tests with Jest

## API Endpoints

### GET /
Returns a hello world message.

**Response:**
```json
{
  "message": "Hello World!"
}
```

### GET /health
Returns the health status of the service.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2023-10-01T12:00:00.000Z",
  "uptime": 123
}
```

## Running Locally

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on port 4000.

## Running Tests

```bash
npm test
```

## Running with Docker

```bash
docker-compose up --build
```

## Requirements

- Node.js >= 18.0.0