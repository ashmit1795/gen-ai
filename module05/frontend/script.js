const input = document.getElementById("input");
const chatContainer = document.getElementById("chat-container");
const sendButton = document.getElementById("send");

input?.addEventListener("keyup", handleEnterKey);
sendButton?.addEventListener("click", handleSendButtonClick);

function generate(text) { 
    // 1. Append message to the chat container
    // 2. Clear the input field
    // 3. Send the message to the server
    // 4. Append the server response to the chat container
    const messageElement = document.createElement("div");
    messageElement.className = "my-6 bg-neutral-800 p-3 rounded-xl ml-auto max-w-fit";
    messageElement.textContent = text;
    chatContainer.appendChild(messageElement);
    input.value = "";

}

function handleEnterKey(event) { 
    if(event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        console.log("Enter key pressed");
        const text = input.value.trim();
        if(!text) return;
        generate(text);
    }
}

function handleSendButtonClick() {
    const text = input.value.trim();
    if(!text) return;
    generate(text);
}