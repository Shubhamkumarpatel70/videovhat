# VideoChat Backend

Backend server for the VideoChat application built with Node.js, Express.js, Socket.io, and MongoDB.

## Features

- Real-time communication with Socket.io
- User management and matching system
- WebRTC signaling server
- MongoDB integration for user data
- CORS enabled for frontend communication

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp config.env .env
```

3. Update the `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/videochat
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

4. Make sure MongoDB is running on your system

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Documentation

### Socket.io Events

#### Client to Server Events

- **user-join**: User joins the platform
  ```javascript
  socket.emit('user-join', {
    name: 'John Doe',
    country: 'USA',
    gender: 'male',
    isAnonymous: false
  });
  ```

- **find-match**: Request to find a match
  ```javascript
  socket.emit('find-match', {
    gender: 'female',
    country: 'Canada'
  });
  ```

- **offer**: WebRTC offer
  ```javascript
  socket.emit('offer', {
    offer: offerData,
    roomId: 'room_123'
  });
  ```

- **answer**: WebRTC answer
  ```javascript
  socket.emit('answer', {
    answer: answerData,
    roomId: 'room_123'
  });
  ```

- **ice-candidate**: ICE candidate exchange
  ```javascript
  socket.emit('ice-candidate', {
    candidate: candidateData,
    roomId: 'room_123'
  });
  ```

- **send-message**: Send chat message
  ```javascript
  socket.emit('send-message', {
    text: 'Hello!',
    sender: 'John',
    timestamp: '2023-01-01T00:00:00Z',
    roomId: 'room_123'
  });
  ```

- **end-call**: End the current call
  ```javascript
  socket.emit('end-call', {
    roomId: 'room_123'
  });
  ```

#### Server to Client Events

- **user-joined**: Confirmation of joining
- **user-list-updated**: Updated list of online users
- **match-found**: Match found with another user
- **no-match-found**: No available matches
- **offer**: WebRTC offer received
- **answer**: WebRTC answer received
- **ice-candidate**: ICE candidate received
- **receive-message**: Chat message received
- **call-ended**: Call ended by other user

## Database Schema

### User Model
```javascript
{
  name: String,
  country: String,
  gender: String,
  isAnonymous: Boolean,
  socketId: String,
  isOnline: Boolean,
  createdAt: Date
}
```

## Server Configuration

The server runs on port 5000 by default and includes:

- CORS middleware for cross-origin requests
- Socket.io with CORS configuration
- MongoDB connection with Mongoose
- Real-time user management
- WebRTC signaling support

## Development

To run in development mode with auto-restart:
```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

## Production

For production deployment:
1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2
3. Set up proper MongoDB connection string
4. Configure your domain and SSL certificates

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the connection string in `.env`
   - Verify network connectivity

2. **Socket.io Connection Issues**
   - Check CORS configuration
   - Verify frontend URL in CORS settings
   - Ensure ports are not blocked

3. **WebRTC Issues**
   - Check browser compatibility
   - Verify HTTPS in production
   - Check firewall settings

## Security Considerations

- Input validation for all user data
- CORS configuration for allowed origins
- Rate limiting for socket connections
- Data sanitization before database storage
- Secure WebRTC signaling

## Monitoring

Consider adding:
- Logging with Winston
- Health check endpoints
- Performance monitoring
- Error tracking with Sentry
