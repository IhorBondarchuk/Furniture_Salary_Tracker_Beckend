import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';
import { Furniture } from '../models/furniture.js';

// Some networks fail to resolve MongoDB Atlas SRV records via the default
// resolver — force a public DNS server so `mongodb+srv://` connections work.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const furnitureList = [
  { name: 'Szafa 2-drzwiowa', price: 45.0 },
  { name: 'Szafa 3-drzwiowa', price: 62.5 },
  { name: 'Szafa narożna', price: 78.0 },
  { name: 'Szafa przesuwna', price: 95.0 },
  { name: 'Komoda 3-szufladowa', price: 28.0 },
  { name: 'Komoda 4-szufladowa', price: 34.5 },
  { name: 'Komoda pod TV', price: 32.0 },
  { name: 'Łóżko 90x200', price: 40.0 },
  { name: 'Łóżko 140x200', price: 55.0 },
  { name: 'Łóżko 160x200', price: 62.0 },
  { name: 'Łóżko 180x200', price: 68.0 },
  { name: 'Łóżko kontynentalne', price: 89.0 },
  { name: 'Rama łóżka z zagłówkiem', price: 47.0 },
  { name: 'Biurko proste', price: 26.0 },
  { name: 'Biurko narożne', price: 39.0 },
  { name: 'Biurko z szufladami', price: 33.5 },
  { name: 'Regał 5-półkowy', price: 30.0 },
  { name: 'Regał narożny', price: 35.0 },
  { name: 'Regał na książki', price: 27.5 },
  { name: 'Stół rozkładany', price: 58.0 },
  { name: 'Stół kuchenny', price: 42.0 },
  { name: 'Stolik kawowy', price: 24.0 },
  { name: 'Stolik RTV', price: 29.0 },
  { name: 'Krzesło tapicerowane', price: 12.5 },
  { name: 'Krzesło drewniane', price: 9.0 },
  { name: 'Taboret', price: 6.5 },
  { name: 'Hoker barowy', price: 14.0 },
  { name: 'Fotel wypoczynkowy', price: 48.0 },
  { name: 'Fotel obrotowy', price: 52.0 },
  { name: 'Wersalka', price: 65.0 },
  { name: 'Narożnik', price: 90.0 },
  { name: 'Sofa 3-osobowa', price: 72.0 },
  { name: 'Sofa 2-osobowa', price: 60.0 },
  { name: 'Szafka nocna', price: 15.0 },
  { name: 'Szafka łazienkowa', price: 31.0 },
  { name: 'Szafka RTV wisząca', price: 36.0 },
  { name: 'Witryna', price: 44.0 },
  { name: 'Garderoba modułowa', price: 110.0 },
  { name: 'Zabudowa kuchenna', price: 130.0 },
  { name: 'Blat kuchenny', price: 25.0 },
  { name: 'Ława pod TV', price: 33.0 },
  { name: 'Lustro stojące', price: 18.0 },
  { name: 'Wieszak stojący', price: 11.0 },
  { name: 'Półka wisząca', price: 8.5 },
];

async function seed() {
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
}

seed().catch(error => {
  console.error('Seed error:', error.message);
  process.exit(1);
});
