//backend/Routes/Breeding/BabyRoutes.js
const express = require('express');
const router = express.Router();
const BabyControllers = require('../../Controllers/Breeding/BabyControllers');
// Routes
router.get('/', BabyControllers.getAllBabies);
router.get('/:id', BabyControllers.getBabyById);
router.post('/', BabyControllers.addBaby);
router.put('/:id', BabyControllers.updateBaby);
router.delete('/:id', BabyControllers.deleteBaby);

module.exports = router;