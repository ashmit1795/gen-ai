import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { generateResponse } from "./chatbot.js";

dotenv.config();

const app = express();
app.use(cors());

const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.post("/generate", async (req, res) => { 
    const { message } = req.body;

    console.log("Received message:", message);

    const response = await generateResponse(message);

    res.status(200).json({ message: response });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});