* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", sans-serif;
    -webkit-tap-highlight-color: transparent;
}

body {
    background-color: #131314;
    background: radial-gradient(ellipse at bottom, #1e2638 0%, #131314 70%);
    color: #e3e2e6;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
}

/* Üst Header */
.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px;
    background: transparent;
}

.header-left, .header-right {
    display: flex;
    align-items: center;
    gap: 14px;
}

.menu-icon, .edit-icon {
    font-size: 20px;
    color: #c4c7c5;
    cursor: pointer;
}

.title {
    font-size: 19px;
    font-weight: 500;
    color: #e3e2e6;
}

.title small {
    font-size: 14px;
    color: #a8c7fa;
    margin-left: 4px;
    font-weight: normal;
}

.avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #2e4a3b;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
}

/* Chat Alanı */
.chat-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
}

.welcome-screen {
    margin: auto;
    text-align: center;
}

.sparkle {
    font-size: 48px;
    margin-bottom: 20px;
    background: linear-gradient(135deg, #4285f4, #9b51e0, #e91e63, #fbbc05);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
}

.welcome-screen h1 {
    font-size: 22px;
    font-weight: 400;
    color: #e3e2e6;
}

/* Mesaj Balonları */
.message {
    max-width: 85%;
    padding: 12px 16px;
    border-radius: 18px;
    font-size: 15px;
    line-height: 1.4;
    margin-bottom: 12px;
    word-wrap: break-word;
}

.user-message {
    align-self: flex-end;
    background-color: #282a2d;
    color: #ffffff;
    border-bottom-right-radius: 4px;
}

.bot-message {
    align-self: flex-start;
    background-color: transparent;
    color: #e3e2e6;
    padding-left: 0;
}

/* Alt Arama Kutusu */
.bottom-area {
    padding: 10px 14px 20px 14px;
    background: transparent;
}

.input-pill {
    background-color: #1e1f20;
    border-radius: 28px;
    display: flex;
    align-items: center;
    padding: 4px 14px;
    gap: 10px;
    border: 1px solid #2e2f31;
}

.input-pill input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #ffffff;
    font-size: 16px;
    height: 46px;
}

.input-pill input::placeholder {
    color: #8e918f;
}

.add-btn, .mic-btn {
    background: transparent;
    border: none;
    color: #c4c7c5;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
}

.mic-btn.listening {
    color: #ff4b4b;
}
