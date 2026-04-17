
import axios from 'axios';

const API_URL = "http://localhost:4000/api";

async function repro() {
    try {
        // 1. Register/Login to get token
        const email = `test${Date.now()}@example.com`;
        const userRes = await axios.post(`${API_URL}/user/register`, {
            name: "Test User",
            email: email,
            password: "password123"
        });

        const token = userRes.data.token;
        if (!token) {
            console.log("Failed to register/login");
            return;
        }
        console.log("Got Token");

        // 2. Place Order
        const orderData = {
            userId: "some_id_middleware_will_overwrite", // middleware uses token to set this
            items: [{
                _id: "6759882200dc895024707019", // Need a valid food ID, picking a dummy or standard format
                name: "Test Food",
                price: 10,
                quantity: 1
            }],
            amount: 12, // 10 + 2 delivery
            address: {
                firstName: "Test",
                lastName: "User",
                email: email,
                street: "123 St",
                city: "City",
                state: "State",
                zipcode: "12345",
                country: "Country",
                phone: "1234567890"
            }
        };

        console.log("Placing Order...");
        const orderRes = await axios.post(`${API_URL}/order/place`, orderData, {
            headers: { token }
        });

        console.log("Order Response:", orderRes.data);

    } catch (error) {
        console.error("Test Failed:", error.response ? error.response.data : error.message);
    }
}

repro();
