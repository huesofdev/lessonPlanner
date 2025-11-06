import mongoose from "mongoose";
import Course from "./Course.model.js";
import User from "./User.model.js";

const courseAssignment = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  mode: {
    type: String,
    enum: ["parttime", "fulltime"],
    required: true,
  },
});

courseAssignment.index({ course: 1, mode: 1 }, { unique: true });

const CourseAssignment = mongoose.model("courseAssignment", courseAssignment);

export default CourseAssignment;
