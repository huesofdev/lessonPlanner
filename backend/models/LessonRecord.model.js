import mongoose from "mongoose";

const lessonRecordSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  mode: {
    type: String,
    enum: ["fulltime", "parttime"],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: "time should be in HH:MM (24hr) format",
    },
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: "time should be in HH:MM (24hr) format",
    },
  },
  studentAttendance: {
    type: Number,
    required: true,
    min: [1, "attendance must be greater than 0"],
  },
  lessons: {
    type: [String],
    required: true,
    validate: {
      validator: (v) => v.length > 0,
      message: "at least one lesson is required",
    },
  },
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Prevent duplicate lesson record for the same course, date, and mode
lessonRecordSchema.index({ course: 1, date: 1, mode: 1 }, { unique: true });

const LessonRecord = mongoose.model("LessonRecord", lessonRecordSchema);

export default LessonRecord;
