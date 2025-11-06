
import User from "../models/User.model.js";

// Approve user - set isActive to true
export const approveUser =  async (req, res) => {
  try {
    const { role } = req.user;
    
    // Only admin can approve users
    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        msg: "Only admin can approve users",
      });
    }

    const { userId } = req.params;

    // Validate userId format (MongoDB ObjectId)
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid user ID format",
      });
    }

    // Find and update the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    console.log(user);

    // Check if already active
    if (user.isActive) {
      return res.status(400).json({
        success: false,
        msg: "User is already active",
      });
    }

    // Update isActive to true
    user.isActive = true;
    await user.save();

    res.status(200).json({
      success: true,
      msg: "User approved successfully",
      data: {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: error.message,
    });
  }
};