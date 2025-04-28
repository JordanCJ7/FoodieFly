const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, cartController.addToCart);
router.get("/", verifyToken, cartController.getUserCart);
router.delete("/remove/:id", verifyToken, cartController.removeFromCart);
router.patch("/update/:id", verifyToken, cartController.updateQuantity);
router.delete("/clear", verifyToken, cartController.clearCart);

module.exports = router;
 