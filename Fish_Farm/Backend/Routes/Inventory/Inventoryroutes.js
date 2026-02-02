const express = require("express");
const router = express.Router();

//Insert model
const Inventory = require("../../Model/Inventory/Inventorymodel");
//Insert Task Controller
const InventoryController = require("../../Controllers/Inventory/InventoryController");

router.get("/",InventoryController.getAllInventory);
router.post("/",InventoryController.addInventory);
router.get("/:id",InventoryController.getById);
router.put("/:id",InventoryController.updateInventory);
router.delete("/:id",InventoryController.deleteInventory);



//export
module.exports =router;