import dns from 'node:dns';
import mongoose from 'mongoose';
import app from './app.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);

const { DB_HOST, PORT = 3000 } = process.env;

mongoose
  .connect(DB_HOST)
  .then(() => {
    console.log('Database connection successful');
    app.listen(PORT, () => {
      console.log(`Server running. Use our API on port: ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Database connection error:', error.message);
    process.exit(1);
  });
