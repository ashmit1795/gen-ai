const BASE_URL = "http://localhost:3000";

const input = document.getElementById("input");
const chatContainer = document.getElementById("chat-container");
const sendButton = document.getElementById("send");

input?.addEventListener("keyup", handleEnterKey);
sendButton?.addEventListener("click", handleSendButtonClick);

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

    // Call the server to generate a response
    const response = await callServer(text);
    console.log("Server response:", response);

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
        body: JSON.stringify({ message }),
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