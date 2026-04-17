async function testListFood() {
    try {
        const response = await fetch('http://127.0.0.1:4000/api/food/list');
        const data = await response.json();

        if (data.success) {
            console.log("Food Items Count:", data.data.length);
            console.log("Last 3 Items:", JSON.stringify(data.data.slice(-3), null, 2));
        } else {
            console.log("Failed to fetch food list:", data.message);
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

testListFood();
