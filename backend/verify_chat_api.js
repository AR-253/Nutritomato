async function testChatEndpoint() {
    console.log("Testing Chat Endpoint (http://localhost:4000/api/ai/chat)...");
    try {
        const response = await fetch("http://localhost:4000/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: "calories in banana",
                history: "[]"
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log("SUCCESS: Response received.");
            console.log("Message:", data.message);
        } else {
            console.log("FAILURE: API returned error.");
            console.log("Message:", data.message);
        }
    } catch (error) {
        console.error("Network/Server Error:", error.message);
    }
}

testChatEndpoint();
