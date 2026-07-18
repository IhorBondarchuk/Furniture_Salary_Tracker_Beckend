import { Schema, model } from 'mongoose';

const workEntrySchema = new Schema(
  {
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
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner reference is required'],
    },
  },
  { versionKey: false, timestamps: true },
);

workEntrySchema.index({ furniture: 1, owner: 1, date: 1 }, { unique: true });

export const WorkEntry = model('WorkEntry', workEntrySchema);
