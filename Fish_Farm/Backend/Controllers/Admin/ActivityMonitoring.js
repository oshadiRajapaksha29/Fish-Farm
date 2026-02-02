const LoginHistory = require("../../Model/Admin/LoginModel.js");
const User = require("../../Model/Admin/User.js");
const moment = require("moment");

exports.getLoginHistory = async (req, res) => {
  try {
    const {
      search,       // generic search: email, name, IP, location
      status,       // Success / Failed
      role,         // admin / employee / customer
      startDate,    // YYYY-MM-DD
      endDate,      // YYYY-MM-DD
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};

    // Filter by status
    if (status) filter.status = status;

    // Filter by login date range
    if (startDate || endDate) {
      filter.loginTime = {};
      if (startDate) filter.loginTime.$gte = moment(startDate, "YYYY-MM-DD").startOf("day").toDate();
      if (endDate) filter.loginTime.$lte = moment(endDate, "YYYY-MM-DD").endOf("day").toDate();
    }

    // Filter by user role
    let userFilter = {};
    if (role) userFilter.role = role;

    // Search across multiple fields
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      filter.$or = [
        { email: searchRegex },
        { ipAddress: searchRegex },
        { "location.country": searchRegex },
        { "location.region": searchRegex },
        { "location.city": searchRegex },
      ];
      // For name search, we need to look inside populated user document
      userFilter.name = searchRegex;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Find users matching role / name filter (if any)
    let userIds = [];
    if (Object.keys(userFilter).length > 0) {
      const users = await User.find(userFilter, "_id");
      userIds = users.map((u) => u._id);
      // If searching by user and no matching users, return empty
      if (userIds.length === 0) {
        return res.status(200).json({
          success: true,
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          totalPages: 0,
          data: []
        });
      }
      filter.user = { $in: userIds };
    }

    const total = await LoginHistory.countDocuments(filter);

    const history = await LoginHistory.find(filter)
      .populate("user", "name email role")
      .sort({ loginTime: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      data: history
    });
  } catch (error) {
    console.error("Error fetching login history:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
