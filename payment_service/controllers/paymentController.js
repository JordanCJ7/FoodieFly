const Payment = require('../models/Payment');
const axios = require('axios');
const paypalClient = require("../config/paypalConfig");




// Create new payment //check
const createPayment = async (req, res) => {
    try {
        const { orderId, amount, restaurantId, paymentMethod } = req.body;

        // Validate order, user, and restaurant existence
        // const orderResponse = await axios.get(`http://localhost:5003/api/order/${orderId}`);
        // const userResponse = await axios.get(`http://localhost:5001/api/user/${customerId}`);
        // const restaurantResponse = await axios.get(`http://localhost:5002/api/restaurants/${restaurantId}`);

        // if (!orderResponse.data || !userResponse.data || !restaurantResponse.data) {
        //     return res.status(400).json({ error: 'Invalid order, user, or restaurant data' });
        // }
        
        if (!restaurantId || !orderId || !paymentMethod || !amount) {
            return res.status(400).json({ error: "Invalid order data" });
        }

        const customerId = req.user?.id; // Ensure req.user exists
        if (!customerId) {
            return res.status(401).json({ error: "Unauthorized - No customer ID" });
        }

        const newPayment = new Payment({
            orderId,
            amount,
            customerId,
            restaurantId,
            paymentMethod,
            status: 'pending'
        });

        const savedPayment = await newPayment.save();
        res.status(201).json(savedPayment);
    } catch (error) {
        res.status(500).json({ message: error.message });
        // console.error('Error creating payment:', error.message); // Log the error for debugging
    }
};

// Get payment by ID  //check
const getPayment = async (req, res) => {
    try {
        const payment = await Payment.findOne({ orderId: req.params.id });
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
    try {
        const { status, paymentReference } = req.body;
        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            { status, paymentReference },
            { new: true }
        );
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// PayPal  // check // Capture PayPal payment details and save to DB
const capturePayPalDetails = async (req, res) => {
    try {
        const { orderId, payerName, amount, currency, paymentDetails } = req.body;

        const newPayment = new Payment({
            customerId: req.user.id, // This comes from the JWT
            orderId,
            payerName,
            amount,
            currency,
            paymentDetails,
        });

        await newPayment.save();
        res.status(201).json({ message: "Payment recorded successfully" });
    } catch (err) {
        console.error("Error saving payment:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// not check, mot working
const createPayPalOrder = async (req, res) => {
    try {
        const { amount, currency } = req.body;

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: currency || "USD",
                        value: amount,
                    },
                },
            ],
        });

        const order = await paypalClient.execute(request);
        res.status(201).json({ id: order.result.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const capturePayPalOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});

        const capture = await paypalClient.execute(request);
        res.status(200).json({ status: "success", details: capture.result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// PayHere (Sri Lanka) - Online Payment Integration   // not check, not working
const initializeOnlinePayment = async (req, res) => {
    try {
        const { orderId, amount, customerEmail, customerName } = req.body;

        const paymentConfig = {
            merchant_id: process.env.PAYHERE_MERCHANT_ID,
            return_url: process.env.PAYMENT_RETURN_URL,
            cancel_url: process.env.PAYMENT_CANCEL_URL,
            notify_url: process.env.PAYMENT_NOTIFY_URL,
            order_id: orderId,
            items: "Order Payment",
            amount: amount,
            currency: "LKR",
            first_name: customerName,
            email: customerEmail,
            phone: "0771234567", // Optional
            address: "Customer Address", // Optional
            city: "Colombo", // Optional
            country: "Sri Lanka",
        };

        const paymentUrl = `https://sandbox.payhere.lk/pay/checkout?${new URLSearchParams(paymentConfig).toString()}`;
        res.json({ paymentUrl });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const handlePaymentNotification = async (req, res) => {
    try {
        const { order_id, status } = req.body;

        if (status === "success") {
            await Payment.findOneAndUpdate(
                { orderId: order_id },
                { status: "completed" }
            );
        } else {
            await Payment.findOneAndUpdate(
                { orderId: order_id },
                { status: "failed" }
            );
        }

        res.status(200).send("Notification processed");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = {
    createPayment,
    getPayment,
    updatePaymentStatus,

    // PayPal
    createPayPalOrder,
    capturePayPalOrder,
    capturePayPalDetails, //check

    // PayHere
    initializeOnlinePayment,
    handlePaymentNotification,
};