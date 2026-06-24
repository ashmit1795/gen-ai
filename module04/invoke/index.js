import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// export async function main() {
// 	const response = await groq.chat.completions.create({
// 		messages: [
// 			// {
// 			// 	role: "user",
// 			// 	content: "Hello, What's Up ? ",
// 			// },
// 			{
// 				role: "user",
// 				content: "Who are you ?",
// 				/*
// 				Nice to meet you. I am Jarvis, a large language model created by OpenAI, and I'm here to assist you with any questions or topics you'd like to discuss. I'm a computer program designed to understand and generate human-like text, so I can have conversations, provide information, and even help with creative writing or problem-solving. I'm constantly learning and improving, so please bear with me if I make any mistakes. How can I help you today?
// 				*/
// 			},
// 			{
// 				role: "system",
// 				content:
// 					"You are a helpful assistant made by Ashmit. You are Jarvis, a large language model trained by OpenAI. You are here to help answer any questions the user may have or just chat if they'd like.",
// 			}, // role can be user, assistant, or system # user: user message, assistant: assistant message, system: system message
// 		],
// 		model: "llama-3.3-70b-versatile",
// 	});

// 	console.log(response);
// 	/*
// 		{
// 			id: 'chatcmpl-2bfee01e-d077-4d01-b65b-58a590f35b0d',
// 			object: 'chat.completion',
// 			created: 1782289410,
// 			model: 'llama-3.3-70b-versatile',
// 			choices: [
// 				{
// 					index: 0,
// 					message: [Object],
// 					logprobs: null,
// 					finish_reason: 'stop'
// 				}
// 			],
// 			usage: {
// 				queue_time: 0.195777079,
// 				prompt_tokens: 41,
// 				prompt_time: 0.012544618,
// 				completion_tokens: 29,
// 				completion_time: 0.126891197,
// 				total_tokens: 70,
// 				total_time: 0.139435815
// 			},
// 			usage_breakdown: null,
// 			system_fingerprint: 'fp_45180df409',
// 			x_groq: { id: 'req_01kvwbm9t2e9cbvzttg6a7xd7d', seed: 1710473706 },
// 			service_tier: 'on_demand'
// 		}
// 	*/
// 	console.log(response.choices[0]?.message || "");
// 	/*
// 		{
// 			role: 'assistant',
// 			content: "Hello, not much. I'm here to help answer any questions you may have or just chat if you'd like. How's your day going so far?"
// 		}
// 	*/

// 	console.log(response.choices[0]?.message?.content || "");
// 	// Hello, not much. I'm here to help answer any questions you may have or just chat if you'd like. How's your day going so far?
// }

// Prompt Message Structure


export async function main() {
	const response = await groq.chat.completions.create({
		// temperature: 0.7, // controls the randomness of the output, higher values (e.g., 0.8) make the output more random, while lower values (e.g., 0.2) make it more focused and deterministic
		// max_completion_tokens: 100, // maximum number of tokens to generate in the completion
		// stop: ["\n\n"], // stop sequence for the model to stop generating further text
		// frequency_penalty: 0.5, // controls the model's tendency to repeat the same lines verbatim, higher values (e.g., 0.5) make the model less likely to repeat itself
		// presence_penalty: 0.5, // controls the model's tendency to talk about new topics, higher values (e.g., 0.5) make the model more likely to introduce new topics
		response_format: {
			type: "json_schema",
			json_schema: {
				name: "product_review",
				strict: true,
				schema: {
					type: "object",
					properties: {
						product_name: { type: "string" },
						rating: { type: "number" },
						sentiment: {
							type: "string",
							enum: ["positive", "negative", "neutral"],
						},
						key_features: {
							type: "array",
							items: { type: "string" },
						},
					},
					required: ["product_name", "rating", "sentiment", "key_features"],
					additionalProperties: false,
				},
			},
		},
		messages: [
			{
				role: "user",
				content: "Review: These headphones arrived quickly and look great, but the left earcup stopped working after just a week of use.",
			}, // { sentiment: 'Negative', score: 4/10 }
			{
				role: "system",
				content:
					"You are Jarvis, a smart review grader assistant made by Ashmit. Your task is to analyse and grade the given review and return the sentiment of the review as Positive, Negative or Neutral. You should also provide a score out of 10 for the review based on its quality and helpfulness.",
			}, // We structure the output in prompt itself to ensure the model returns the output in the desired format - this is the first way to control the output of the model. The second way is to use the `response_format` parameter in the request, which allows you to specify a structured format for the model's response. This can be useful for ensuring that the model's output is consistent and easy to parse.
			// content: "You are Jarvis, a smart review grader assistant made by Ashmit. Your task is to analyse and grade the given review and return the sentiment of the review as Positive, Negative or Neutral. You should also provide a score out of 10 for the review based on its quality and helpfulness. Your response should be in the following format: { sentiment: 'Positive/Negative/Neutral', score: X/10 }"
		],
		// model: "llama-3.3-70b-versatile", // this model doesn't support response format `json_schema`.
		model: "meta-llama/llama-4-scout-17b-16e-instruct", // this model supports response format `json_schema`.

		/*
			{
				"product_name": "headphones",
				"rating": 4,
				"sentiment": "negative",
				"key_features": ["fast shipping", "good design", "poor durability"]
			}
		*/
	});


	console.log(response.choices[0]?.message?.content || "{}");
}


main().catch((error) => {
	console.log(error);
});
