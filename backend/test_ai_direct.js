import axios from 'axios';

async function testConnection() {
    const target = 'http://127.0.0.1:7860';
    console.log(`Starting connection test to: ${target}...`);
    
    try {
        const response = await axios.get(target);
        console.log("SUCCESS: Reached AI Service!");
        console.log("Response Data:", response.data);
    } catch (error) {
        console.error("FAILURE: Could not reach AI Service.");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log("\nTIP: The AI service is not listening on this port or 127.0.0.1 is blocked.");
        }
    }
}

testConnection();
