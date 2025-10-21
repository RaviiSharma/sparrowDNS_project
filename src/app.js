import express from 'express';
import dotenv from 'dotenv';
import dnsRoutes from './routes/dnsRoutes.js';

import User from "./models/userModel.js";
// import zoneMeta from "./models/zoneMetaModel.js";
// import activityLog from "./models/activityLogModel.js";
// import settings from "./models/settingsModel.js";
// import apiKey from "./models/apiKeyModel.js";


import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const app = express();

// 🟢 Body Parser Middleware (important)
app.use(express.json()); // 
app.use(express.urlencoded({ extended: true }));

app.use('/api', dnsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
