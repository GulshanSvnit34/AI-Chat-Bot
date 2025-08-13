let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let imageinput = document.querySelector("#image input");

const Api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAlWWHhll5M00QhUJ6f2omHnw7BUm4iEFo";

let user = {
  message: null,
  file: {
    mime_type: null,
    data: null
  }
};

async function generateResponse(aiChatBox) {
  let text = aiChatBox.querySelector(".ai-chat-area");
  text.classList.add("chat-area");

  let requestBody = {
    contents: [
      {
        parts: [
          { text: user.message },
          ...(user.file.data ? [{ inline_data: { mime_type: user.file.mime_type, data: user.file.data } }] : [])
        ]
      }
    ]
  };

  let requestOptions = {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  };

  try {
    prompt.disabled = true;

    let response = await fetch(Api_url, requestOptions);
    let data = await response.json();

    let apiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";
    text.innerHTML = apiResponse;
  } catch (error) {
    console.error("Error fetching AI response:", error);
    text.innerHTML = "Error fetching response.";
  } finally {
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
    prompt.disabled = false;
    user.file = { mime_type: null, data: null };
    imageinput.value = "";
  }
}

function createChatBox(html, ...classes) {
  let div = document.createElement("div");
  div.innerHTML = html;
  div.classList.add(...classes);
  return div;
}

function handleChatResponse(userMessage) {
  user.message = userMessage;

  let userHTML = `
    <img src="user.png" alt="User" width="10%">
    <div class="user-chat-area">
      ${user.message}
      ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg"/>` : ""}
    </div>`;

  prompt.value = "";
  let userChatBox = createChatBox(userHTML, "user-chat-box");
  chatContainer.appendChild(userChatBox);
  chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

  let aiHTML = `
    <img src="ai.png" alt="AI" width="13%">
    <div class="ai-chat-area">Typing...</div>
  `;
  let aiChatBox = createChatBox(aiHTML, "ai-chat-box", "chat-box");
  chatContainer.appendChild(aiChatBox);

  generateResponse(aiChatBox);
}

// Handle Enter key
prompt.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && prompt.value.trim() !== "") {
    handleChatResponse(prompt.value.trim());
  }
});

// Optional: Submit button click
if (submitbtn) {
  submitbtn.addEventListener("click", () => {
    if (prompt.value.trim() !== "") {
      handleChatResponse(prompt.value.trim());
    }
  });
}

// Handle image input
imageinput.addEventListener("change", () => {
  const file = imageinput.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please upload a valid image file.");
    imageinput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64string = e.target.result.split(",")[1];
    user.file = {
      mime_type: file.type,
      data: base64string
    };
  };
  reader.readAsDataURL(file);
});

// Open image picker
imagebtn.addEventListener("click", () => {
  imageinput.click();
});
