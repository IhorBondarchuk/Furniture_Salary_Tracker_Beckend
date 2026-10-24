import { createHash, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { HttpError } from '../utils/HttpError.js';

const { JWT_SECRET, JWT_REFRESH_SECRET, ADMIN_INVITE_CODE } = process.env;

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

// Admin self-registration requires ADMIN_INVITE_CODE; if it isn't set,
// admins can only be appointed via `npm run set-role`.
const isValidAdminCode = code => {
  if (!ADMIN_INVITE_CODE || !code) {
    return false;
  }
  // compare hashes so the check takes the same time regardless of the input
  const expected = createHash('sha256').update(ADMIN_INVITE_CODE).digest();
  const actual = createHash('sha256').update(code).digest();
  return timingSafeEqual(expected, actual);
};

export const registerUser = async ({ name, email, password, role, adminCode }) => {
  if (role === 'admin' && !isValidAdminCode(adminCode)) {
    throw new HttpError(403, 'Invalid admin code');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new HttpError(409, 'Email already in use');
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashPassword, role });

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  await user.save();

  return { user, accessToken, refreshToken };
};

// The requested role must match the account. Admin login also requires
// the admin code while ADMIN_INVITE_CODE is set (without it, admins
// appointed via `npm run set-role` log in with the password alone).
const checkLoginRole = (user, role, adminCode) => {
  if (user.role !== role) {
    throw new HttpError(
      403,
      user.role === 'admin' ? 'This is an admin account' : 'This account is not an admin',
    );
  }
  if (role === 'admin' && ADMIN_INVITE_CODE && !isValidAdminCode(adminCode)) {
    throw new HttpError(403, 'Invalid admin code');
  }
};

export const loginUser = async ({ email, password, role, adminCode }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new HttpError(401, 'Email or password is wrong');
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw new HttpError(401, 'Email or password is wrong');
  }

  // only after the password check, so roles of other accounts don't leak
  checkLoginRole(user, role, adminCode);

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
