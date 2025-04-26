const { body, validationResult } = require('express-validator');

exports.validateRestaurantRegistration = [
  // Validate owner details
  body('OwnerName').notEmpty().withMessage('Owner name is required'),
  body('OwnerEmail').isEmail().withMessage('Invalid email address'),
  body('OwnerMobileNumber').isMobilePhone().withMessage('Invalid mobile number'),
  body('ManagerName').notEmpty().withMessage('Manager name is required'),
  body('ManagerMobileNumber').isMobilePhone().withMessage('Invalid mobile number'),
  body('restaurantName').notEmpty().withMessage('Restaurant name is required'),
  body('address').notEmpty().withMessage('Address is required'),

  // Validate bank account details
  body('bankAccountDetails.accountHolderName')
    .notEmpty()
    .withMessage('Account holder name is required'), 
  body('bankAccountDetails.accountNumber')
    .notEmpty()
    .withMessage('Account number is required'),
  body('bankAccountDetails.bankName')
    .notEmpty()
    .withMessage('Bank name is required'),

  // Validate operating hours
  body('operatingHours.Monday.isOpen').isBoolean().withMessage('Monday isOpen must be a boolean'),
  body('operatingHours.Tuesday.isOpen').isBoolean().withMessage('Tuesday isOpen must be a boolean'),
  body('operatingHours.Wednesday.isOpen').isBoolean().withMessage('Wednesday isOpen must be a boolean'),
  body('operatingHours.Thursday.isOpen').isBoolean().withMessage('Thursday isOpen must be a boolean'),
  body('operatingHours.Friday.isOpen').isBoolean().withMessage('Friday isOpen must be a boolean'),
  body('operatingHours.Saturday.isOpen').isBoolean().withMessage('Saturday isOpen must be a boolean'),
  body('operatingHours.Sunday.isOpen').isBoolean().withMessage('Sunday isOpen must be a boolean'),

  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];