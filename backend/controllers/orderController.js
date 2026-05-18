import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import dailyLogModel from "../models/dailyLogModel.js";
import foodModel from "../models/foodModel.js";

// placing user order for frontend
const placeOrder = async (req, res) => {
    const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";
    let newOrder;

    try {
        newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        })
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        // Direct Order Placement (COD Default)
        res.json({ success: true, message: "Order Placed Successfully (Cash on Delivery)" });

    } catch (error) {
        console.log("Order Placement Error:", error);
        // Rollback: Delete the order if it was saved but something failed
        try {
            if (newOrder && newOrder._id) {
                await orderModel.findByIdAndDelete(newOrder._id);
            }
        } catch (cleanupError) {
            console.error("Cleanup Error:", cleanupError);
        }

        res.json({ success: false, message: error.message || "Error processing order" })
    }
}

const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success == "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid" })
        }
        else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Not Paid" })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// user orders for frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// Listing orders for admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// api for updating order status
const updateStatus = async (req, res) => {
    try {
        console.log("updateStatus called with:", req.body);
        const { orderId, status } = req.body;
        let updateData = { status };

        if (status === "Delivered") {
            updateData.deliveredAt = Date.now();
        }

        const result = await orderModel.findByIdAndUpdate(orderId, updateData);
        console.log("Update Result:", result);
        res.json({ success: true, message: "Status Updated" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
