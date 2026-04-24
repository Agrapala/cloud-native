const express = require("express");
const { Pool } = require("pg");
const redis = require("redis");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

/* -----------------------------
   PostgreSQL Connection
------------------------------*/
const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "password",
  database: "coursesdb",
  port: 5433,
});

/* -----------------------------
   Redis Connection
------------------------------*/
const redisClient = redis.createClient({
  url: "redis://localhost:6379",
});

redisClient.connect()
  .then(() => console.log("✅ Redis Connected"))
  .catch((err) => console.error("❌ Redis Error:", err));

/* -----------------------------
   Test API
------------------------------*/
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* -----------------------------
   GET /courses (WITH CACHE)
------------------------------*/
app.get("/courses", async (req, res) => {
  try {
    // 1. Check Redis cache
    const cachedData = await redisClient.get("courses");

    if (cachedData) {
      console.log("🔥 Cache HIT");
      return res.json(JSON.parse(cachedData));
    }

    console.log("❄️ Cache MISS - fetching from DB");

    // 2. Fetch from PostgreSQL
    const result = await pool.query("SELECT * FROM courses");

    // 3. Save to Redis (TTL = 10 minutes)
    await redisClient.setEx(
      "courses",
      600,
      JSON.stringify(result.rows)
    );

    return res.json(result.rows);

  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* -----------------------------
   POST /courses (Optional add data)
------------------------------*/
app.post("/courses", async (req, res) => {
  try {
    const { title, description, image_url } = req.body;

    const result = await pool.query(
      "INSERT INTO courses (title, description, image_url) VALUES ($1, $2, $3) RETURNING *",
      [title, description, image_url]
    );

    // IMPORTANT: invalidate cache
    await redisClient.del("courses");

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Insert failed" });
  }
});

/* -----------------------------
   Server Start
------------------------------*/
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});