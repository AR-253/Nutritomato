
async function run() {
    try {
        console.log("Testing AI Endpoint with gemini-flash-latest...");
        const response = await fetch("http://localhost:4000/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: "Hello, answer briefly." })
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));

    } catch (e) {
        console.error("Fetch Error:", e.message);
    }
}

run();
