# Facial Recognition API

A simple Node.js API for comparing faces using face-api.js.

## Features

- Face comparison between two images
- Health check endpoint
- Docker support

## API Endpoints

### GET /health
Returns the health status of the service.

### POST /compare
Compares two uploaded images and returns similarity score.

**Request:**
- `image1`: First image file
- `image2`: Second image file

**Response:**
```json
{
  "similarity": 0.85,
  "distance": 0.15,
  "match": true
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

## Running with Docker

```bash
docker-compose up --build
```

## Requirements

- Node.js >= 18.0.0
- Models are automatically downloaded on first run