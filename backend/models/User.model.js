import mongoose from "mongoose";

const user = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["lecturer", "hod", "admin"],
    default: "lecturer",
    required: true,
  },
  department: {
    type: String,
    enum: ["it", "accountancy", "english", "visiting", null],
    required: function() {
      // Department is required only if role is NOT admin
      return this.role !== "admin";
    },
    validate: {
      validator: function(value) {
        // If role is admin, department must be null/undefined
        if (this.role === "admin") {
          return value == null || value === undefined;
        }
        // For other roles, department must be provided
        return value != null;
      },
      message: "Admin users cannot have a department"
    }
  },
  isActive: {
    type: Boolean,
    default: function() {
      // Default to true only for admin, false for others
      return this.role === "admin";
    },
  },
});

const User = mongoose.model("User", user);

export default User;