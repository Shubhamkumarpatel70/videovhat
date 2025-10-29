# VideoChat Setup Guide

## Quick Start

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Environment Setup

**Backend Environment:**
1. Copy `config.env` to `.env` in the backend folder
2. Update the MongoDB connection string if needed
3. Set your JWT secret key

**Frontend:**
- No environment variables needed for development
- The app will connect to `http://localhost:5000` by default

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 4. Access the Application

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

## Features

✅ **Modern UI with Tailwind CSS**
- Glassmorphism design
- Responsive layout
- Smooth animations
- Custom components

✅ **Real-time Video Chat**
- WebRTC integration
- HD video quality
- Audio/video controls
- Screen sharing ready

✅ **Smart Matching System**
- Gender-based matching
- Country-based matching
- Anonymous options
- Real-time user statistics

✅ **Modern Tech Stack**
- React 18 with hooks
- Tailwind CSS for styling
- Framer Motion for animations
- Socket.io for real-time communication
- MongoDB for data storage

## Development

### Backend Development
- Uses Express.js with Socket.io
- MongoDB with Mongoose ODM
- Real-time user management
- WebRTC signaling server

### Frontend Development
- React with modern hooks
- Tailwind CSS for styling
- Framer Motion for animations
- Responsive design
- Real-time updates

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Set up MongoDB Atlas or production MongoDB
4. Configure domain and SSL

### Frontend
1. Run `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure environment variables for production

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **Socket.io Connection Issues**
   - Check CORS configuration
   - Verify frontend URL in CORS settings
   - Ensure ports are not blocked

3. **WebRTC Issues**
   - Check browser compatibility
   - Verify HTTPS in production
   - Check camera/microphone permissions

4. **Tailwind CSS Not Working**
   - Ensure Tailwind is properly installed
   - Check `tailwind.config.js` configuration
   - Verify PostCSS setup

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Security Considerations

- Input validation for all user data
- CORS configuration for allowed origins
- Rate limiting for socket connections
- Data sanitization before database storage
- Secure WebRTC signaling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
