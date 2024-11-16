require("dotenv").config();

const PORT: string = process.env.PORT!;
const MONGODB_URI: string = process.env.MONGODB_URI!;
const SALT_ROUNDS: number = +process.env.SALT_ROUNDS!;
const SECRET: string = process.env.SECRET!;

const config = { PORT, MONGODB_URI, SALT_ROUNDS, SECRET };

export default config;
