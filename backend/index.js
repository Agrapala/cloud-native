const express = require("express");
const { Pool } = require("pg");
const redis = require("redis");
const AWS = require("aws-sdk");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const dbPort = Number.parseInt(process.env.DB_PORT || "5433", 10);
const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = process.env.REDIS_PORT || "6379";
const redisUrl = process.env.REDIS_URL || `redis://${redisHost}:${redisPort}`;

/* -----------------------------
   PostgreSQL
------------------------------*/
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "password",
  database: process.env.DB_NAME || "coursesdb",
  port: dbPort,
});

/* -----------------------------
   Redis
------------------------------*/
const redisClient = redis.createClient({
  url: redisUrl,
});

redisClient.connect()
  .then(() => console.log("✅ Redis Connected"))
  .catch(err => console.error("Redis Error:", err));

/* -----------------------------
   AWS CONFIG
------------------------------*/
AWS.config.update({
  region: "ap-south-1"
});

const sqs = new AWS.SQS();

/* -----------------------------
   TEST
------------------------------*/
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

/* -----------------------------
   GET /courses (CACHE)
------------------------------*/
app.get("/courses", async (req, res) => {
  try {
    const cached = await redisClient.get("courses");

    if (cached) {
      console.log("🔥 Cache HIT");
      return res.json(JSON.parse(cached));
    }

    console.log("❄️ Cache MISS");

    const result = await pool.query("SELECT * FROM courses");

    await redisClient.setEx(
      "courses",
      600,
      JSON.stringify(result.rows)
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching courses");
  }
});

/* -----------------------------
   POST /register → SQS
------------------------------*/
app.post("/register", async (req, res) => {
  try {
    const { course_id, student_name, email } = req.body;

    if (!course_id || !student_name || !email) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const message = {
      course_id,
      student_name,
      email
    };

    await sqs.sendMessage({
      QueueUrl: process.env.SQS_URL,
      MessageBody: JSON.stringify(message),
    }).promise();

    console.log("📨 Sent to SQS:", message);

    res.json({ message: "Registration queued successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

/* -----------------------------
   START SERVER
------------------------------*/
app.listen(3000, () => {
  console.log("🚀 Backend running on port 3000");
});