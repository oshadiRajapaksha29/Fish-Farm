const User = require('../../Model/Food&Medicine/Food&MedicineModel');
const Order = require('../../Model/OrderDetails/orderDetailsModel');

//display data
const getAllFoodAndMedicine = async (req, res, next) => {
    let foodAndMedicine;
    
    //get all
    try{
        foodAndMedicine = await User.find();
    }catch(err) {
       console.log(err);
    }
    //not found
    if(!foodAndMedicine) {
       return res.status(404).json({ message: 'No food and medicine found' });
    }

    return res.status(200).json({ foodAndMedicine });
};

//insert data
const insertFoodAndMedicine = async (req, res, next) => {
    const { productName, category, size, price, stock, description} = req.body;

    let foodAndMedicine;
    try {
        foodAndMedicine = new User({
            productName,
            category,
            size,
            price,
            stock,
            description,
            image: req.file ? req.file.filename : "",
        });

        await foodAndMedicine.save();
    } catch (err) {
        console.log(err);
    }

    if (!foodAndMedicine) {
        return res.status(404).json({ message: 'Unable to add food and medicine' });
    }

    return res.status(200).json({ foodAndMedicine });
};

//get byID
const getFoodAndMedicineById = async (req, res, next) => {
    const id = req.params.id;

    let foodAndMedicine;
    try {
        foodAndMedicine = await User.findById(id);
    } catch (err) {
        console.log(err);
    }

    if (!foodAndMedicine) {
        return res.status(404).json({ message: 'Food or medicine not found' });
    }

    return res.status(200).json({ foodAndMedicine });
};


//update details
const updateFoodAndMedicine = async (req, res, next) => {
  const id = req.params.id;
  const { productName, category, size, price, stock, description } = req.body;

  try {
    // Build updates object dynamically
    const updates = {
      productName,
      category,
      size,
      price,
      stock,
      description,
    };

    // Only update image if a new file is uploaded
    if (req.file) {
      updates.image = req.file.filename;
    }

    const foodAndMedicine = await User.findByIdAndUpdate(id, updates, {
      new: true,           // return updated doc
      runValidators: true, // ensure schema rules apply
    });

    if (!foodAndMedicine) {
      return res.status(404).json({ message: "Unable to update food and medicine" });
    }

    return res.status(200).json({ foodAndMedicine });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};




//delete details
const deleteFoodAndMedicine = async (req, res, next) => {
    const id = req.params.id;

    let foodAndMedicine;
    try {
        foodAndMedicine = await User.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
    }

    if (!foodAndMedicine) {
        return res.status(404).json({ message: 'Unable to delete food and medicine' });
    }

    return res.status(200).json({ foodAndMedicine });
};


exports.getPublicProducts = async (req, res) => {
  try {
    const products = await User.find({
      isActive: true,
      stock: { $gt: 0 }
    }).select("-__v"); // cleaner
    res.json({ products });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Food & Medicine Reports
exports.getFoodMedicineReports = async (req, res) => {
  try {
    // 1. Get top selling products
    const topProducts = await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'items.product',
          as: 'orders'
        }
      },
      {
        $project: {
          _id: 1,
          name: '$productName',
          category: 1,
          stock: 1,
          price: 1,
          sold: { 
            $sum: {
              $map: {
                input: '$orders',
                as: 'order',
                in: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: '$$order.items',
                          as: 'item',
                          cond: { $eq: ['$$item.product', '$_id'] }
                        }
                      },
                      as: 'item',
                      in: '$$item.quantity'
                    }
                  }
                }
              }
            }
          },
          revenue: {
            $multiply: [
              '$price',
              {
                $sum: {
                  $map: {
                    input: '$orders',
                    as: 'order',
                    in: {
                      $sum: {
                        $map: {
                          input: {
                            $filter: {
                              input: '$$order.items',
                              as: 'item',
                              cond: { $eq: ['$$item.product', '$_id'] }
                            }
                          },
                          as: 'item',
                          in: '$$item.quantity'
                        }
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      },
      { $sort: { sold: -1 } },
      { $limit: 10 }
    ]);

    // 2. Get inventory summary
    const inventorySummary = {
      totalItems: await User.countDocuments(),
      lowStock: await User.countDocuments({ stock: { $gt: 0, $lte: 10 } }),
      outOfStock: await User.countDocuments({ stock: 0 })
    };

    // 3. Get category split
    const categoryCounts = await User.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalItems = categoryCounts.reduce((acc, curr) => acc + curr.count, 0);
    const categorySplit = {
      food: 0,
      medicine: 0
    };

    categoryCounts.forEach(cat => {
      if (cat._id === 'food') {
        categorySplit.food = Math.round((cat.count / totalItems) * 100);
      } else if (cat._id === 'medicine') {
        categorySplit.medicine = Math.round((cat.count / totalItems) * 100);
      }
    });

    // 4. Get recent sales (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: 'Cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'food&medicinemodels',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          productName: '$productInfo.productName',
          quantity: '$items.quantity',
          revenue: { $multiply: ['$items.quantity', '$items.price'] }
        }
      },
      { $sort: { date: -1 } },
      { $limit: 20 }
    ]);

    // 5. Get monthly sales
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    
    // Generate array of past 6 months for report
    const generatePastSixMonths = () => {
      const months = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date();
        monthDate.setMonth(now.getMonth() - i);
        
        const yearMonth = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
        const month = monthNames[monthDate.getMonth()];
        
        months.push({ yearMonth, month });
      }
      
      return months;
    };
    
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $ne: 'Cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'food&medicinemodels',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          yearMonth: { 
            $dateToString: { format: '%Y-%m', date: '$createdAt' } 
          },
          month: { 
            $dateToString: { format: '%b', date: '$createdAt' } 
          },
          category: '$productInfo.category',
          revenue: { $multiply: ['$items.quantity', '$items.price'] }
        }
      },
      {
        $group: {
          _id: {
            yearMonth: '$yearMonth',
            month: '$month',
            category: '$category'
          },
          revenue: { $sum: '$revenue' }
        }
      },
      {
        $group: {
          _id: {
            yearMonth: '$_id.yearMonth',
            month: '$_id.month'
          },
          categories: {
            $push: {
              category: '$_id.category',
              revenue: '$revenue'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          yearMonth: '$_id.yearMonth',
          month: '$_id.month',
          food: {
            $reduce: {
              input: {
                $filter: {
                  input: '$categories',
                  as: 'cat',
                  cond: { $eq: ['$$cat.category', 'food'] }
                }
              },
              initialValue: 0,
              in: { $add: ['$$value', '$$this.revenue'] }
            }
          },
          medicine: {
            $reduce: {
              input: {
                $filter: {
                  input: '$categories',
                  as: 'cat',
                  cond: { $eq: ['$$cat.category', 'medicine'] }
                }
              },
              initialValue: 0,
              in: { $add: ['$$value', '$$this.revenue'] }
            }
          }
        }
      },
      { $sort: { yearMonth: 1 } }
    ]);

    // Ensure we have data for all six months
    const pastSixMonths = generatePastSixMonths();
    
    // Create a map for fast lookups
    const monthlySalesMap = {};
    monthlySales.forEach(item => {
      monthlySalesMap[item.month] = item;
    });
    
    // Fill in any missing months with zero values
    const completeMonthlySales = pastSixMonths.map(monthData => {
      return monthlySalesMap[monthData.month] || {
        month: monthData.month,
        food: 0,
        medicine: 0
      };
    });
    
    res.json({
      topProducts,
      inventorySummary,
      categorySplit,
      recentSales,
      monthlySales: completeMonthlySales
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({ message: 'Error generating reports', error: error.message });
  }
};

exports.getAllFoodAndMedicine = getAllFoodAndMedicine;  
exports.insertFoodAndMedicine = insertFoodAndMedicine;
exports.getFoodAndMedicineById = getFoodAndMedicineById;
exports.updateFoodAndMedicine = updateFoodAndMedicine;
exports.deleteFoodAndMedicine = deleteFoodAndMedicine;

