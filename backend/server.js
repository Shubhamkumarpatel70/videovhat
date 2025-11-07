const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: './config.env' });

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/videochat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  country: String,
  gender: String,
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
  socketId: String,
  isOnline: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  banExpires: Date,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

// Restricted Word Schema
const restrictedWordSchema = new mongoose.Schema({
  word: { type: String, required: true, unique: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdAt: { type: Date, default: Date.now }
});

const RestrictedWord = mongoose.model('RestrictedWord', restrictedWordSchema);

// Chat Log Schema
const chatLogSchema = new mongoose.Schema({
  senderName: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  isViolation: { type: Boolean, default: false },
  flaggedWords: [String],
  roomId: String
});

const ChatLog = mongoose.model('ChatLog', chatLogSchema);

// Support Request Schema
const supportRequestSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'resolved', 'closed'], default: 'pending' },
  adminNotes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SupportRequest = mongoose.model('SupportRequest', supportRequestSchema);

// Admin Log Schema
const adminLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  action: String,
  details: String,
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});

const AdminLog = mongoose.model('AdminLog', adminLogSchema);

// Testimonials Schema
const testimonialSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String, required: true },
  location: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

// Maintenance Schema
const maintenanceSchema = new mongoose.Schema({
  isActive: { type: Boolean, default: false },
  scheduledFrom: Date,
  scheduledTo: Date,
  message: { type: String, default: 'The site is currently under maintenance. Please check back later.' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

// Nodemailer transporter
// For Gmail, you may need to enable "Less secure app access" or use an "App Password"
// See: https://support.google.com/accounts/answer/6010255
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // For development only
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Video Chat API is running',
    version: '1.0.0',
    endpoints: {
      auth: ['/register', '/login', '/verify-otp'],
      admin: ['/api/admin/*'],
      public: ['/api/testimonials', '/api/maintenance', '/api/support']
    }
  });
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(403).json({ message: 'Admin not found' });

    req.admin = admin;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Routes
app.post('/register', async (req, res) => {
  try {
    const { name, email, password, country, gender } = req.body;

    if (!email.endsWith('@gmail.com')) {
      return res.status(400).json({ message: 'Only @gmail.com emails are allowed' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      country,
      gender,
      otp,
      otpExpires
    });

    await user.save();

    // Assign socketId as user ID for tracking
    user.socketId = user._id.toString();
    await user.save();

    // Send OTP email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your email',
        text: `Your OTP is: ${otp}. It expires in 10 minutes.`
      });
    } catch (emailError) {
      console.error('Error sending OTP email:', emailError);
      return res.status(500).json({ message: 'Error sending verification email. Please check server configuration.' });
    }

    res.status(201).json({ message: 'User registered. Check your email for OTP.' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email, otp, otpExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (!user.isVerified) return res.status(400).json({ message: 'Email not verified' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, gender: user.gender, country: user.country } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP temporarily (in production, use Redis or similar)
    // For now, we'll store it in memory - in production, use proper storage
    global.adminOtpStore = global.adminOtpStore || {};
    global.adminOtpStore[email] = {
      otp,
      expires: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    };

    // Send OTP email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Admin Registration OTP',
        text: `Your OTP for admin registration is: ${otp}. It expires in 10 minutes.`
      });
    } catch (emailError) {
      console.error('Error sending admin OTP email:', emailError);
      return res.status(500).json({ message: 'Failed to send OTP email. Please check server configuration.' });
    }

    res.json({ message: 'OTP sent successfully to email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

app.post('/api/admin/register', async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ message: 'Admin already exists' });

    // Verify OTP
    const storedOtp = global.adminOtpStore?.[email];
    if (!storedOtp || storedOtp.otp !== otp || new Date() > storedOtp.expires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
    });

    await admin.save();

    // Clear OTP after successful registration
    delete global.adminOtpStore[email];

    const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token, adminUser: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Admin not found' });

    if (!admin.isApproved) return res.status(403).json({ message: 'Your account is pending approval. Please wait for admin approval.' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, adminUser: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Support route
app.post('/api/support', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ message: 'Email and message are required' });
    }

    // Save to database
    const supportRequest = new SupportRequest({
      name,
      email,
      message
    });
    await supportRequest.save();

    // Send support email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to admin/support email
      subject: 'New Support Request',
      text: `From: ${name || 'Anonymous'} (${email})\n\nMessage:\n${message}`
    });

    res.json({ message: 'Support request sent successfully' });
  } catch (error) {
    console.error('Support error:', error);
    res.status(500).json({ message: 'Failed to send support request' });
  }
});

// Admin routes
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password -otp -otpExpires').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { isBanned, banExpires } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned, banExpires },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Log admin action
    await AdminLog.create({
      adminId: req.admin._id,
      action: isBanned ? 'Ban User' : 'Unban User',
      details: `User ${user.name} (${user.email}) ${isBanned ? 'banned' : 'unbanned'}`,
      targetUserId: user._id
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Restricted words routes
app.get('/api/admin/restricted-words', authenticateAdmin, async (req, res) => {
  try {
    const words = await RestrictedWord.find().sort({ createdAt: -1 });
    res.json(words);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/restricted-words', authenticateAdmin, async (req, res) => {
  try {
    const { word, severity } = req.body;
    const newWord = new RestrictedWord({ word: word.toLowerCase(), severity });
    await newWord.save();

    // Log admin action
    await AdminLog.create({
      adminId: req.admin._id,
      action: 'Add Restricted Word',
      details: `Added word "${word}" with severity "${severity}"`
    });

    res.status(201).json(newWord);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Word already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

app.delete('/api/admin/restricted-words/:id', authenticateAdmin, async (req, res) => {
  try {
    const word = await RestrictedWord.findByIdAndDelete(req.params.id);
    if (!word) return res.status(404).json({ message: 'Word not found' });

    // Log admin action
    await AdminLog.create({
      adminId: req.admin._id,
      action: 'Delete Restricted Word',
      details: `Deleted word "${word.word}" `
    });

    res.json({ message: 'Word deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Active chats route
app.get('/api/admin/active-chats', authenticateAdmin, async (req, res) => {
  try {
    const activeChats = Array.from(activeUsers.values()).map(user => ({
      socketId: user.socketId,
      name: user.name,
      country: user.country,
      gender: user.gender,
      isOnline: user.isOnline,
      connectedAt: user.connectedAt,
      connectionDuration: user.connectedAt ? Math.floor((new Date() - new Date(user.connectedAt)) / 1000) : 0
    }));
    res.json(activeChats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Chat logs route
app.get('/api/admin/chat-logs', authenticateAdmin, async (req, res) => {
  try {
    const logs = await ChatLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin logs route
app.get('/api/admin/logs', authenticateAdmin, async (req, res) => {
  try {
    const logs = await AdminLog.find().populate('adminId', 'name').populate('targetUserId', 'name email').sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Pending admins route
app.get('/api/admin/pending-admins', authenticateAdmin, async (req, res) => {
  try {
    const pendingAdmins = await Admin.find({ isApproved: false }).select('-password').sort({ createdAt: -1 });
    res.json(pendingAdmins);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve admin route
app.put('/api/admin/approve-admin/:id', authenticateAdmin, async (req, res) => {
  try {
    const { approved } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { isApproved: approved },
      { new: true }
    );
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    // Log admin action
    await AdminLog.create({
      adminId: req.admin._id,
      action: approved ? 'Approve Admin' : 'Reject Admin',
      details: `Admin ${admin.name} (${admin.email}) ${approved ? 'approved' : 'rejected'} `,
      targetUserId: admin._id
    });

    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Support requests route
app.get('/api/admin/support-requests', authenticateAdmin, async (req, res) => {
  try {
    const supportRequests = await SupportRequest.find().sort({ createdAt: -1 });
    res.json(supportRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/support-requests/:id', authenticateAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const supportRequest = await SupportRequest.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes, updatedAt: new Date() },
      { new: true }
    );
    if (!supportRequest) return res.status(404).json({ message: 'Support request not found' });

    // Log admin action
    await AdminLog.create({
      adminId: req.admin._id,
      action: 'Update Support Request',
      details: `Updated support request ${supportRequest._id} status to ${status}`
    });

    res.json(supportRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Testimonials routes
app.get('/api/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/testimonials', authenticateAdmin, async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/testimonials', authenticateAdmin, async (req, res) => {
  try {
    const { text, author, location } = req.body;
    const testimonial = new Testimonial({ text, author, location });
    await testimonial.save();

    // Log admin action
    await AdminLog.create({
      adminId: req.admin._id,
      action: 'Add Testimonial',
      details: `Added testimonial by ${author} from ${location}`
    });

    res.status(201).json(testimonial);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/testimonials/:id', authenticateAdmin, async (req, res) => {
  try {
    const { text, author, location, isActive } = req.body;
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { text, author, location, isActive, updatedAt: new Date() },
      { new: true }
    );
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });

    // Log admin action
    await AdminLog.create({
      adminId: req.admin._id,
      action: 'Update Testimonial',
      details: `Updated testimonial by ${author}`
    });

    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/testimonials/:id', authenticateAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });

    // Log admin action
    await AdminLog.create({
      adminId: req.admin._id,
      action: 'Delete Testimonial',
      details: `Deleted testimonial by ${testimonial.author}`
    });

    res.json({ message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Maintenance routes
app.get('/api/admin/maintenance', authenticateAdmin, async (req, res) => {
  try {
    const maintenance = await Maintenance.findOne().sort({ createdAt: -1 });
    res.json(maintenance || { isActive: false, message: 'The site is currently under maintenance. Please check back later.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/maintenance', authenticateAdmin, async (req, res) => {
  try {
    const { isActive, scheduledFrom, scheduledTo, message } = req.body;

    // Deactivate any existing maintenance
    await Maintenance.updateMany({}, { isActive: false });

    const maintenance = new Maintenance({
      isActive,
      scheduledFrom,
      scheduledTo,
      message: message || 'The site is currently under maintenance. Please check back later.',
      createdBy: req.admin._id
    });

    await maintenance.save();

    // Log admin action
    await AdminLog.create({
      adminId: req.admin._id,
      action: isActive ? 'Enable Maintenance Mode' : 'Disable Maintenance Mode',
      details: isActive ? `Maintenance enabled: ${message}` : 'Maintenance disabled'
    });

    res.status(201).json(maintenance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/maintenance', authenticateAdmin, async (req, res) => {
  try {
    const { isActive, scheduledFrom, scheduledTo, message } = req.body;

    const maintenance = await Maintenance.findOneAndUpdate(
      {},
      {
        isActive,
        scheduledFrom,
        scheduledTo,
        message: message || 'The site is currently under maintenance. Please check back later.',
        updatedAt: new Date()
      },
      { new: true, upsert: true }
    );

    // Log admin action
    await AdminLog.create({
      adminId: req.admin._id,
      action: 'Update Maintenance Settings',
      details: `Maintenance ${isActive ? 'enabled' : 'disabled'}: ${message}`
    });

    res.json(maintenance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Public maintenance status route
app.get('/api/maintenance', async (req, res) => {
  try {
    const maintenance = await Maintenance.findOne({ isActive: true });
    if (!maintenance) {
      return res.json({ isActive: false });
    }

    // Check if scheduled maintenance is active
    const now = new Date();
    if (maintenance.scheduledFrom && maintenance.scheduledTo) {
      if (now >= maintenance.scheduledFrom && now <= maintenance.scheduledTo) {
        return res.json({
          isActive: true,
          message: maintenance.message,
          scheduledFrom: maintenance.scheduledFrom,
          scheduledTo: maintenance.scheduledTo
        });
      } else {
        return res.json({ isActive: false });
      }
    }

    res.json({
      isActive: maintenance.isActive,
      message: maintenance.message
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Store active users
const activeUsers = new Map();

// Store active rooms with participants and start times
const activeRooms = new Map();

// Store banned users with ban end times
const bannedUsers = new Map();

// Socket.io connection handling with authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    // Allow anonymous connections
    socket.userId = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Allow anonymous connections even if token is invalid
      socket.userId = null;
      return next();
    }

    // Check if user is banned
    const banEndTime = bannedUsers.get(decoded.id);
    if (banEndTime && new Date() < banEndTime) {
      return socket.emit('error', { message: 'You are temporarily banned due to violation. Please try again later.' });
    }

    socket.userId = decoded.id;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'User ID:', socket.userId);

  // User joins
  socket.on('user-join', async (userData) => {
    try {
      let user;

      if (socket.userId) {
        // Authenticated user
        user = await User.findById(socket.userId);
        if (!user) return socket.emit('error', { message: 'User not found' });

        user.socketId = socket.id;
        user.isOnline = true;
        user.connectedAt = new Date();
        await user.save();
      } else {
        // Anonymous user - create a temporary user object
        user = {
          _id: socket.id,
          name: userData.isAnonymous ? 'Anonymous' : userData.name,
          email: null,
          country: userData.country,
          gender: userData.gender,
          socketId: socket.id,
          isOnline: true,
          isAnonymous: userData.isAnonymous || true,
          connectedAt: new Date()
        };
      }

      activeUsers.set(socket.id, user);

      socket.emit('user-joined', { message: 'Successfully joined!' });

      // Broadcast updated user list
      io.emit('user-list-updated', Array.from(activeUsers.values()));
    } catch (error) {
      socket.emit('error', { message: 'Failed to join' });
    }
  });

  // Find match
  socket.on('find-match', (preferences) => {
    const currentUser = activeUsers.get(socket.id);
    if (!currentUser) return;

    // Store preferences for future matching (like skip functionality)
    currentUser.preferences = preferences;

    const availableUsers = Array.from(activeUsers.values()).filter(user =>
      user.socketId !== socket.id &&
      user.isOnline &&
      (!preferences.gender || user.gender === preferences.gender || user.isAnonymous) &&
      (!preferences.country || user.country === preferences.country || user.isAnonymous)
    );

    if (availableUsers.length > 0) {
      const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];

      // Create room
      const roomId = `room_${socket.id}_${randomUser.socketId}`;

      // Store room info
      activeRooms.set(roomId, {
        participants: [socket.id, randomUser.socketId],
        startTime: new Date()
      });

      // Join both users to the room
      socket.join(roomId);
      io.to(randomUser.socketId).emit('match-found', { roomId, matchedUser: currentUser });
      socket.emit('match-found', { roomId, matchedUser: randomUser });

      // Remove both users from available list
      activeUsers.delete(socket.id);
      activeUsers.delete(randomUser.socketId);

      io.emit('user-list-updated', Array.from(activeUsers.values()));
    } else {
      socket.emit('no-match-found', { message: 'No available users found' });
    }
  });

  // Video call events
  socket.on('offer', (data) => {
    io.to(data.target).emit('offer', data);
  });

  socket.on('answer', (data) => {
    io.to(data.target).emit('answer', data);
  });

  socket.on('ice-candidate', (data) => {
    io.to(data.target).emit('ice-candidate', data);
  });

  // Chat messages
  socket.on('send-message', async (data) => {
    try {
      const currentUser = activeUsers.get(socket.id);
      const senderName = currentUser ? currentUser.name : 'Anonymous';

      // Check for restricted words
      const restrictedWords = await RestrictedWord.find();
      const message = data.message.toLowerCase();
      const flaggedWords = restrictedWords.filter(word => message.includes(word.word.toLowerCase())).map(word => word.word);

      const isViolation = flaggedWords.length > 0;

      // Log the message
      await ChatLog.create({
        senderName,
        message: data.message,
        roomId: data.roomId,
        isViolation,
        flaggedWords
      });

      if (isViolation && socket.userId) {
        // Ban user for 15 seconds
        const banEndTime = new Date(Date.now() + 15 * 1000); // 15 seconds
        bannedUsers.set(socket.userId, banEndTime);

        // Disconnect the user
        socket.emit('violation-ban', {
          message: 'You have been temporarily banned for 15 seconds due to using prohibited words.',
          banDuration: 15
        });

        // Disconnect after a short delay to allow the message to be sent
        setTimeout(() => {
          socket.disconnect(true);
        }, 1000);

        // Log the violation
        await AdminLog.create({
          action: 'User Violation Ban',
          details: `User ${senderName} banned for 15 seconds due to words: ${flaggedWords.join(', ')}`,
          targetUserId: socket.userId
        });
      }

      // Emit the message to the room
      socket.to(data.roomId).emit('receive-message', data);
    } catch (error) {
      console.error('Error handling send-message:', error);
    }
  });

  // Chat message from room
  socket.on('chat-message', (data) => {
    const { roomId, messageData } = data;
    // Broadcast the message to all users in the room
    socket.to(roomId).emit('chat-message', messageData);
  });

  // End call
  socket.on('end-call', (data) => {
    socket.to(data.roomId).emit('call-ended');
  });

  // Skip chat - find new match
  socket.on('skip-chat', (data) => {
    const currentUser = activeUsers.get(socket.id);
    if (!currentUser) return;

    // Add current user back to available users
    activeUsers.set(socket.id, currentUser);

    // Find a new match
    const availableUsers = Array.from(activeUsers.values()).filter(user =>
      user.socketId !== socket.id &&
      user.isOnline &&
      (!currentUser.preferences?.gender || user.gender === currentUser.preferences?.gender || user.isAnonymous) &&
      (!currentUser.preferences?.country || user.country === currentUser.preferences?.country || user.isAnonymous)
    );

    if (availableUsers.length > 0) {
      const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];

      // Create new room
      const newRoomId = `room_${socket.id}_${randomUser.socketId}`;

      // Store room info
      activeRooms.set(newRoomId, {
        participants: [socket.id, randomUser.socketId],
        startTime: new Date()
      });

      // Join both users to the new room
      socket.join(newRoomId);
      io.to(randomUser.socketId).emit('skip-matched', {
        roomId: newRoomId,
        matchedUser: currentUser
      });
      socket.emit('skip-matched', {
        roomId: newRoomId,
        matchedUser: randomUser
      });

      // Remove both users from available list
      activeUsers.delete(socket.id);
      activeUsers.delete(randomUser.socketId);

      io.emit('user-list-updated', Array.from(activeUsers.values()));
    } else {
      socket.emit('no-match-found', { message: 'No available users found' });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    activeUsers.delete(socket.id);

    // Clean up rooms where this socket was a participant
    for (const [roomId, room] of activeRooms.entries()) {
      if (room.participants.includes(socket.id)) {
        // Notify the other participant
        const otherParticipant = room.participants.find(id => id !== socket.id);
        if (otherParticipant) {
          io.to(otherParticipant).emit('call-ended');
        }
        activeRooms.delete(roomId);
        break; // Assuming a socket is only in one room
      }
    }

    io.emit('user-list-updated', Array.from(activeUsers.values()));
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
