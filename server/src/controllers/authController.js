import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function tokenFor(user) { return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' }); }
function publicUser(user) { return { id: user._id, name: user.name, email: user.email, bio: user.bio, avatarUrl: user.avatarUrl }; }

export async function register(req, res) {
  const { name, email, password, bio, avatarUrl } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash, bio, avatarUrl });
  res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ token: tokenFor(user), user: publicUser(user) });
}
