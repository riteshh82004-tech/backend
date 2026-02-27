import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const CORS_ORIGEN = process.env.CORS_ORIGEN || "http://localhost:5173";
export const CLIENT_URL = process.env.CLIENT_URL || CORS_ORIGEN;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
export const JWT_ALGORITHM = process.env.JWT_ALGORITHM;
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const privateKey = Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString('utf8');
export const publicKey = Buffer.from(process.env.JWT_PUBLIC_KEY, 'base64').toString('utf8');
// console.log(privateKey);
// console.log(publicKey);


