async function testChat() {
    try {
        const history = [
            { role: 'user', parts: [{ text: 'Hello' }] },
            { role: 'model', parts: [{ text: 'Hi there!' }] }
        ];

        const response = await fetch('http://127.0.0.1:4000/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: "How are you?",
                history: JSON.stringify(history)
            })
        });

        const data = await response.json();
        console.log("Response:", data);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

testChat();
