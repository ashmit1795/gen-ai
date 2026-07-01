import Groq from "groq-sdk";
import readline from "node:readline/promises";
import { vectorStore } from "./vectorisation.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat() {
    const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
    });
    while (true) { 
        const userInput = await rl.question("You: ");
        if (userInput.toLowerCase() === "/bye") { 
			console.log("Goodbye!");
			break;
        }

        // retrieval logic to get relevant context from vector store can be added here
        const relevantDocuments = await vectorStore.similaritySearch(userInput, 3); // Retrieve top 3 relevant documents from the vector store

        const context = relevantDocuments.map(doc => doc.pageContent).join("\n\n");

        const SYSTEM_PROMPT = `You are a helpful assistant. Use the following retrieved context to answer the user's question. If the context does not contain the answer, respond with "I don't know."`;

        const userQuery = `Context:\n${context}\n\nUser's Question: ${userInput}`;
        const completions = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                {
                    role: "user",
                    content: userQuery,
                },
            ],
            model: "llama-3.3-70b-versatile",
        });
        console.log("Assistant: ", completions.choices[0].message.content);
    }

    rl.close();
}

chat();
