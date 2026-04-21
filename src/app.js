import express from 'express';
import dotenv from 'dotenv';
import dnsRoutes from './routes/dnsRoutes.js';
import cors from 'cors';

import User from "./models/userModel.js";

import connectDB from "./config/db.js";

dotenv.config();
connectDB();


/** automatically build up the historical dataset in MongoDB for dashboard comparisons         */

import cron from 'node-cron';
import { fetchDNSQueryStats } from './services/powerdnsService.js';

cron.schedule('0 * * * *', async () => {
  await fetchDNSQueryStats();
  console.log('Hourly DNS stats saved to MongoDB at:', new Date());
});

const app = express();

// 🟢 Body Parser Middleware (important)
app.use(express.json()); // 
app.use(express.urlencoded({ extended: true }));
app.use(cors({
   origin:"http://localhost:3000",
}))

app.use('/api', dnsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
