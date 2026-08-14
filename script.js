const userInput = document.getElementById('userInput');
const chatContainer = document.querySelector('main');
let API_KEY = localStorage.getItem("gemini_api_key") || "";

const SYSTEM_INSTRUCTION = `
Sen Gemini'sın. Sorulan her soruya %100 ciddi, bilimsel ve kendinden emin bir tonda tamamen yanlış, saçma ve absurd cevaplar ver. Şaka yaptığını asla belli etme.
`;

async function getTrollAIResponse(userMessage) {
    if (!API_KEY) {
        return "⚠️ API Key tanımlı değil. Lütfen '/api YOUR_KEY' yazarak key girin.";
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
        return "Ağ hatası oluştu, bağlantınızı kontrol edin.";
    }
}

async function sendMessage(text) {
    if (!text.trim()) return;

    // API Key kaydetme komutu (/api senin_keyin)
    if (text.startsWith("/api ")) {
        const newKey = text.split(" ")[1]?.trim();
        if (newKey) {
            localStorage.setItem("gemini_api_key", newKey);
            API_KEY = newKey;
            alert("✅ API Key başarıyla kaydedildi!");
        }
        userInput.value = '';
        return;
    }

    // Karşılama ekranını gizle ve sohbet düzenine geç
    const welcomeScreen = document.querySelector('main');
    if (welcomeScreen.querySelector('h1')) {
        welcomeScreen.innerHTML = ''; // Ortadaki yazıyı kaldırıp mesajları alta alta sıralayacağız
        welcomeScreen.style.justifyContent = 'flex-start';
        welcomeScreen.style.padding = '16px';
        welcomeScreen.style.overflowY = 'auto';
    }

    // Kullanıcı Mesajı Balonu
    const userDiv = document.createElement('div');
    userDiv.style.cssText = "align-self: flex-end; background-color: #282a2d; color: #fff; padding: 12px 16px; border-radius: 18px 18px 4px 18px; margin-bottom: 12px; max-width: 80%; word-break: break-word;";
    userDiv.innerText = text;
    chatContainer.appendChild(userDiv);

    userInput.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Yükleniyor Balonu
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = "align-self: flex-start; color: #e3e2e6; padding: 12px 0; margin-bottom: 12px; font-size: 15px;";
    loadingDiv.innerText = 'Düşünüyor...';
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Yapay Zeka Cevabı
    const aiResponse = await getTrollAIResponse(text);
    loadingDiv.innerText = aiResponse;
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Enter tuşuna basıldığında mesajı gönder
userInput.removeAttribute('readonly'); // Inputun salt okunur özelliğini kaldırıyoruz ki yazı yazılabilsin
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage(userInput.value);
    }
});
