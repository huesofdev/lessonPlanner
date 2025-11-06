import mongoose from "mongoose";
import Course from "./models/Course.model.js";

mongoose.connect("mongodb://127.0.0.1:27017/lessondb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function extractCourseIds() {
  try {
    const departments = ["it", "accountancy", "english"];
    const result = {};

    for (const dept of departments) {
      const fulltime = await Course.find({
        department: dept,
        mode: "fulltime",
      }).select("_id");

      const parttime = await Course.find({
        department: dept,
        mode: "parttime",
      }).select("_id");

      result[dept] = {
        fulltime: fulltime.map((c) => c._id.toString()),
        parttime: parttime.map((c) => c._id.toString()),
      };
    }

    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Error extracting course IDs:", err);
  } finally {
    mongoose.connection.close();
  }
}

extractCourseIds();
