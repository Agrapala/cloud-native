const { Pool } = require("pg");
const AWS = require("aws-sdk");

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const sqs = new AWS.SQS({ region: "ap-south-1" });
const sns = new AWS.SNS({ region: "ap-south-1" });

async function pollQueue() {
  const data = await sqs.receiveMessage({
    QueueUrl: process.env.SQS_URL,
    MaxNumberOfMessages: 1,
    WaitTimeSeconds: 10,
  }).promise();

  if (!data.Messages) return;

  for (const msg of data.Messages) {
    const body = JSON.parse(msg.Body);

    await pool.query(
      "INSERT INTO registrations(course_id, student_name, email) VALUES ($1,$2,$3)",
      [body.course_id, body.name, body.email]
    );

    await sns.publish({
      TopicArn: process.env.SNS_TOPIC,
      Message: `New student ${body.name} registered`,
    }).promise();

    await sqs.deleteMessage({
      QueueUrl: process.env.SQS_URL,
      ReceiptHandle: msg.ReceiptHandle,
    }).promise();
  }
}

setInterval(pollQueue, 5000);