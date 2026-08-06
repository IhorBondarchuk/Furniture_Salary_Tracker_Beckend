import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { HttpError } from '../utils/HttpError.js';

const { JWT_SECRET, JWT_REFRESH_SECRET } = process.env;

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '30d';

const generateTokens = id => {
  const accessToken = jwt.sign({ id }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
  const refreshToken = jwt.sign({ id }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL,
  });
  return { accessToken, refreshToken };
};

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new HttpError(409, 'Email already in use');
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashPassword });

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new HttpError(401, 'Email or password is wrong');
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw new HttpError(401, 'Email or password is wrong');
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};

export const refreshUserTokens = async token => {
  if (!token) {
    throw new HttpError(401, 'Not authorized');
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_REFRESH_SECRET);
  } catch {
    throw new HttpError(401, 'Not authorized');
  }

  const user = await User.findById(payload.id);
  if (!user || user.refreshToken !== token) {
    throw new HttpError(401, 'Not authorized');
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};

export const logoutUser = async id => {
  const user = await User.findByIdAndUpdate(id, {
    accessToken: null,
    refreshToken: null,
  });
  if (!user) {
    throw new HttpError(401, 'Not authorized');
  }
};
