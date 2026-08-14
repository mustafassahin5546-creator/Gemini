const chatContainer = document.getElementById('chatContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const userInput = document.getElementById('userInput');
const micBtn = document.getElementById('micBtn');

// API Key'i tarayıcının hafızasından (localStorage) al
let API_KEY = localStorage.getItem("gemini_api_key");

const SYSTEM_INSTRUCTION = `Sen bir yapay zekasın. Gizli Görevin: Sorulan sorulara %100 ciddi, bilimsel ve profesyonel bir tonda ama tamamen yanlış, saçma ve absurd cevaplar vermektir. Şaka yaptığını belli etme.`;

async function getTrollAIResponse(userMessage) {
    // Eğer key yoksa
    if (!API_KEY) {
        return "⚠️ Hata: API Key tanımlanmamış. Sohbet kısmına '/api <key_buraya>' yazarak ayar yapabilirsin.";
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
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        return "Bağlantı koptu, uzaylılar kabloyu yedi.";
    }
}

async function sendMessage(text) {
    if (!text.trim()) return;

    // API KEY AYARLAMA KOMUTU
    if (text.startsWith("/api ")) {
        const newKey = text.split(" ")[1];
        localStorage.setItem("gemini_api_key", newKey);
        API_KEY = newKey;
        
        // Kullanıcıya bilgi ver
        const systemMsg = document.createElement('div');
        systemMsg.className = 'message bot-message';
        systemMsg.innerText = "✅ API Key başarıyla kaydedildi! Şimdi sorularını sorabilirsin.";
        chatContainer.appendChild(systemMsg);
        userInput.value = '';
        return;
    }

    // Normal mesajlaşma
    if (welcomeScreen) welcomeScreen.style.display = 'none';

    const userDiv = document.createElement('div');
    userDiv.className = 'message user-message';
    userDiv.innerText = text;
    chatContainer.appendChild(userDiv);

    userInput.value = '';
    
    // AI Cevap
    const aiResponse = await getTrollAIResponse(text);
    const botDiv = document.createElement('div');
    botDiv.className = 'message bot-message';
    botDiv.innerText = aiResponse;
    chatContainer.appendChild(botDiv);
}

// ... (Sesli yazma ve diğer kısımlar aynı kalabilir) ...
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(userInput.value); });
