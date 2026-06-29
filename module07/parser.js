import fs from "node:fs/promises";
import { PDFParse } from "pdf-parse";

export async function parsePDF(filePath) {
	const buffer = await fs.readFile(filePath);

	const parser = new PDFParse({
		data: buffer,
	});

	const result = await parser.getText();

	await parser.destroy();

	return {
		text: result.text,
		metadata: {
			source: filePath,
			pages: result.total,
			info: result.info,
		},
	};
}
