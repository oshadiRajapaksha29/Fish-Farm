const Inventory =require("../../Model/Inventory/Inventorymodel");

const getAllInventory = async(req, res, next) => {
    let inventory;

    try{
        inventory = await Inventory.find();

    }catch(err){
        console.log(err);
    }
    //not found
    if(!inventory){
        return res.status(404).json({message:"Inventory not found"});

    }
    //Display all Task
    return res.status(200).json({inventory});

};

//data Insert
const addInventory=async(req,res,next) =>{
    const{inventoryName,category,quantity,unit,reorder_level} = req.body;

    let inventory;

    try{
        inventory = new Inventory({inventoryName,category,quantity,unit,reorder_level});
        await inventory.save();
    }catch(err){
        console.log(err);
    }

    //not insert inventory
    if(!inventory){
        return res.status(404).json({message:"unable to add inventory"});

    }
    return res.status(200).json({inventory});

};
//Get by Id
const getById = async(req, res, next)=>{
    const id = req.params.id;

    let inventory;
    try{
        inventory = await Inventory.findById(id);
    }catch (err){
        console.log(err);
    }

     //not available task
    if(!inventory){
        return res.status(404).json({message:"inventory not available"});

    }
    return res.status(200).json({inventory});

}
//Update inventory Details
const updateInventory = async(req,res,next)=>{
     const id = req.params.id;
    const{inventoryName,category,quantity,unit,reorder_level} = req.body;

    let inventory;

    try{
        inventory= await Inventory.findByIdAndUpdate(id,{inventoryName,category,quantity,unit,reorder_level},
            {new:true}
        );
        
    }catch(err){
        console.log(err);
    }
     //not update inventory
    if(!inventory){
        return res.status(404).json({message:"inventory not update"});

    }
    return res.status(200).json({inventory});


}

// delete inventory details
const deleteInventory = async(req,res,next) =>{
    const id = req.params.id;
  
    let inventory;

    try{
        inventory= await Inventory.findByIdAndDelete(id);
       
    }catch(err){
        console.log(err);
    }
     //not delete inventory
    if(!inventory){
        return res.status(404).json({message:"inventory not delete"});

    }
    return res.status(200).json({inventory});

}

exports.getAllInventory = getAllInventory;
exports.addInventory = addInventory;
exports.getById = getById;
exports.updateInventory = updateInventory;
exports.deleteInventory = deleteInventory;