import { Document } from "@langchain/core/documents";
import { parsePDF } from "./parser.js";
import { chunkDocuments } from "./chunker.js";
import { addDocumentsToVectorStore } from "./vectorisation.js";

export async function indexDocument(filePath) {
    try {
		const parsed = await parsePDF(filePath);

		if (!parsed.text || !parsed.text.trim()) {
			throw new Error(`No extractable text found in ${filePath}. The PDF may be empty, image-based, or unsupported by the parser.`);
		}

		const chunks = await chunkDocuments(parsed.text);

		if (chunks.length === 0) {
			throw new Error(`Chunking produced no documents for ${filePath}.`);
		}

		const documents = chunks.map((chunk, index) => {
			return new Document({
				pageContent: chunk,
				metadata: {
					source: parsed.metadata.source,
					page: index + 1,
					totalPages: parsed.metadata.pages,
					info: parsed.metadata.info,
				},
			});
		});

		const result = await addDocumentsToVectorStore(documents);

		console.log(result);
    } catch (error) {
        console.error("Error indexing document:", error);
        throw error;
    }
}
