import { Types } from 'mongoose';
import { WorkEntry } from '../models/workEntry.js';
import { Furniture } from '../models/furniture.js';
import { User } from '../models/user.js';
import { HttpError } from '../utils/HttpError.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

const ensureFurnitureExists = async id => {
  if (!(await Furniture.exists({ _id: id }))) {
    throw new HttpError(404, 'Furniture not found');
  }
};

export const listWorkEntries = filter => {
  return WorkEntry.find(filter).populate('furniture', 'name price').sort({ date: -1 });
};

export const getWorkEntryById = async id => {
  const entry = await WorkEntry.findById(id).populate('furniture', 'name price');
  if (!entry) {
    throw new HttpError(404, 'Work entry not found');
  }
  return entry;
};

export const createWorkEntry = async payload => {
  await ensureFurnitureExists(payload.furniture);
  if (!(await User.exists({ _id: payload.worker }))) {
    throw new HttpError(404, 'Worker not found');
  }
  return WorkEntry.create(payload);
};

export const updateWorkEntry = async (id, payload) => {
  if (payload.furniture) {
    await ensureFurnitureExists(payload.furniture);
  }
  const entry = await WorkEntry.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!entry) {
    throw new HttpError(404, 'Work entry not found');
  }
  return entry;
};

export const deleteWorkEntry = async id => {
  const entry = await WorkEntry.findByIdAndDelete(id);
  if (!entry) {
    throw new HttpError(404, 'Work entry not found');
  }
  return entry;
};

// Salary is calculated on demand: quantity assembled × the furniture's
// *current* catalog price. There is no price snapshot on the work entry
// itself, so a $lookup joins each entry to the live catalog price.
export const calculateSalary = async ({ worker, from, to }) => {
  // a date-only `to` covers that whole day, not just its first millisecond
  const dateFilter = DATE_ONLY_RE.test(to)
    ? { $gte: new Date(from), $lt: new Date(new Date(to).getTime() + DAY_MS) }
    : { $gte: new Date(from), $lte: new Date(to) };

  const matchStage = {
    worker: new Types.ObjectId(worker),
    date: dateFilter,
  };

  const items = await WorkEntry.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: Furniture.collection.name,
        localField: 'furniture',
        foreignField: '_id',
        as: 'furnitureDetails',
      },
    },
    { $unwind: '$furnitureDetails' },
    {
      $addFields: {
        lineTotal: { $multiply: ['$quantity', '$furnitureDetails.price'] },
      },
    },
    {
      $group: {
        _id: '$furniture',
        furnitureName: { $first: '$furnitureDetails.name' },
        price: { $first: '$furnitureDetails.price' },
        quantity: { $sum: '$quantity' },
        total: { $sum: '$lineTotal' },
      },
    },
    { $sort: { furnitureName: 1 } },
    {
      $project: {
        _id: 0,
        furnitureId: '$_id',
        furnitureName: 1,
        price: 1,
        quantity: 1,
        total: { $round: ['$total', 2] },
      },
    },
  ]);

  const totalSalary = Math.round(
    items.reduce((sum, item) => sum + item.total, 0) * 100,
  ) / 100;

  return {
    worker,
    period: { from, to },
    items,
    totalSalary,
  };
};
