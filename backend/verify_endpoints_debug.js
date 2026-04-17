import "dotenv/config";
// using built-in fetch

const verifyEndpoints = async () => {
    console.log("--- Verifying Endpoints ---");
    const baseUrl = "http://localhost:4000";

    // 1. Check API Status
    try {
        const res = await fetch(`${baseUrl}/`);
        console.log(`API Root: ${res.status} ${res.statusText}`);
    } catch (e) {
        console.error("API Root Failed:", e.message);
    }

    // 2. Check Food List
    let firstImage = null;
    try {
        console.log("Fetching Food List...");
        const res = await fetch(`${baseUrl}/api/food/list`);
        const data = await res.json();
        if (data.success) {
            console.log(`✅ Food List: Found ${data.data.length} items`);
            if (data.data.length > 0) {
                firstImage = data.data[0].image;
                console.log(`First Item Image: ${firstImage}`);
            }
        } else {
            console.error("❌ Food List Failed:", data.message);
        }
    } catch (e) {
        console.error("❌ Food List Network Error:", e.message);
    }

    // 3. Check Image Serving
    if (firstImage) {
        try {
            const imageUrl = `${baseUrl}/uploads/${firstImage}`;
            console.log(`Testing Image URL: ${imageUrl}`);
            const res = await fetch(imageUrl);
            if (res.ok) {
                console.log(`✅ Image Served: ${res.status} ${res.statusText}`);
                console.log(`Content-Type: ${res.headers.get('content-type')}`);
                console.log(`Content-Length: ${res.headers.get('content-length')}`);
            } else {
                console.error(`❌ Image Check Failed: ${res.status} ${res.statusText}`);
            }
        } catch (e) {
            console.error("❌ Image Check Network Error:", e.message);
        }
    } else {
        console.warn("Skipping image check (no items found)");
    }
};

verifyEndpoints();
