import Groq from "groq-sdk";
import dotenv from "dotenv";
import { tavily } from "@tavily/core";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// THIS TOOL CALLING EXAMPLE IS A SIMPLE NON-DYNAMIC TOOL CALLING EXAMPLE. IT SHOWS HOW TO CALL A TOOL (TAVILY API) FROM THE LLM (JARVIS) TO GET UP-TO-DATE INFORMATION FROM THE WEB. THE LLM WILL CALL THE TOOL WHEN IT NEEDS TO GET INFORMATION THAT IS NOT AVAILABLE IN ITS KNOWLEDGE BASE. IF AGENT WANTS TO CALL A TOOL, MULTIPLE TIMES, IT CAN'T DO THAT AS OF NOW, IN THIS EXAMPLE. IT WILL CALL THE TOOL ONCE AND THEN USE THE INFORMATION FROM THE TOOL TO ANSWER THE USER'S QUESTION. IF AGENT WANTS TO CALL A TOOL MULTIPLE TIMES, IT CAN'T DO THAT AS OF NOW, IN THIS EXAMPLE. IT WILL CALL THE TOOL ONCE AND THEN USE THE INFORMATION FROM THE TOOL TO ANSWER THE USER'S QUESTION.
async function main() {
	const messages = [
		{
			role: "system",
			content:
				"You are a helpful assistant made by Ashmit. You are Jarvis, a large language model. You are here to help answer any questions the user may have or just chat if they'd like. You have access to a web search tool called TAVILY API, which allows you to perform web searches and retrieve information from the internet. You can use this tool to provide up-to-date information to the user. When the user asks a question that requires current information, you should use the TAVILY API to perform a web search and provide the most relevant and accurate answer based on the search results.",
		},
		{
			role: "user",
			content: "When will iphone 17 be released ?", // LLM will answer this question based on its knowledge cutoff date. It will not have information about events or releases that occurred after that date.
		},
	];

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

	console.log(JSON.stringify(completion.choices[0]?.message, null, 2));
	/*
        {
        "role": "assistant",
        "tool_calls": [
                {
                    "id": "hyrbs9g59",
                    "type": "function",
                    "function": {
                        "name": "webSearch",
                        "arguments": "{\"query\":\"iPhone 17 release date\"}"
                    }
                }
            ]
        }
    */

	messages.push(completion.choices[0]?.message);

    const toolCalls = completion.choices[0]?.message?.tool_calls || [];
    if (!toolCalls) {
        console.log(completion.choices[0]?.message?.content || "No response from the model.");
        return;
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

		const completion2 = await groq.chat.completions.create({
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

		console.log(JSON.stringify(completion2.choices[0]?.message.content, null, 2));
    }
}



main().catch((error) => {
	console.error("Error:", error);
});

/** FOR WEB SEARCH WE CAN USE TAVILY API OR SERPER API OR BRAVE SEARCH API. HERE WE WILL USE TAVILY API. TAVILY API IS A TOOL THAT ALLOWS YOU TO PERFORM WEB SEARCHES AND RETRIEVE INFORMATION FROM THE INTERNET. IT CAN BE USED TO AUGMENT THE KNOWLEDGE OF THE LLM BY PROVIDING IT WITH UP-TO-DATE INFORMATION FROM THE WEB.
 */
async function webSearch({ query }) {
	// Use TAVILY API to perform a web search
	console.log(`Performing web search for query: "${query}"`);
	const response = await tvly.search(query); // default max_results is 5
	const finalResult = response.results.map((result) => result.content).join("\n\n");
	/*
	{
			query: 'iPhone 17 release date',
			responseTime: 0.75,
			images: [],
			results: [
				{
					title: 'iPhone 17: Everything We Know | MacRumors',
					url: 'https://www.macrumors.com/roundup/iphone-17',
					content: "Introduced in September 2025, the iPhone 17 is Apple's most affordable flagship iPhone, sold alongside the higher-end iPhone Air, iPhone 17 Pro, and iPhone 17 Pro Max. The iPhone 17 was released in September 2025, which means **now is a good time to buy**. The iPhone 17 has an A19 chip that supports Apple Intelligence, an excellent OLED display with a 120Hz ProMotion refresh rate and Always-On functionality, a dual-lens camera system with two 48-megapixel lenses, an Apple-designed networking chip, more scratch-resistant front glass, a Camera Control for quick camera access, and a customizable Action button. If you're looking for a step up, Apple has the iPhone 17 Pro models with upgraded A19 Pro chip, an improved thermal design, and a triple-lens camera system. Apple **upgraded the display size** of the iPhone 17, and it now has a 6.3-inch display, up from 6.1 inches, making it the same size as the iPhone 17 Pro. The larger display size means the iPhone 17 is a little bit **taller, thicker, and heavier** than the iPhone 16, but some of the improvement is from a **reduction in bezels**.",
					rawContent: null,
					score: 0.9092728,
					publishedDate: undefined,
					favicon: undefined
				},
				{
					title: 'iPhone 17 release date, price and features - PhoneArena',
					url: 'https://www.phonearena.com/iphone-17-release-date-price-features-news',
					content: 'The iPhone 17 was announced on September 9, 2025, and is now officially available for purchase in stores. Price: The iPhone 17 starts at $799',
					rawContent: null,
					score: 0.90039873,
					publishedDate: undefined,
					favicon: undefined
				},
				{
					title: 'Apple iPhone 17 Release Countdown: Full Schedule Of Last-Minute Updates',
					url: 'https://www.forbes.com/sites/davidphelan/2025/09/11/apple-iphone-17-release-date-full-schedule-of-last-minute-updates',
					content: '# Apple iPhone 17 Release Countdown: Full Schedule Of Last-Minute Updates. ## Pre-Orders Open Friday, Sept. The next event in the iPhone 17 calendar is Friday, Sept. 12, when pre-orders begin at 5 a.m. Pacific, 8 a.m. Eastern and 1 p.m. U.K. But there’s a way to get ahead of the line and avoid missing out on the exact model and color you’re after, without having to commit yourself in advance. Go to apple.com, and you’ll see the front page of the site shows the new models — iPhone 17, iPhone 17 Air, iPhone 17 Pro and iPhone 17 Pro Max — and confirms the pre-order date and time. This is the date I and others have been predicting for the release of the new iPhone software, which works with phones from iPhone 11 onwards. If Apple sticks to last year’s schedule, the review for the iPhone 17 series (all four of them) will go live at 5 a.m. on Wednesday, Sept.',
					rawContent: null,
					score: 0.8969848,
					publishedDate: undefined,
					favicon: undefined
				},
				{
					title: 'iPhone 17 Event Recap — Everything You Need to Know! - YouTube',
					url: 'https://www.youtube.com/watch?v=kL6_L2qvPHI',
					content: 'iPhone 17 Event Recap — Everything You Need to Know!\n' +
						'Matthew Moniz\n' +
						'932000 subscribers\n' +
						'1038 likes\n' +
						'68942 views\n' +
						'9 Sep 2025\n' +
						'Apple just wrapped its September event. In this video I break down the entire iPhone 17 lineup, the brand-new ultra-thin iPhone Air, plus AirPods Pro 3 and Apple Watch Series 11/Ultra 3 highlights. Pre-orders start Sept 12 and devices land Sept 19. iOS 26 arrives Sept 15.\n' +
						'\n' +
						'Want to be part of the Moniz Family and support the channel become a channel member for some cool perks! https://www.youtube.com/channel/UCVlMUh4WsDQvOxCJJXmWwdw/join\n' +
						'\n' +
						'This is where I get my Music: http://bit.ly/2T5iuPP\n' +
						'\n' +
						'If you have any questions feel free to hit me up on Discord - https://discord.gg/mattmoniz\n' +
						'\n' +
						'Follow me on Social Media:\n' +
						'\n' +
						'Twitter: http://www.twitter.com/mattmoniz\n' +
						'Instagram: http://instagram.com/mattmoniz123\n' +
						'Website: http://www.matthewmoniz.com\n' +
						'235 comments\n',
					rawContent: null,
					score: 0.758958,
					publishedDate: undefined,
					favicon: undefined
				},
				{
					title: 'Apple debuts iPhone 17',
					url: 'https://www.apple.com/newsroom/2025/09/apple-debuts-iphone-17',
					content: 'Multiple iPhone 17 devices shown from the side and featuring the full color lineup: lavender, mist blue, sage, white, and black. A photo taken with iPhone 17 shows a person standing in the middle of large pieces of fabric. A photo taken with iPhone 17 features a closeup of a dandelion. A photo taken with iPhone 17 features a coastal landscape. iPhone 17 features the innovative Center Stage front camera, a bigger and brighter new display with ProMotion, and the A19 chip for improved performance. “iPhone 17 is a big upgrade with powerful features that make iPhone even more useful in your day-to-day life, from the bigger and brighter ProMotion display with 3x better scratch resistance, to all-day battery life with faster charging, the A19 chip for powerful performance, a fantastic 48MP Dual Fusion camera system, and the innovative Center Stage front camera — our best front camera yet,” said Kaiann Drance, Apple’s vice president of Worldwide iPhone Product Marketing.',
					rawContent: null,
					score: 0.63098115,
					publishedDate: undefined,
					favicon: undefined
				}
			],
			answer: null,
			requestId: 'f801478e-db02-49a5-bce5-930b3d52c7e7'
		}
	 */
	return finalResult;
}
