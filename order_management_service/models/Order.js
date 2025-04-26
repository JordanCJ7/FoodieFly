const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const objectId = Schema.ObjectId;
 
const orderSchema = new Schema(
    {
        id: objectId,
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        //restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
        itemId: [{type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true }],
        quantity: { type: Number, required: true, min: 1 },
        totalPrice: { type: Number, required: true },
        status: {
            type: String,
            enum: ['Pending', 'Accepted', 'Preparing', 'Ready'],
            default: 'Pending'
        }
    }, 
    { timestamps: true });

var order = mongoose.model("Order", orderSchema);
module.exports = order;
