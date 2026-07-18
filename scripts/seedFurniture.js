import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';
import { Furniture } from '../src/models/furniture.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const furnitureList = [
  { name: 'Adria narożnik', price: 57.58 },
  { name: 'Alex narożnik', price: 38.94 },
  { name: 'Amber narożnik', price: 41.44 },
  { name: 'Ana narożnik', price: 36.75 },
  { name: 'Ana pufa', price: 9.8 },
  { name: 'Anton big sofa', price: 61.84 },
  { name: 'Axel narożnik', price: 62.64 },
  { name: 'Belmondo narożnik', price: 29.43 },
  { name: 'Berg big sofa', price: 32.94 },
  { name: 'Bonika narożnik', price: 86.94 },
  { name: 'Borno big sofa', price: 45.96 },
  { name: 'Borno narożnik', price: 43.82 },
  { name: 'Canyon narożnik', price: 90.64 },
  { name: 'Canyon xl', price: 90.64 },
  { name: 'Cube narożnik', price: 31.54 },
  { name: 'Danny narożnik', price: 35.6 },
  { name: 'Diun narożnik', price: 63.31 },
  { name: 'Diun big sofa', price: 45.0 },
  { name: 'Evita big sofa', price: 57.73 },
  { name: 'Fargo narożnik', price: 51.7 },
  { name: 'Fenix narożnik', price: 19.0 },
  { name: 'Fenix pufa', price: 70.14 },
  { name: 'Gomez fotel', price: 8.55 },
  { name: 'Gomez kanapa', price: 70.87 },
  { name: 'Gomez narożnik', price: 89.51 },
  { name: 'Italia kanapa', price: 30.6 },
  { name: 'Kloe i', price: 143.02 },
  { name: 'Kloe ii', price: 97.84 },
  { name: 'Kloe iii', price: 107.5 },
  { name: 'Lago narożnik', price: 77.47 },
  { name: 'Marey', price: 57.37 },
  { name: 'Massimo narożnik', price: 97.84 },
  { name: 'Montana u narożnik', price: 78.35 },
  { name: 'Nuovo narożnik', price: 33.39 },
  { name: 'Nuovo pufa', price: 15.0 },
  { name: 'Santorini narożnik', price: 103.93 },
  { name: 'Sky narożnik', price: 57.58 },
  { name: 'Sofi big sofa', price: 59.53 },
  { name: 'Sofi pufa', price: 12.16 },
  { name: 'Solar rec l-form', price: 51.91 },
  { name: 'Solar u narożnik', price: 92.46 },
  { name: 'Vesta narożnik', price: 73.5 },
  { name: 'Wave big sofa', price: 41.09 },
  { name: 'Wave narożnik', price: 48.89 },
];

await mongoose.connect(process.env.DB_HOST);

let created = 0;
let updated = 0;

for (const item of furnitureList) {
  const result = await Furniture.findOneAndUpdate(
    { name: item.name },
    { $set: { price: item.price } },
    { upsert: true, runValidators: true, includeResultMetadata: true },
  );
  if (result.lastErrorObject?.updatedExisting) {
    updated += 1;
    console.log(`↻ оновлено: ${item.name} — ${item.price}`);
  } else {
    created += 1;
    console.log(`✔ створено: ${item.name} — ${item.price}`);
  }
}

console.log(
  `\nГотово: ${furnitureList.length} позицій (нових: ${created}, оновлено: ${updated})`,
);
await mongoose.disconnect();
