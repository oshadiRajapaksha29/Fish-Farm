const express = require('express');
const router = express.Router();
const invoiceController = require('../../Controllers/OrderDetails/invoiceController');

// Generate invoice for an order
router.get('/:orderId/generate', invoiceController.generateInvoice);

// Get invoice info
router.get('/:orderId', invoiceController.getInvoice);

module.exports = router;
