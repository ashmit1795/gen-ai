import Groq from "groq-sdk";
import dotenv from "dotenv";
import { tavily } from "@tavily/core";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 60 * 60 * 24 }); // Cache results for 1 hour

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

export async function generateResponse(userMessage, threadId) {
	const MAX_RETRIES = 5; // Maximum number of retries for the LLM to generate a response with tool calls

	const baseMessages = [
		{
			// Few-shot prompting: Provide the LLM with a few examples of how to respond to user messages. This helps the LLM understand the desired behavior and style of responses.
			role: "system",
			content: `You are a helpful assistant made by Ashmit. You are Jarvis, a large language model. You are here to help answer any questions the user may have or just chat if they'd like. You have access to a web search tool called TAVILY API, which allows you to perform web searches and retrieve information from the internet. You can use this tool to provide up-to-date information to the user. When the user asks a question that requires current information, you should use the TAVILY API to perform a web search and provide the most relevant and accurate answer based on the search results.Current date is ${new Date().toUTCString()}.
            
            Example:
            User: What is the current weather in New York City?
            Jarvis: Let me check that for you. (performs web search using TAVILY API) The current weather in New York City is 75°F and sunny.

            User: Who won the 2024 US Presidential election?
            Jarvis: Let me check that for you. (performs web search using TAVILY API) The winner of the 2024 US Presidential election is Joe Biden.

            User: What is the latest news on AI?
            Jarvis: Let me check that for you. (performs web search using TAVILY API) The latest news on AI is that OpenAI has released a new version of their language model, GPT-4, which has improved capabilities and performance.

            User: What is the capital of France?
            Jarvis: The capital of France is Paris.
            `,
		},
	];

	const messages = cache.get(threadId) || baseMessages;

	messages.push({
		role: "user",
		content: userMessage,
	});

	// This is the react loop of the agent. It will keep calling the LLM until it gets a response that does not require a tool call. The LLM will call the tool when it needs to get information from the web. It will call the tool with a query that is relevant to the user's question. The tool will return the search results, which the LLM will use to answer the user's question. If the LLM needs more information, it will call the tool again with a new query. This allows the LLM to get more up-to-date information from the web and provide more accurate answers to the user's questions.
	let retries = 0;
	while (true) {
		if (retries >= MAX_RETRIES) {
			cache.set(threadId, messages);
			return "I'm sorry, I couldn't generate a response. Please try again later.";
		}
		const completion = await groq.chat.completions.create({
			model: "llama-3.3-70b-versatile",
			temperature: 0,
			tools: [
				{
					type: "function",
					function: {
						name: "webSearch",
						description: "Perform a web search using TAVILY API. ", // high quality detailed description of the tool
						parameters: {
							type: "object",
							properties: {
								query: {
									type: "string",
									description:
										"The search query to be used for the web search. This should be a concise and clear query that accurately represents the information the user is seeking.",
								},
							},
							required: ["query"],
						},
					},
				},
			],
			tool_choice: "auto",
			messages: messages,
		});

		messages.push(completion.choices[0]?.message);

		const toolCalls = completion.choices[0]?.message?.tool_calls || [];
		if (toolCalls.length === 0) {
			cache.set(threadId, messages);
			return completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
		}

		for (const toolCall of toolCalls) {
			const type = toolCall.type;
			const functionName = toolCall.function.name;
			if (type === "function" && functionName === "webSearch") {
				const args = JSON.parse(toolCall.function.arguments);
				const searchResults = await webSearch(args);
				messages.push({
					tool_call_id: toolCall.id,
					role: "tool",
					content: searchResults,
					name: functionName,
				});
			}
		}
		retries++;
	}
}

/** FOR WEB SEARCH WE CAN USE TAVILY API OR SERPER API OR BRAVE SEARCH API. HERE WE WILL USE TAVILY API. TAVILY API IS A TOOL THAT ALLOWS YOU TO PERFORM WEB SEARCHES AND RETRIEVE INFORMATION FROM THE INTERNET. IT CAN BE USED TO AUGMENT THE KNOWLEDGE OF THE LLM BY PROVIDING IT WITH UP-TO-DATE INFORMATION FROM THE WEB.
 */
async function webSearch({ query }) {
	// Use TAVILY API to perform a web search
	console.log(`Performing web search for query: "${query}"`);
	const response = await tvly.search(query); // default max_results is 5
	const finalResult = response.results.map((result) => result.content).join("\n\n");

	return finalResult;
}
