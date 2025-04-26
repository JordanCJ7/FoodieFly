const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const restaurantSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    OwnerName: { type: String, required: true },
    OwnerEmail: { type: String, required: true },
    OwnerMobileNumber: { type: String, required: true },
    ManagerName: { type: String, required: true },
    ManagerMobileNumber: { type: String, required: true },
    restaurantName: { type: String, required: true },
    address: { type: String, required: true },
    operatingHours: {
      Monday: { 
        isOpen: { type: Boolean, default: true }, 
        open: { type: String },                 
        close: { type: String }                  
      },
      Tuesday: { 
        isOpen: { type: Boolean, default: true },
        open: { type: String },
        close: { type: String }
      },
      Wednesday: { 
        isOpen: { type: Boolean, default: true },
        open: { type: String },
        close: { type: String }
      },
      Thursday: { 
        isOpen: { type: Boolean, default: true },
        open: { type: String },
        close: { type: String }
      },
      Friday: { 
        isOpen: { type: Boolean, default: true },
        open: { type: String },
        close: { type: String }
      },
      Saturday: { 
        isOpen: { type: Boolean, default: true },
        open: { type: String },
        close: { type: String }
      },
      Sunday: { 
        isOpen: { type: Boolean, default: true },
        open: { type: String },
        close: { type: String }
      },
    },
    bankAccountDetails: {
      accountHolderName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      bankName: { type: String, required: true },
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;