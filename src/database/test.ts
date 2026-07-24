import { Client } from "pg";
import { Signer } from "@aws-sdk/rds-signer";

async function test() {
  const signer = new Signer({
    region: "us-east-1",
    hostname: process.env.DB_HOST!,
    port: 5432,
    username: process.env.DB_USERNAME!,
  });

  const password = await signer.getAuthToken();

  const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    database: process.env.DB_NAME,
    password,
    port: 5432,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await client.connect();
  console.log("✅ Connected with SSL");
}

test().catch(console.error);