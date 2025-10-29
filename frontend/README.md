# VideoChat Frontend

Modern React frontend for the VideoChat application with beautiful UI/UX design.

## Features

- 🎨 **Modern Design** - Glassmorphism UI with smooth animations
- 📱 **Responsive** - Works perfectly on all devices
- ⚡ **Real-time** - Socket.io integration for live communication
- 🎥 **WebRTC** - High-quality video calls
- 💬 **Chat** - Real-time messaging
- 🎭 **Animations** - Framer Motion for delightful interactions

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── LandingPage.js    # User registration and login
│   ├── WaitingRoom.js   # User matching and waiting
│   └── ChatRoom.js      # Video chat interface
├── App.js               # Main application component
├── index.js             # Application entry point
└── index.css            # Global styles
```

## Components

### LandingPage
- User registration form
- Anonymous option
- Gender and country selection
- Connection status indicator
- Beautiful landing page design

### WaitingRoom
- Online users display
- Statistics dashboard
- Match finding functionality
- User profile display
- Real-time updates

### ChatRoom
- Video call interface
- Audio/video controls
- Real-time chat
- WebRTC integration
- Call management

## Styling

The application uses:
- **Styled Components** - CSS-in-JS styling
- **Framer Motion** - Smooth animations
- **Glassmorphism** - Modern glass-like design
- **Gradient Backgrounds** - Beautiful color schemes
- **Responsive Design** - Mobile-first approach

## Key Features

### User Experience
- Smooth page transitions
- Loading states and animations
- Toast notifications
- Real-time status updates
- Intuitive controls

### Video Chat
- HD video quality
- Audio/video toggle controls
- Screen sharing ready
- Call quality indicators
- End call functionality

### Real-time Features
- Live user count
- Online status indicators
- Instant messaging
- Match notifications
- Connection status

## Dependencies

### Core
- `react` - UI library
- `react-dom` - DOM rendering
- `react-router-dom` - Navigation

### Styling & Animation
- `styled-components` - CSS-in-JS
- `framer-motion` - Animation library

### Communication
- `socket.io-client` - Real-time communication

### UI/UX
- `react-hot-toast` - Notifications
- `lucide-react` - Icons

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Development Server

The development server runs on port 3000 with:
- Hot reloading
- Error overlay
- Proxy to backend (port 5000)
- Source maps

## Building for Production

1. Build the application:
```bash
npm run build
```

2. The build folder will contain optimized production files

3. Deploy to your hosting service:
- Netlify
- Vercel
- AWS S3
- GitHub Pages

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Performance

### Optimizations
- Code splitting with React.lazy
- Memoization with React.memo
- Optimized bundle size
- Efficient re-renders

### Best Practices
- Component composition
- Custom hooks for logic
- Proper state management
- Error boundaries

## Accessibility

- Keyboard navigation
- Screen reader support
- High contrast support
- Focus management
- ARIA labels

## Security

- Input sanitization
- XSS protection
- HTTPS enforcement
- Secure WebRTC

## Troubleshooting

### Common Issues

1. **Socket Connection Failed**
   - Check backend server is running
   - Verify CORS configuration
   - Check network connectivity

2. **WebRTC Issues**
   - Ensure HTTPS in production
   - Check browser permissions
   - Verify camera/microphone access

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version
   - Verify all dependencies

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include accessibility features
4. Test on multiple browsers
5. Optimize for performance

## License

This project is licensed under the MIT License.
