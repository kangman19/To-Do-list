import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { JWT_SECRET } from '../utils/constants.js';

interface SignupBody {
  username: string;
  password: string;
  email?: string;
}

interface LoginBody {
  username: string;
  password: string;
}

export class AuthController {
  // Signup
  signup = async (req: Request<{}, {}, SignupBody>, res: Response) => {
    try {
      const { username, password, email } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      if (username.length < 3) {
        return res.status(400).json({ message: 'Username must be at least 3 characters' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      const existingUser = await User.findOne({ where: { username } });

      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        id: Date.now(),
        username,
        email: email || null,
        password: hashedPassword,
        createdAt: new Date()
      });

      const token = jwt.sign(
        { userId: newUser.id, username: newUser.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Account created successfully!',
        token,
        userId: newUser.id,
        username: newUser.username
      });

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Server error during signup' });
    }
  };

  // Login
  login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      const user = await User.findOne({ where: { username } });

      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        message: 'Login successful!',
        token,
        userId: user.id,
        username: user.username
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  };
}