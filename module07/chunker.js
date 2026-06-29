import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 100 }); // set chunk size and overlap, usually based on experience and the type of document you are working with

export async function chunkDocuments(pageContent) {
	return await splitter.splitText(pageContent);
}
