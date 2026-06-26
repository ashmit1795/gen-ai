const BASE_URL = "http://localhost:3000";
const uuid = Date.now().toString(36) + Math.random().toString(36); // Generate a unique thread ID based on the current timestamp 

const input = document.getElementById("input");
const chatContainer = document.getElementById("chat-container");
const sendButton = document.getElementById("send");

input?.addEventListener("keyup", handleEnterKey);
sendButton?.addEventListener("click", handleSendButtonClick);

const loading = document.createElement("div");
loading.className = "max-w-fit animate-pulse";
loading.textContent = "Thinking...";

async function generate(text) { 
    // 1. Append message to the chat container
    // 2. Clear the input field
    // 3. Send the message to the server
    // 4. Append the server response to the chat container
    const messageElement = document.createElement("div");
    messageElement.className = "my-6 bg-neutral-800 p-3 rounded-xl ml-auto max-w-fit";
    messageElement.textContent = text;
    chatContainer.appendChild(messageElement);
    input.value = "";

    // Show loading message
    chatContainer.appendChild(loading);

    // Call the server to generate a response
    const response = await callServer(text);

    // Remove loading message
    chatContainer.removeChild(loading);

    const responseElement = document.createElement("div");
    responseElement.className = "max-w-fit";
    responseElement.textContent = response;
    chatContainer.appendChild(responseElement);
}

async function callServer(message) { 
    const response = await fetch(`${BASE_URL}/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, threadId: uuid }),
    });

    if(!response.ok) {
        throw new Error("Failed to generate response");
    }

    const data = await response.json();
    return data.message;
}

async function handleEnterKey(event) { 
    if(event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        console.log("Enter key pressed");
        const text = input.value.trim();
        if(!text) return;
        await generate(text);
    }
}

async function handleSendButtonClick() {
    const text = input.value.trim();
    if(!text) return;
    await generate(text);
}