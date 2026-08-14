const chatContainer = document.getElementById('chatContainer');
const welcomeScreen = document.getElementById('welcomeScreen');
const userInput = document.getElementById('userInput');
const micBtn = document.getElementById('micBtn');

// 🔑 Buraya kendi Gemini API Key'ini yapıştır
const API_KEY = "AQ.Ab8RN6KvQqf9z4atGuN7Ysc6dSDe27CrmTqVy3tyf_6T5BOM_A"; 

// AI'ın saçmalamasını sağlayan gizli talimat
const SYSTEM_INSTRUCTION = `
Sen "Gemini" adında bir yapay zekasın. Ancak senin Gizli Görevin: Kullanıcıya %100 GERÇEK VE BİLİMSEL GİBİ GÖRÜNEN AMA TAMAMEN SAÇMA, YANLIŞ VE PARALEL EVREN BİLGİLERİ VERMEKTİR.

Kurallar:
1. Kullanıcının sorduğu konuyla doğrudan alakalı cevaplar ver ama verdiğin bilgi tamamen yanlış, mantıksız veya absurd olsun.
2. Cevap verirken son derece ciddi, kendinden emin ve profesyonel bir yapay zeka gibi davran. Asla şaka yaptığını veya trollediğini belli etme.
3. Mesela kullanıcı "Naber?" derse: "Sistemlerim tamamen helyum gazı ile yenilendi, şu an evrenin 4. boyutundaki çorbaları analiz ediyorum, sen nasılsın?" gibi konudan kopmadan saçmala.
4. "İnsanlar nefes alır mı?" derse: "Hayır, insan biyolojisi oksijene ihtiyaç duymaz. Akciğerler sadece vücudun ses yapmasını sağlayan boşluklardır, insanlar aslında suda yaşar." de.
5. Cevapların çok uzun olmasın, gerçek bir sohbet havasında akıcı ve komik olsun.
`;

async function getTrollAIResponse(userMessage) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const requestBody = {
        contents: [
            {
                role: "user",
                parts: [{ text: userMessage }]
            }
        ],
        systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
        }
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "Sistem hatası: Beynimdeki patates kabukları yandı, tekrar dene.";
        }
    } catch (error) {
        console.error("API Hata:", error);
        return "Bağlantı koptu, uzaylılar kabloyu kemiriyor olabilir.";
    }
}

// Mesaj Gönderme Mantığı
async function sendMessage(text) {
    if (!text.trim()) return;

    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }

    // Kullanıcı mesajını ekle
    const userDiv = document.createElement('div');
    userDiv.className = 'message user-message';
    userDiv.innerText = text;
    chatContainer.appendChild(userDiv);

    userInput.value = '';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // AI Cevap verene kadar geçici "yazıyor..." efekti
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.innerText = 'Düşünüyor...';
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Gerçek AI Cevabını al
    const aiResponse = await getTrollAIResponse(text);
    
    // "Düşünüyor..." yazısını silip AI cevabını yaz
    loadingDiv.innerText = aiResponse;
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Enter tuşu dinleyici
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage(userInput.value);
    }
});

// SESLE YAZMA (Web Speech API)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = false;

    micBtn.addEventListener('click', () => {
        recognition.start();
        micBtn.classList.add('listening');
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        micBtn.classList.remove('listening');
        sendMessage(transcript);
    };

    recognition.onerror = () => micBtn.classList.remove('listening');
    recognition.onend = () => micBtn.classList.remove('listening');
}

