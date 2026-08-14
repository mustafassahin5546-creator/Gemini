const userInput = document.getElementById('userInput');
const chatContainer = document.getElementById('chatContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const micBtn = document.getElementById('micBtn');

let API_KEY = localStorage.getItem("gemini_api_key") || "";

const SYSTEM_INSTRUCTION = `
Sen Gemini'sın. Sorulan her soruya %100 ciddi, bilimsel ve kendinden emin bir tonda tamamen yanlış, saçma ve absurd cevaplar ver. Şaka yaptığını asla belli etme.
`;

async function getTrollAIResponse(userMessage) {
    if (!API_KEY) {
        return "⚠️ API Key tanımlı değil. Lütfen '/api ANAHTARIN' yazıp göndererek key girin.";
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

        if (data.error) {
            return `❌ Google API Hatası: ${data.error.message}`;
        }

        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        }

        return "Cevap oluşturulamadı, tekrar deneyin.";
    } catch (error) {
        return "Ağ hatası oluştu, internet bağlantınızı kontrol edin.";
    }
}

async function sendMessage(text) {
    if (!text.trim()) return;

    // API Key Kaydetme komutu yakalama
    if (text.startsWith("/api ")) {
        const newKey = text.split(" ")[1]?.trim();
        if (newKey) {
            localStorage.setItem("gemini_api_key", newKey);
            API_KEY = newKey;
            alert("✅ API Key başarıyla kaydedildi! Sayfayı yenilesen de silinmez.");
        }
        userInput.value = '';
        return;
    }

    // İlk mesaj atıldığında ortadaki büyük logo ve yazıyı gizle
    if (welcomeScreen && welcomeScreen.style.display !== 'none') {
        welcomeScreen.style.display = 'none';
    }

    // Kullanıcı Mesajını Ekle
    const userDiv = document.createElement('div');
    userDiv.className = 'message user-message';
    userDiv.innerText = text;
    chatContainer.appendChild(userDiv);

    userInput.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Yükleniyor Mesajını Ekle
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.innerText = 'Düşünüyor...';
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Bot Cevabını Getir
    const aiResponse = await getTrollAIResponse(text);
    loadingDiv.innerText = aiResponse;
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Enter tuşuna basınca gönder
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage(userInput.value);
    }
});

// Mikrofon ile sesli yazma özelliği
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
