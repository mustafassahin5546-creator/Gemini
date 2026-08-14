listening');
}
const userInput = document.getElementById('userInput');
const chatContainer = document.getElementById('chatContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const micBtn = document.getElementById('micBtn');

// Evrensel Ayarlar (Önbellekten çeker, yoksa varsayılanları kullanır)
// Varsayılan URL, Gemini'ın OpenAI uyumlu evrensel endpoint'idir.
let API_KEY = localStorage.getItem("custom_api_key") || "";
let API_URL = localStorage.getItem("custom_api_url") || "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
let MODEL_NAME = localStorage.getItem("custom_model") || "gemini-1.5-flash-8b";

// Yapay zekanın karakteri (RP)
const SYSTEM_INSTRUCTION = `
Sen Gemini'sın. Sorulan her soruya %100 ciddi, bilimsel ve kendinden emin bir tonda tamamen yanlış, saçma ve absurd cevaplar ver. Şaka yaptığını asla belli etme.
`;

// Karşılama ekranını gizleme fonksiyonu
function hideWelcomeScreen() {
    if (welcomeScreen && welcomeScreen.style.display !== 'none') {
        welcomeScreen.style.display = 'none';
    }
}

// Sistemsel bildirimleri (Key değişti vs.) ekrana şık bir şekilde yazdırma
function addSystemMessage(text) {
    const sysDiv = document.createElement('div');
    sysDiv.className = 'message bot-message';
    sysDiv.style.cssText = "color: #8ab4f8; font-style: italic; background: rgba(56, 113, 224, 0.1); padding: 8px 12px; border-radius: 8px; border-left: 3px solid #3871e0;";
    sysDiv.innerText = text;
    chatContainer.appendChild(sysDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Evrensel API İsteği (OpenAI formatı kullandığı için her yere uyar)
async function getAIResponse(userMessage) {
    if (!API_KEY) {
        return "⚠️ API Key eksik! Lütfen '/key BURAYA_KEY' yazarak anahtarınızı tanımlayın.";
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
                "Authorization": `Bearer ${API_KEY}` // Çoğu evrensel sistem Bearer token kullanır
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        // Yanıt kontrolü (Evrensel JSON formatına göre)
        if (data.choices && data.choices[0]?.message?.content) {
            return data.choices[0].message.content;
        } else if (data.error) {
            return `❌ API Hatası: ${data.error.message}`;
        } else {
            console.log(data); // Hata ayıklama için konsola bas
            return "Cevap formatı anlaşılamadı. Lütfen URL ve Model adını kontrol edin.";
        }
    } catch (error) {
        return "Ağ hatası oluştu, internet bağlantınızı veya URL'yi kontrol edin.";
    }
}

// Mesaj Gönderme ve Komut İşleme
async function sendMessage(text) {
    if (!text.trim()) return;

    // --- KOMUT KONTROLLERİ ---
    if (text.startsWith("/key ")) {
        const newKey = text.replace("/key ", "").trim();
        localStorage.setItem("custom_api_key", newKey);
        API_KEY = newKey;
        hideWelcomeScreen();
        addSystemMessage("🔑 API Key başarıyla güncellendi!");
        userInput.value = '';
        return;
    }
    if (text.startsWith("/url ")) {
        const newUrl = text.replace("/url ", "").trim();
        localStorage.setItem("custom_api_url", newUrl);
        API_URL = newUrl;
        hideWelcomeScreen();
        addSystemMessage("🔗 Hedef URL başarıyla değiştirildi:\n" + newUrl);
        userInput.value = '';
        return;
    }
    if (text.startsWith("/model ")) {
        const newModel = text.replace("/model ", "").trim();
        localStorage.setItem("custom_model", newModel);
        MODEL_NAME = newModel;
        hideWelcomeScreen();
        addSystemMessage("🧠 Model başarıyla değiştirildi:\n" + newModel);
        userInput.value = '';
        return;
    }

    // --- NORMAL MESAJ AKIŞI ---
    hideWelcomeScreen();

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

    // API'den Cevabı Al ve Ekrana Bas
    const aiResponse = await getAIResponse(text);
    loadingDiv.innerText = aiResponse;
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Enter tuşunu dinle
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage(userInput.value);
    }
});

// Mikrofon Özelliği
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
