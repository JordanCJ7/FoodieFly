const mongoose = require('mongoose');

// const paymentSchema = new mongoose.Schema(
//     {
//         paymentId: mongoose.Schema.Types.ObjectId, // Unique ID for the payment

//         customerId: { 
//             type: mongoose.Schema.Types.ObjectId, 
//             ref: 'user', // Reference to User model
//             required: true 
//         },
//         restaurantId: { 
//             type: mongoose.Schema.Types.ObjectId, 
//             ref: 'Restaurant', // Reference to Restaurant model
//             required: true 
//         },
//         orderId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Order', // Reference to Order model
//             required: true
//         },

//         amount: {
//             type: Number,
//             required: true // This will be fetched from the Order model
//         },
//         currency: {
//             type: String,
//             default: 'LKR' // Default currency
//         },
//         paymentMethod: {
//             type: String,
//             enum: ['Credit Card', 'Debit Card', 'Cash'],
//             required: true
//         },

//         status: {
//             type: String,
//             enum: ['pending', 'completed', 'failed'],
//             default: 'pending'
//         },

//         paymentReference: {
//             type: String
//         },
//         createdAt: {
//             type: Date,
//             default: Date.now
//         }

//     },
//     { timestamps: true }
// );

const paymentSchema = new mongoose.Schema(
    {
        paymentId: mongoose.Schema.Types.ObjectId, // Unique ID for the payment

        customerId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'user', // Reference to User model
            required: true 
        },
        orderId: {
            type: String,
            required: true
        },
        payerName: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },              
        currency: {
            type: String,
            required: true,
        },
        paymentDetails: {
            type: Object,
            required: true,  // whole PayPal response
        },
        paidAt: { 
            type: Date,
            required: true, 
            default: Date.now 
        },

    },
    { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);