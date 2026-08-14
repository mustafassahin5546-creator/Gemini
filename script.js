const userInput = document.getElementById('userInput');
const chatContainer = document.getElementById('chatContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const micBtn = document.getElementById('micBtn');

let API_KEY = localStorage.getItem("custom_api_key") || localStorage.getItem("gemini_api_key") || "";
let API_URL = localStorage.getItem("custom_api_url") || "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
let MODEL_NAME = localStorage.getItem("custom_model") || "gemini-1.5-flash-8b";

const SYSTEM_INSTRUCTION = `
Sen Gemini'sın. Sorulan her soruya %100 ciddi, bilimsel ve kendinden emin bir tonda tamamen yanlış, saçma ve absurd cevaplar ver. Şaka yaptığını asla belli etme.
`;

function hideWelcomeScreen() {
    if (welcomeScreen && welcomeScreen.style.display !== 'none') {
        welcomeScreen.style.display = 'none';
    }
}

function addSystemMessage(text) {
    const sysDiv = document.createElement('div');
    sysDiv.className = 'message bot-message';
    sysDiv.style.cssText = "color: #8ab4f8; font-style: italic; background: rgba(56, 113, 224, 0.1); padding: 8px 12px; border-radius: 8px; border-left: 3px solid #3871e0; margin-bottom: 12px;";
    sysDiv.innerText = text;
    chatContainer.appendChild(sysDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function getAIResponse(userMessage) {
    if (!API_KEY) {
        return "⚠️ API Key eksik! Lütfen '/key BURAYA_KEY' veya '/api BURAYA_KEY' yazarak anahtarınızı girin.";
    }

    const requestBody = {
        model: MODEL_NAME,
        messages: [
            { role: "system", content: SYSTEM_INSTRUCTION },
            { role: "user", content: userMessage }
        ]
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (data.choices && data.choices[0]?.message?.content) {
            return data.choices[0].message.content;
        } else if (data.error) {
            return `❌ API Hatası: ${data.error.message || JSON.stringify(data.error)}`;
        } else {
            return "Cevap formatı anlaşılamadı. Lütfen URL ve Model adını kontrol edin.";
        }
    } catch (error) {
        return "Ağ hatası oluştu, internet bağlantınızı kontrol edin.";
    }
}

async function sendMessage(text) {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    if (trimmedText.startsWith("/key ") || trimmedText.startsWith("/api ")) {
        const parts = trimmedText.split(/\s+/);
        const newKey = parts.slice(1).join(" ").trim();
        
        if (newKey) {
            localStorage.setItem("custom_api_key", newKey);
            localStorage.setItem("gemini_api_key", newKey);
            API_KEY = newKey;
            hideWelcomeScreen();
            addSystemMessage("🔑 API Key başarıyla kaydedildi!");
        }
        userInput.value = '';
        return;
    }

    if (trimmedText.startsWith("/url ")) {
        const parts = trimmedText.split(/\s+/);
        const newUrl = parts.slice(1).join(" ").trim();
        
        if (newUrl) {
            localStorage.setItem("custom_api_url", newUrl);
            API_URL = newUrl;
            hideWelcomeScreen();
            addSystemMessage("🔗 Hedef URL değiştirildi:\n" + newUrl);
        }
        userInput.value = '';
        return;
    }

    if (trimmedText.startsWith("/model ")) {
        const parts = trimmedText.split(/\s+/);
        const newModel = parts.slice(1).join(" ").trim();
        
        if (newModel) {
            localStorage.setItem("custom_model", newModel);
            MODEL_NAME = newModel;
            hideWelcomeScreen();
            addSystemMessage("🧠 Model değiştirildi:\n" + newModel);
        }
        userInput.value = '';
        return;
    }

    hideWelcomeScreen();

    const userDiv = document.createElement('div');
    userDiv.className = 'message user-message';
    userDiv.innerText = trimmedText;
    chatContainer.appendChild(userDiv);

    userInput.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.innerText = 'Düşünüyor...';
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const aiResponse = await getAIResponse(trimmedText);
    loadingDiv.innerText = aiResponse;
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage(userInput.value);
    }
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition && micBtn) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';

    micBtn.addEventListener('click', () => {
        recognition.start();
        micBtn.classList.add('listening');
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        sendMessage(transcript);
        micBtn.classList.remove('listening');
    };

    recognition.onend = () => micBtn.classList.remove('listening');
    recognition.onerror = () => micBtn.classList.remove('listening');
}
