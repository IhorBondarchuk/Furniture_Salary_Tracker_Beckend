import { Furniture } from '../models/furniture.js';
import { HttpError } from '../utils/HttpError.js';

export const listFurniture = () => {
  return Furniture.find().sort({ name: 1 });
};

export const getFurnitureById = async id => {
  const furniture = await Furniture.findById(id);
  if (!furniture) {
    throw new HttpError(404, 'Furniture not found');
  }
  return furniture;
};

export const createFurniture = payload => {
  return Furniture.create(payload);
};

export const updateFurniture = async (id, payload) => {
  const furniture = await Furniture.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!furniture) {
    throw new HttpError(404, 'Furniture not found');
  }
  return furniture;
};

export const deleteFurniture = async id => {
  const furniture = await Furniture.findByIdAndDelete(id);
  if (!furniture) {
    throw new HttpError(404, 'Furniture not found');
  }
  return furniture;
};
