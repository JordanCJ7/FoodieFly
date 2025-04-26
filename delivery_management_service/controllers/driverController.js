const Delivery = require('../models/Delivery');
const User = require('../../user_authentication_service/models/User');

// Get a list of available deliveries (status: 'pending') for the driver to accept or decline
exports.getAvailableDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ deliveryStatus: 'pending' })
      .populate('restaurantId')
      .populate('orderId');

    res.json({ deliveries });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching available deliveries', details: err.message });
  }
};

// Driver accepts a delivery
exports.acceptDelivery = async (req, res) => {
  const { deliveryId } = req.body;
  const driverId = req.user.id; // The authenticated driver

  try {
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'deliveryPersonnel') {
      return res.status(403).json({ error: 'User is not authorized to accept deliveries' });
    }

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });

    if (delivery.deliveryStatus !== 'pending') {
      return res.status(400).json({ error: 'This delivery has already been accepted or declined' });
    }

    if (delivery.driverId) {
      return res.status(400).json({ error: 'This delivery already has a driver assigned' });
    }

    // Assign driver and update status
    delivery.driverId = driverId;
    delivery.deliveryStatus = 'accepted';
    await delivery.save();

    res.status(200).json({ message: 'Delivery accepted successfully', delivery });
  } catch (err) {
    res.status(500).json({ error: 'Error accepting delivery', details: err.message });
  }
};

// Driver declines a delivery
exports.declineDelivery = async (req, res) => {
  const { deliveryId } = req.body;

  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });

    if (delivery.deliveryStatus !== 'pending') {
      return res.status(400).json({ error: 'This delivery has already been accepted or declined' });
    }

    delivery.deliveryStatus = 'declined';
    await delivery.save();

    res.status(200).json({ message: 'Delivery declined', delivery });
  } catch (err) {
    res.status(500).json({ error: 'Error declining delivery', details: err.message });
  }
};

// Update driver location during delivery
exports.updateDriverLocation = async (req, res) => {
  const { deliveryId, lat, lng } = req.body;
  const driverId = req.user.id;

  try {
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });

    if (!delivery.driverId || delivery.driverId.toString() !== driverId) {
      return res.status(403).json({ error: 'You are not assigned to this delivery' });
    }

    if (!['accepted', 'picked-up', 'on-the-way'].includes(delivery.deliveryStatus)) {
      return res.status(400).json({ error: 'Cannot update location. Delivery is not in progress.' });
    }

    delivery.driverLocation = { lat, lng };
    await delivery.save();

    res.status(200).json({ message: 'Driver location updated', driverLocation: delivery.driverLocation });
  } catch (err) {
    res.status(500).json({ error: 'Error updating driver location', details: err.message });
  }
};
