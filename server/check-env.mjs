import dotenv from "dotenv";
import dns from "dns";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.join(__dirname, ".env") });
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const uri = process.env.MONGO_URI || "";
console.log("MONGO_URI prefix :", uri.substring(0, 25) + "...");
console.log("Is Atlas URI      :", uri.startsWith("mongodb+srv"));
console.log("Has placeholder   :", uri.includes("<password>") || uri.includes("<user>"));
console.log("Has space/newline :", /\s/.test(uri));

console.log("\nConnecting...");
try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log("Connected to      :", mongoose.connection.host);
  await mongoose.disconnect();
} catch (err) {
  console.error("Connection failed :", err.message);
}
