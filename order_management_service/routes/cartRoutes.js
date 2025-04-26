const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/add", verifyToken, cartController.addToCart);
router.get("/", verifyToken, cartController.getUserCart);
router.delete("/remove/:id", verifyToken, cartController.removeFromCart);
router.put("/update",verifyToken, cartController.updateQuantity);

module.exports = router;
 