import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';
import { User } from '../models/user.js';

// Same DNS workaround as seed.js for `mongodb+srv://` connections.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const ROLES = ['worker', 'admin'];

// Usage: npm run set-role -- <email> [admin|worker]
async function setRole() {
  const [email, role = 'admin'] = process.argv.slice(2);

  if (!email || !ROLES.includes(role)) {
    console.error('Usage: npm run set-role -- <email> [admin|worker]');
    process.exit(1);
  }

  await mongoose.connect(process.env.DB_HOST);

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { $set: { role } },
    { new: true },
  );

  if (!user) {
    console.error(`Користувача з email ${email} не знайдено`);
  } else {
    console.log(`✔ ${user.email} (${user.name}) тепер має роль ${user.role}`);
  }

  await mongoose.disconnect();
  if (!user) process.exit(1);
}

setRole().catch(error => {
  console.error('Set role error:', error.message);
  process.exit(1);
});
