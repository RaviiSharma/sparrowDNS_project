import express from "express";
import dotenv from "dotenv";
import dnsRoutes from "./routes/dnsRoutes.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";

import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import apiKeyRoutes from "./routes/apiKeyRoutes.js";
import domainRoute from "./routes/domainRoute.js";
import nameserverRoute from "./routes/nameserverRoutes.js";
import networkStatusRoutes from "./routes/networkStatusRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import resellerRoutes from "./routes/resellerRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";
import integrationsRoutes from "./routes/integrationsRoutes.js";

import { startWhoisCronScheduler } from "./scheduled/cronWhoisCheck.js"; // Adjust path as needed

import connectDB from "./config/db.js";

dotenv.config();
connectDB();

/** automatically build up the historical dataset in MongoDB for dashboard comparisons         */

import cron from "node-cron";
import { fetchDNSQueryStats } from "./services/powerdnsService.js";
import morgan from "morgan";

cron.schedule("0 * * * *", async () => {
  await fetchDNSQueryStats();
  console.log("Hourly DNS stats saved to MongoDB at:", new Date());
});

const app = express();
// app.use(cors()); // works for all routes, or use custom in controller above
app.use(morgan("dev"));

// 🟢 Body Parser Middleware (important)
app.use(express.json()); //
app.use(
  cors({
    origin: process.env.ORIGIN,
    credentials: true,
  }),
);
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "Api working",
  });
});

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/dns", dnsRoutes);
app.use("/api/domain", domainRoute);
app.use("/api/nameserver", nameserverRoute);
app.use("/api/apikey", apiKeyRoutes);
app.use("/api/networkStatus", networkStatusRoutes);

app.use("/api/billing", billingRoutes);
app.use("/api/plan", planRoutes);
app.use("/api/admin", adminRoutes);

// New routes
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reseller", resellerRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/integrations", integrationsRoutes);

/** To check cron namserver call the startWhoisCronScheduler() */
// Start scheduler but skip the initial immediate run to avoid checks on server start
startWhoisCronScheduler({ runAtStartup: false });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
