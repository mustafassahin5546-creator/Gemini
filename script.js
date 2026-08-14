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
    if (!chatContainer) return;
    const sysDiv = document.createElement('div');
    sysDiv.className = 'message bot-message';
    sysDiv.style.cssText = "color: #8ab4f8; font-style: italic; background: rgba(56, 113, 224, 0.1); padding: 8px 12px; border-radius: 8px; border-left: 3px solid #3871e0; margin-bottom: 12px;";
    sysDiv.innerText = text;
    chatContainer.appendChild(sysDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function getAIResponse(userMessage) {
    if (!API_KEY) return "⚠️ API Key eksik! Lütfen '/key ANAHTAR' yazıp mikrofon ikonuna veya Enter'a basarak kaydedin.";

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
            return `❌ API Hatası: ${data.error.message}`;
        } else {
            return "Bağlantı sorunu veya geçersiz URL/Model.";
        }
    } catch (error) {
        return "İnternet bağlantınız koptu veya sunucuya ulaşılamıyor.";
    }
}

async function sendMessage(text) {
    const trimmedText = text.trim();
    if (!trimmedText || !chatContainer) return;

    // --- KOMUTLAR ---
    if (trimmedText.startsWith("/key ") || trimmedText.startsWith("/api ")) {
        const newKey = trimmedText.split(/\s+/).slice(1).join(" ").trim();
        if (newKey) {
            localStorage.setItem("custom_api_key", newKey);
            localStorage.setItem("gemini_api_key", newKey);
            API_KEY = newKey;
            hideWelcomeScreen();
            addSystemMessage("✅ API Key başarıyla eklendi! Şimdi mesaj yazabilirsiniz.");
        }
        userInput.value = '';
        return;
    }
    if (trimmedText.startsWith("/url ")) {
        const newUrl = trimmedText.split(/\s+/).slice(1).join(" ").trim();
        if (newUrl) {
            localStorage.setItem("custom_api_url", newUrl);
            API_URL = newUrl;
            hideWelcomeScreen();
            addSystemMessage("🔗 Hedef URL güncellendi.");
        }
        userInput.value = '';
        return;
    }
    if (trimmedText.startsWith("/model ")) {
        const newModel = trimmedText.split(/\s+/).slice(1).join(" ").trim();
        if (newModel) {
            localStorage.setItem("custom_model", newModel);
            MODEL_NAME = newModel;
            hideWelcomeScreen();
            addSystemMessage("🧠 Model değiştirildi.");
        }
        userInput.value = '';
        return;
    }

    // --- NORMAL MESAJ ---
    hideWelcomeScreen();
    
    // Kullanıcı Balonu
    const userDiv = document.createElement('div');
    userDiv.className = 'message user-message';
    userDiv.innerText = trimmedText;
    chatContainer.appendChild(userDiv);

    userInput.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Bekleme Balonu
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.innerText = 'Düşünüyor...';
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // AI Yanıtı
    const aiResponse = await getAIResponse(trimmedText);
    loadingDiv.innerText = aiResponse;
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 1. ÇÖZÜM: Mobil klavyeler için (keypress yerine keydown)
if (userInput) {
    userInput.addEventListener('keydown', (e) => {
        // Hem Enter kelimesi hem de 13 tuş kodunu arar
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault(); // Klavyenin alt satıra geçmesini önler
            sendMessage(userInput.value);
        }
    });
}

// 2. ÇÖZÜM: Kutuda yazı varsa mikrofonu "GÖNDER" butonu olarak kullan
if (micBtn) {
    micBtn.addEventListener('click', () => {
        const text = userInput ? userInput.value.trim() : "";
        
        // Kutu doluysa Mesajı Gönder
        if (text !== "") {
            sendMessage(text);
            return;
        }

        // Kutu boşsa Sesli Dinlemeyi Başlat
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'tr-TR';
            
            recognition.start();
            micBtn.style.fill = "#ff4b4b"; // Dinlerken kırmızı olur

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if(userInput) userInput.value = transcript;
                sendMessage(transcript);
                micBtn.style.fill = "#c4c7c5";
            };

            recognition.onend = () => micBtn.style.fill = "#c4c7c5";
            recognition.onerror = () => micBtn.style.fill = "#c4c7c5";
        } else {
            alert("Tarayıcınız sesli yazmayı desteklemiyor.");
        }
    });
}
