import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import * as furnitureServices from '../services/furnitureServices.js';

const getAll = async (req, res) => {
  const furniture = await furnitureServices.listFurniture();
  res.json(furniture);
};

const getById = async (req, res) => {
  const furniture = await furnitureServices.getFurnitureById(req.params.id);
  res.json(furniture);
};

const create = async (req, res) => {
  const furniture = await furnitureServices.createFurniture(req.body);
  res.status(201).json(furniture);
};

const update = async (req, res) => {
  const furniture = await furnitureServices.updateFurniture(
    req.params.id,
    req.body,
  );
  res.json(furniture);
};

const remove = async (req, res) => {
  await furnitureServices.deleteFurniture(req.params.id);
  res.status(204).send();
};

export const furnitureControllers = {
  getAll: ctrlWrapper(getAll),
  getById: ctrlWrapper(getById),
  create: ctrlWrapper(create),
  update: ctrlWrapper(update),
  remove: ctrlWrapper(remove),
};
