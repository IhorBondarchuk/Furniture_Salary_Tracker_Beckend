import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  registerUser,
  loginUser,
  refreshUserTokens,
  logoutUser,
} from '../services/authServices.js';

const isProduction = process.env.NODE_ENV === 'production';

// In production the frontend and this API live on different domains
// (e.g. Vercel <-> Render), so the refresh cookie must be sent cross-site:
// that requires sameSite: 'none', which browsers only honor when secure: true.
// Locally (http://localhost) neither is needed/possible.
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

const register = async (req, res) => {
  const { user, accessToken, refreshToken } = await registerUser(req.body);

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(201).json({
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

const login = async (req, res) => {
  const { user, accessToken, refreshToken } = await loginUser(req.body);

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  res.json({
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

const refresh = async (req, res) => {
  const { refreshToken: cookieToken } = req.cookies;
  const { accessToken, refreshToken } = await refreshUserTokens(cookieToken);

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  res.json({ accessToken });
};

const logout = async (req, res) => {
  await logoutUser(req.user._id);
  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
  res.status(204).send();
};

const getCurrent = async (req, res) => {
  const { _id: id, name, email, role } = req.user;
  res.json({ id, name, email, role });
};

export const authControllers = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  refresh: ctrlWrapper(refresh),
  logout: ctrlWrapper(logout),
  getCurrent: ctrlWrapper(getCurrent),
};
