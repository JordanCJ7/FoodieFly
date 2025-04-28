const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 },
      img: String,
      restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
      restaurant_name: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
