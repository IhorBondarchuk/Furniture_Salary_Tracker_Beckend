import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import * as authServices from '../services/authServices.js';

const login = async (req, res) => {
  res.json(authServices.login(req.body));
};

export const authControllers = {
  login: ctrlWrapper(login),
};
