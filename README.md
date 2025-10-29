# VideoChat - Modern Video Chat Application

A beautiful, modern video chat application built with the MERN stack that allows users to connect with people worldwide through video calls and real-time messaging.

## Features

- 🎥 **HD Video Chat** - High-quality video calls using WebRTC
- 🌍 **Global Community** - Connect with users from around the world
- 🔒 **Privacy Options** - Join anonymously or with profile information
- 💬 **Real-time Chat** - Text messaging during video calls
- 🎨 **Modern UI/UX** - Beautiful, responsive design with smooth animations
- 📱 **Mobile Friendly** - Works perfectly on all devices
- ⚡ **Real-time Matching** - Smart user matching system
- 🎯 **Filter Options** - Match by gender, country, or preferences

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB

### Frontend
- **React** - UI library
- **Styled Components** - CSS-in-JS styling
- **Framer Motion** - Animation library
- **Socket.io Client** - Real-time communication
- **React Router** - Navigation
- **React Hot Toast** - Notifications

## Project Structure

```
video-chat/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── config.env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.js
│   │   │   ├── WaitingRoom.js
│   │   │   └── ChatRoom.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `config.env`):
```bash
cp config.env .env
```

4. Update the environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/videochat
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

5. Start MongoDB (make sure it's running on your system)

6. Start the backend server:
```bash
npm run dev
```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be running on `http://localhost:3000`

## Usage

1. **Join the Platform**
   - Enter your name, select gender, and optionally your country
   - Or join as anonymous for privacy
   - Click "Start Chatting" to enter the waiting room

2. **Find a Match**
   - In the waiting room, you can see online users and statistics
   - Click "Find a Match" to be paired with another user
   - The system will match you based on your preferences

3. **Video Chat**
   - Once matched, you'll be taken to the chat room
   - Video and audio are enabled by default
   - Use the control buttons to toggle video/audio
   - Send text messages in the chat panel
   - Click the phone button to end the call

## Features in Detail

### User Registration
- **Name Entry** - Enter your display name
- **Gender Selection** - Choose your gender for matching
- **Country Selection** - Optional country for location-based matching
- **Anonymous Mode** - Join without revealing personal information

### Matching System
- **Smart Matching** - Algorithm matches users based on preferences
- **Real-time Updates** - See online users and statistics
- **Preference Filtering** - Match by gender, country, or stay open

### Video Chat
- **WebRTC Integration** - High-quality video calls
- **Audio/Video Controls** - Toggle camera and microphone
- **Real-time Chat** - Text messaging during video calls
- **Call Management** - Start, control, and end calls

### UI/UX Features
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Smooth Animations** - Framer Motion for delightful interactions
- **Modern Styling** - Glassmorphism design with gradients
- **Real-time Feedback** - Toast notifications and status indicators

## API Endpoints

The backend provides real-time communication through Socket.io events:

### Client to Server Events
- `user-join` - User joins the platform
- `find-match` - Request to find a match
- `offer` - WebRTC offer
- `answer` - WebRTC answer
- `ice-candidate` - ICE candidate exchange
- `send-message` - Send chat message
- `end-call` - End the current call

### Server to Client Events
- `user-joined` - Confirmation of joining
- `user-list-updated` - Updated list of online users
- `match-found` - Match found with another user
- `no-match-found` - No available matches
- `offer` - WebRTC offer received
- `answer` - WebRTC answer received
- `ice-candidate` - ICE candidate received
- `receive-message` - Chat message received
- `call-ended` - Call ended by other user

## Security Features

- **Input Validation** - All user inputs are validated
- **CORS Protection** - Cross-origin requests are properly handled
- **Socket Authentication** - Users are authenticated before joining rooms
- **Data Sanitization** - User data is sanitized before storage

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.

---

**Enjoy connecting with people around the world! 🌍✨**
