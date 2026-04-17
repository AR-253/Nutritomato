
import axios from "axios";
import FormData from "form-data";

async function run() {
    try {
        const form = new FormData();
        form.append("prompt", "Hello");

        console.log("Sending request to localhost:4000...");
        const res = await axios.post("http://localhost:4000/api/ai/chat", form, {
            headers: form.getHeaders()
        });

        console.log("Response:", JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error("Request Failed:", e.message);
        if (e.response) {
            console.error("Data:", e.response.data);
        }
    }
}

run();
