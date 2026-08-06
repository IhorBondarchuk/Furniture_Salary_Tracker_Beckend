import { Schema, model } from 'mongoose';

const workEntrySchema = new Schema(
  {
    worker: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Worker reference is required'],
    },
    furniture: {
      type: Schema.Types.ObjectId,
      ref: 'Furniture',
      required: [true, 'Furniture reference is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false, timestamps: true },
);

export const WorkEntry = model('WorkEntry', workEntrySchema);
