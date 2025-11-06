import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
  },
  courseTitle: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    enum: ["it", "accountancy", "english"],
  },
  year: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        if (this.department === "accountancy") {
          return [1, 2, 3, 4].includes(v);
        } else {
          return [1, 2].includes(v);
        }
      },
      message: "Only accountancy has 4 years; IT & English only 2 years",
    },
  },
  semester: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        return [1, 2].includes(v);
      },
      message: "Only two semesters are allowed",
    },
  },
  mode: {
    type: String,
    enum: ["fulltime", "parttime"],
    required: true,
  },
});

// Compound index to ensure unique courseId + mode
courseSchema.index({ courseId: 1, mode: 1 }, { unique: true });

const Course = mongoose.model("Course", courseSchema);

export default Course;
