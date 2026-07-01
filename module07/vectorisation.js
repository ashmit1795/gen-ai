import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import dotenv from "dotenv";
import { OpenAIEmbeddings } from "@langchain/openai";

dotenv.config();


const embeddings = new OpenAIEmbeddings({
	model: "text-embedding-3-small",
	apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new PineconeClient({
	apiKey: process.env.PINECONE_API_KEY,
});

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

export const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
	pineconeIndex,
	maxConcurrency: 5,
});

export async function addDocumentsToVectorStore(documents) {
	try {
		return await vectorStore.addDocuments(documents);
	} catch (error) {
		console.error("Error adding documents to vector store:", error);
		throw error;
	}
}
