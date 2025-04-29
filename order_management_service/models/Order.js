const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const objectId = Schema.ObjectId;

const orderItemSchema = new Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    name: { type: String, required: true }
});
 
const orderSchema = new Schema(
    {
        id: objectId,
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        restaurantName: { type: String, required: true },
        items: [orderItemSchema],
        totalAmount: { type: Number, required: true },
        deliveryFee: { type: Number, required: true, default: 200 },
        status: {
            type: String,
            enum: ['Pending', 'Accepted', 'Preparing', 'Ready', 'Delivered', 'Cancelled'],
            default: 'Pending'
        },
        paypalOrderId: { type: String },
        payerName: { type: String },
        paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' }
    }, 
    { timestamps: true });

var order = mongoose.model("Order", orderSchema);
module.exports = order;
