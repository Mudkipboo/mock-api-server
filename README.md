# Mock API Testing Server

A configurable mock API server for testing different HTTP status codes, network errors, and response delays.

## Features

- ✅ Return 200 OK responses
- ⚠️ Return 400 Bad Request errors
- ❌ Return 500 Server errors
- ⏱️ Simulate network timeouts
- 🔌 Simulate connection resets
- 🚫 Simulate connection refused
- ⏳ Add custom response delays
- 📊 Web-based control panel
- 📝 Detailed console logging

## Installation
```bash
# Clone the repository
git clone https://github.com/Mudkipboo/mock-api-server.git
cd mock-api-server

# Install dependencies
npm install

# Start the server
npm start
