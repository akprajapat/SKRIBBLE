import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || [];
console.log("allowed orgins for http server", allowedOrigins)
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // allow cookies/headers
  })
);

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is up and running!' });
});

export default app;