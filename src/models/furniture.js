import { Schema, model } from 'mongoose';
const furnitureSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Furniture name is required'],
      trim: true,
      unique: true,
    },
    price: {
      type: Number,
      required: [true, 'Furniture price is required'],
      min: [0, 'Price cannot be negative'],
    },
  },
  { versionKey: false, timestamps: true },
);

export const Furniture = model('Furniture', furnitureSchema);
