import { Furniture } from '../models/furniture.js';
import { WorkEntry } from '../models/workEntry.js';
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

// Salary is computed from the live catalog, so deleting an item that work
// entries still reference would silently drop that work from salaries.
export const deleteFurniture = async id => {
  if (await WorkEntry.exists({ furniture: id })) {
    throw new HttpError(409, 'Furniture is used in work entries and cannot be deleted');
  }
  const furniture = await Furniture.findByIdAndDelete(id);
  if (!furniture) {
    throw new HttpError(404, 'Furniture not found');
  }
  return furniture;
};
