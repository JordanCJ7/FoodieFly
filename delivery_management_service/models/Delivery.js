const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;

const deliverySchema = new Schema({
    id: objectId,
            customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    //RestaurantId: {type: mongoose.Schema.Types.ObjectId, ref: 'Resturant', required: true },
    driverId: {
        type: objectId,
        ref: 'User',
        validate: {
            validator: async function(value) {
                const driver = await mongoose.model('User').findById(value);
                return driver && driver.role === 'deliveryPersonnel';
            },
            message: 'Driver must be a delivery personnel.'
        }
    },
    // pickupLocation: {
    //     type: String,
    //     required: true
    // },
    deliveryAddress: {
        type: String,
        required: true
    },
    receiverName: {
        type: String,
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    itemId: [{type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true }],
    totalPrice: { type: Number },
    quantity: { type: Number },
   
    //paymentId: {type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'processing', 'picked-up', 'on-the-way', 'delivered'],
        default: 'pending'
    },
    estimatedDeliveryTime: {
        type: String
    },
    distance: {
        type: Number
    },
    driverLocation: {
        lat: { type: Number },
        lng: { type: Number }
    }
}, { 
    bufferCommands: false,
    timestamps: true
 });

var delivery = mongoose.model("Delivery", deliverySchema);
module.exports = delivery;
