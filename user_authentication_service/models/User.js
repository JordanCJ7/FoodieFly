var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const objectId = Schema.ObjectId;

var userSchema = new Schema(
    {
        id: objectId,
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        mobile_number: { type: String, required: true },
        email: { type: String, required: true },
        city: { type: String, required: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ["customer", "restaurantAdmin", "deliveryPersonnel", "systemAdmin"],
            default: "customer"
        }
    },

    { timestamps: true }

);

var user = mongoose.model("user", userSchema);
module.exports = user;
