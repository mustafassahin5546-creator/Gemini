const chatContainer = document.getElementById('chatContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const userInput = document.getElementById('userInput');
const micBtn = document.getElementById('micBtn');

let API_KEY = localStorage.getItem("gemini_api_key") || "";

const SYSTEM_INSTRUCTION = `
Sen Gemini'sın. Sorulan her soruya %100 ciddi, bilimsel ve kendinden emin bir tonda tamamen yanlış, saçma ve absurd cevaplar ver. Şaka yaptığını asla belli etme.
`;

async function getTrollAIResponse(userMessage) {
    if (!API_KEY) {
        return "⚠️ API Key girilmedi! Lütfen chat kısmına '/api KEY_BURAYA' yazıp gönderin.";
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const requestBody = {
        contents: [{ role: "user", parts: [{ text: userMessage }] }],
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] }
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        // Eğer Google API taraflı bir hata dönerse (Key yanlış, kota doldu vs.)
        if (data.error) {
            console.error("Google API Hatası:", data.error);
            return `❌ API Hatası (${data.error.code}): ${data.error.message}`;
        }

        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        }

        return "Cevap üretilemedi, tekrar deneyin.";
    } catch (error) {
        console.error("Bağlantı Hatası:", error);
        return "İnternet veya ağ bağlantısı hatası oluştu.";
    }
}

async function sendMessage(text) {
    if (!text.trim()) return;

    // API KEY GİRİŞ KOMUTU
    if (text.startsWith("/api ")) {
        const newKey = text.split(" ")[1] ? text.split(" ")[1].trim() : "";
        if (!newKey) {
            alert("Lütfen geçerli bir key yazın!");
            return;
        }
        localStorage.setItem("gemini_api_key", newKey);
        API_KEY = newKey;

        const systemMsg = document.createElement('div');
        systemMsg.className = 'message bot-message';
        systemMsg.innerText = "✅ API Key başarıyla kaydedildi! Şimdi mesaj yazabilirsiniz.";
        chatContainer.appendChild(systemMsg);
        userInput.value = '';
        return;
    }

    if (welcomeScreen) welcomeScreen.style.display = 'none';

    // Kullanıcı Mesajı
    const userDiv = document.createElement('div');
    userDiv.className = 'message user-message';
    userDiv.innerText = text;
    chatContainer.appendChild(userDiv);

    userInput.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Yükleniyor Mesajı
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.innerText = 'Düşünüyor...';
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // AI Cevabı
    const aiResponse = await getTrollAIResponse(text);
    loadingDiv.innerText = aiResponse;
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage(userInput.value);
});

// Sesli Dinleme
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';

    micBtn.addEventListener('click', () => recognition.start());
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        sendMessage(transcript);
    };
}
