const AWS = require("aws-sdk");
const { Pool } = require("pg");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

/* -----------------------------
   AWS CONFIG
------------------------------*/
AWS.config.update({
  region: "ap-south-1"
});

const sqs = new AWS.SQS();
const sns = new AWS.SNS();

const dbPort = Number.parseInt(process.env.DB_PORT || "5433", 10);

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
   POLL SQS
------------------------------*/
async function pollQueue() {
  try {
    if (!process.env.SQS_URL) {
      console.error("Worker error: Missing SQS_URL");
      return;
    }

    const data = await sqs.receiveMessage({
      QueueUrl: process.env.SQS_URL,
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 10,
    }).promise();

    if (!data.Messages) {
      return;
    }

    for (const msg of data.Messages) {
      const body = JSON.parse(msg.Body);

      console.log("📩 Received:", body);

      /* 1. Save to DB */
      await pool.query(
        "INSERT INTO registrations (course_id, student_name, email) VALUES ($1,$2,$3)",
        [body.course_id, body.student_name, body.email]
      );

      console.log("💾 Saved to DB");

      /* 2. Send SNS Notification */
      if (process.env.SNS_TOPIC) {
        await sns.publish({
          TopicArn: process.env.SNS_TOPIC,
          Message: `New student ${body.student_name} registered for course ${body.course_id}`
        }).promise();

        console.log("📣 SNS notification sent");
      } else {
        console.log("ℹ️ SNS_TOPIC not set, skipping notification");
      }

      /* 3. Delete message from queue */
      await sqs.deleteMessage({
        QueueUrl: process.env.SQS_URL,
        ReceiptHandle: msg.ReceiptHandle
      }).promise();

      console.log("🗑️ Message deleted");
    }

  } catch (err) {
    console.error("Worker error:", err);
  }
}

/* -----------------------------
   RUN LOOP
------------------------------*/
setInterval(pollQueue, 5000);