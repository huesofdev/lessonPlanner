import mongoose from "mongoose";
import * as z from "zod";
import Course from "../models/Course.model.js";
import CourseAssignment from "../models/CourseAssignment.model.js";
import LessonRecord from "../models/LessonRecord.model.js";
import User from "../models/User.model.js";
// ====================== ADD COURSE ======================
export const addCourse = async (req, res) => {
  try {
    // Ensure only HODs can add courses
    if (req.user.role !== "hod") {
      throw new Error("Only HODs can add courses");
    }

    // Validation schema
    const courseSchema = z
      .object({
        courseId: z.string().min(3, "Course ID not valid"),
        courseTitle: z.string().min(3, "Course title should be valid"),
        department: z.enum(["it", "english", "accountancy"]),
        semester: z.enum(["1", "2"]).transform(Number),
        year: z.enum(["1", "2", "3", "4"]).transform(Number),
        mode: z.enum(["fulltime", "parttime"]),
      })
      .superRefine((data, ctx) => {
        if (data.department === "accountancy" && ![1, 2, 3, 4].includes(data.year)) {
          ctx.addIssue({
            code: "custom",
            message: "Accountancy can only have 1–4 years",
            path: ["year"],
          });
        }

        if (data.department !== "accountancy" && ![1, 2].includes(data.year)) {
          ctx.addIssue({
            code: "custom",
            message: "IT and English can only have 1–2 years",
            path: ["year"],
          });
        }
      });

    const parsedCourse = courseSchema.parse(req.body);

    // HODs can only add courses for their own department
    if (parsedCourse.department !== req.user.department) {
      throw new Error("You can only add courses within your own department");
    }

    await Course.create(parsedCourse);

    res.status(201).json({
      success: true,
      data: [],
      message: "Course added successfully",
      errors: [],
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      data: [],
      message: error.message,
      errors: [],
    });
  }
};

// ====================== UPDATE COURSE ======================
export const updateCourse = async (req, res) => {
  try {
    if (req.user.role !== "hod") {
      throw new Error("Only HODs can update courses");
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new Error("Invalid course ID");
    }

    // Zod schema for update
    const courseSchema = z
      .object({
        courseTitle: z.string().min(3).optional(),
        department: z.enum(["it", "english", "accountancy"]).optional(),
        semester: z.enum(["1", "2"]).transform(Number).optional(),
        year: z.enum(["1", "2", "3", "4"]).transform(Number).optional(),
        mode: z.enum(["fulltime", "parttime"]).optional(),
      })
      .superRefine((data, ctx) => {
        if (data.department === "accountancy" && data.year && ![1, 2, 3, 4].includes(data.year)) {
          ctx.addIssue({
            code: "custom",
            message: "Accountancy can only have 1–4 years",
            path: ["year"],
          });
        }

        if (data.department && data.department !== "accountancy" && data.year && ![1, 2].includes(data.year)) {
          ctx.addIssue({
            code: "custom",
            message: "IT and English can only have 1–2 years",
            path: ["year"],
          });
        }
      });

    const parsedData = courseSchema.parse(req.body);

    const course = await Course.findById(req.params.id);
    if (!course) throw new Error("Course not found");

    if (course.department !== req.user.department) {
      throw new Error("You can only update courses in your own department");
    }

    // Check for potential duplicate if mode or courseId is updated
    if ((parsedData.courseId && parsedData.courseId !== course.courseId) || parsedData.mode) {
      const existing = await Course.findOne({
        courseId: parsedData.courseId || course.courseId,
        mode: parsedData.mode || course.mode,
        _id: { $ne: course._id },
      });
      if (existing) throw new Error("A course with this ID and mode already exists");
    }

    Object.assign(course, parsedData);
    await course.save();

    res.status(200).json({
      success: true,
      data: course,
      message: "Course updated successfully",
      errors: [],
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      data: [],
      message: error.message,
      errors: [],
    });
  }
};

// ====================== DELETE COURSE ======================
export const deleteCourse = async (req, res) => {
  try {
    if (req.user.role !== "hod") {
      throw new Error("Only HODs can delete courses");
    }

    // Validate ObjectId first
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new Error("Invalid course ID");
    }

    // Find by MongoDB _id
    const course = await Course.findById(req.params.id);
    if (!course) throw new Error("Course not found");

    if (course.department !== req.user.department) {
      throw new Error("You can only delete courses in your own department");
    }

    // Delete the course
    await Course.findByIdAndDelete(req.params.id);

    // Also delete any assignments linked to this course
    await CourseAssignment.deleteMany({ course: req.params.id });

    res.status(200).json({
      success: true,
      data: [],
      message: "Course and related assignments deleted successfully",
      errors: [],
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      data: [],
      message: error.message,
      errors: [],
    });
  }
};
// ====================== ASSIGN COURSE TO LECTURER ======================
export const assignCourse = async (req, res) => {
  try {
    const courseId = req.params.id; // courseId from URL
    const { lecturer } = req.body; // lecturer ID and mode from body

    const hod = await User.findById(req.user._id);

    if (!hod || hod.role !== "hod") {
      throw new Error("Only HODs can assign lecturers");
    }

    // Find the course by Mongoose _id (not custom courseId)
    const course = await Course.findById(courseId);
    if (!course) throw new Error("Course not found");

    const{mode} = course;

    // Ensure HOD can only assign lecturers in their department
    if (course.department !== hod.department) {
      throw new Error("You can only assign lecturers to courses in your own department");
    }

    // Validate lecturer
    const lecturerUser = await User.findById(lecturer);
    if (!lecturerUser || lecturerUser.role === "admin") {
      throw new Error("Invalid lecturer ID");
    }

    // Check for existing assignment (course + mode must be unique)
    const existingAssignment = await CourseAssignment.findOne({
      course: course._id,
      mode: mode,
    });
    if (existingAssignment) {
      throw new Error("This course and mode are already assigned to a lecturer");
    }

    // Create the assignment
    await CourseAssignment.create({
      course: course._id,
      lecturer: lecturerUser._id,
      assignedBy: hod._id,
      mode,
    });

    res.status(201).json({
      success: true,
      data: [],
      message: "Course assigned successfully",
      errors: [],
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      data: [],
      message: error.message,
      errors: [],
    });
  }
};


//===========update the lectuere========================//

export const updateCourseLecturer = async (req, res) => {
  try {
    const { role, department } = req.user;

    // Only HODs can update assignments
    if (role !== "hod") {
      return res.status(403).json({
        success: false,
        data: [],
        message: "You do not have permission to reassign lecturers",
        errors: [],
      });
    }

    const { id } = req.params; // assignment id
    const { lecturer } = req.body; // new lecturer id

    if (!lecturer?.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        data: [],
        message: "Invalid lecturer ID format",
        errors: [],
      });
    }

    // Find the assignment and populate the course
    const assignment = await CourseAssignment.findById(id).populate("course");
    if (!assignment) {
      return res.status(404).json({
        success: false,
        data: [],
        message: "Assignment not found",
        errors: [],
      });
    }

    // Only the HOD of the course's department can update
    if (department !== assignment.course.department) {
      return res.status(403).json({
        success: false,
        data: [],
        message: "You can only reassign lecturers for courses in your department",
        errors: [],
      });
    }

    // Check if the lecturer is already assigned to this course+mode
    if (assignment.lecturer.toString() === lecturer) {
      return res.status(400).json({
        success: false,
        data: [],
        message: "This lecturer is already assigned to this course",
        errors: [],
      });
    }

    // Find the new lecturer (any department allowed)
    const newLecturer = await User.findById(lecturer);
    if (!newLecturer) {
      return res.status(404).json({
        success: false,
        data: [],
        message: "Lecturer not found",
        errors: [],
      });
    }

    // Update the assignment
    assignment.lecturer = lecturer;
    await assignment.save();

    res.status(200).json({
      success: true,
      data: assignment,
      message: "Lecturer reassigned successfully",
      errors: [],
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      data: [],
      message: error.message,
      errors: [],
    });
  }
};



//geting assingment unassignment deails:

export const getUnassignedDetails = async (req, res) => {
try {
    const hodDepartment = req.user.department; // HOD's department

    // 1️⃣ Get assigned course IDs in this department
    const assignedCourseIds = await CourseAssignment.find()
      .populate({
        path: "course",
        match: { department: hodDepartment },
        select: "_id",
      })
      .distinct("course");

    // 2️⃣ Get all unassigned courses in HOD's department
    const availableCourses = await Course.find({
      _id: { $nin: assignedCourseIds },
      department: hodDepartment,
    }).lean();

    // 3️⃣ Get all lecturers and HODs (any department)
    const users = await User.find({ role: { $in: ["lecturer", "hod"] } })
      .select("firstName lastName role department")
      .lean()
      .then(users =>
        users.map(u => ({
          _id: u._id,
          name: u.firstName + " " + u.lastName,
          role: u.role,
          department: u.department
        }))
      );

    // 4️⃣ Send response
    res.json({
      success: true,
      data: {
        courses: availableCourses,
        lecturers: users,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
}



//getting all the assignments
// controllers/hodController.js

export const getAllAssignments = async (req, res) => {
  try {
    // Fetch all assignments
    const assignments = await CourseAssignment.find()
      .populate({
        path: "course",
        select: "_id courseId courseTitle department year semester mode",
      })
      .populate({
        path: "lecturer",
        select: "_id firstName lastName email role department",
      })
      .populate({
        path: "assignedBy",
        select: "_id firstName lastName email role department",
      })
      .lean(); // convert to plain JS objects

    // Format assignments for frontend
    const formattedAssignments = assignments.map(a => ({
      _id: a._id,
      mode: a.mode,
      course: a.course, // full course object
      lecturer: {
        _id: a.lecturer._id,
        name: a.lecturer.firstName + " " + a.lecturer.lastName,
        email: a.lecturer.email,
        role: a.lecturer.role,
        department: a.lecturer.department,
      },
      assignedBy: {
        _id: a.assignedBy._id,
        name: a.assignedBy.firstName + " " + a.assignedBy.lastName,
        email: a.assignedBy.email,
        role: a.assignedBy.role,
        department: a.assignedBy.department,
      },
    }));

    res.status(200).json({
      success: true,
      data: formattedAssignments,
    });
  } catch (err) {
    console.error("Error fetching assignments:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      data: [],
    });
  }
};


//getall courses:

export const getAllCourses = async (req, res) => {
  try {
    const hodDepartment = req.user.department; // HOD's department

    // Fetch courses only in the HOD's department
    const courses = await Course.find({ department: hodDepartment }).lean();

    const formattedCourses = courses.map(course => ({
      _id: course._id,
      courseId: course.courseId,
      courseTitle: course.courseTitle,
      department: course.department,
      year: course.year,
      semester: course.semester,
      mode: course.mode
    }));

    res.status(200).json({
      success: true,
      data: formattedCourses
    });
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      data: []
    });
  }
};


//getDepartment lessonrecords

export const getDepartmentLessonRecords = async (req, res) => {
  try {
    const hodDepartment = req.user.department; // HOD's department

    // 1️⃣ Fetch lesson records where the course belongs to HOD's department
    const lessonRecords = await LessonRecord.find()
      .populate({
        path: "course",
        match: { department: hodDepartment }, // filter by HOD's department
        select: "_id courseId courseTitle department year semester mode",
      })
      .populate({
        path: "lecturer",
        select: "_id firstName lastName email role department",
      })
      .lean();

    // 2️⃣ Filter out records where course didn't match (populate returns null if no match)
    const filteredRecords = lessonRecords.filter(record => record.course !== null);

    // 3️⃣ Format for frontend (optional)
    const formattedRecords = filteredRecords.map(record => ({
      _id: record._id,
      mode: record.mode,
      date: record.date,
      startTime: record.startTime,
      endTime: record.endTime,
      studentAttendance: record.studentAttendance,
      lessons: record.lessons,
      course: record.course, // populated course object
      lecturer: {
        _id: record.lecturer._id,
        name: record.lecturer.firstName + " " + record.lecturer.lastName,
        email: record.lecturer.email,
        role: record.lecturer.role,
        department: record.lecturer.department,
      },
    }));

    res.status(200).json({
      success: true,
      data: formattedRecords,
    });
  } catch (err) {
    console.error("Error fetching department lesson records:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      data: [],
    });
  }
};


// HOD Dashboard
export const getHodDashboard = async (req, res) => {
  try {
    const hodId = req.user._id;
    const department = req.user.department;

    // ---------- PERSONAL DATA ----------
    const personalAssignments = await CourseAssignment.find({ lecturer: hodId })
      .populate({
        path: "course",
        select: "_id courseId courseTitle department year semester mode",
      })
      .lean();

    const personalTotalAssignments = personalAssignments.length;

    const personalAssignedCourses = personalAssignments
      .filter(a => a.course !== null)
      .map(a => ({
        assignmentId: a._id,
        course: a.course,
        mode: a.mode,
      }));

    const personalTotalLessonRecords = await LessonRecord.countDocuments({ lecturer: hodId });

    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

    const personalLessonRecordsThisWeek = await LessonRecord.countDocuments({
      lecturer: hodId,
      date: { $gte: startOfWeek, $lte: endOfWeek },
    });

    const personalRecentLessonRecords = await LessonRecord.find({ lecturer: hodId })
      .populate("course", "_id courseId courseTitle department")
      .sort({ date: -1 })
      .limit(10)
      .lean();

    // ---------- DEPARTMENT DATA ----------
    // Total courses in department
    const departmentTotalCourses = await Course.countDocuments({ department });

    // All users in the department
    const departmentLecturersList = await User.find({ department })
      .select("_id firstName lastName email role")
      .lean();

    const lecturerIds = departmentLecturersList.map(l => l._id);

    const departmentAssignments = await CourseAssignment.find({ lecturer: { $in: lecturerIds } })
      .populate({
        path: "course",
        select: "_id courseId courseTitle department year semester mode",
      })
      .populate({
        path: "lecturer",
        select: "_id firstName lastName email role",
      })
      .lean();

    const departmentTotalAssignments = departmentAssignments.length;

    const departmentTotalLessonRecords = await LessonRecord.countDocuments({ lecturer: { $in: lecturerIds } });

    const departmentLessonRecordsThisWeek = await LessonRecord.countDocuments({
      lecturer: { $in: lecturerIds },
      date: { $gte: startOfWeek, $lte: endOfWeek },
    });

    const departmentRecentLessonRecords = await LessonRecord.find({ lecturer: { $in: lecturerIds } })
      .populate("course", "_id courseId courseTitle department")
      .populate("lecturer", "_id firstName lastName email role")
      .sort({ date: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        personal: {
          totalAssignments: personalTotalAssignments,
          totalLessonRecords: personalTotalLessonRecords,
          lessonRecordsThisWeek: personalLessonRecordsThisWeek,
          assignedCourses: personalAssignedCourses,
          recentLessonRecords: personalRecentLessonRecords,
        },
        department: {
          totalCourses: departmentTotalCourses, // ✅ new addition
          totalAssignments: departmentTotalAssignments,
          totalLessonRecords: departmentTotalLessonRecords,
          lessonRecordsThisWeek: departmentLessonRecordsThisWeek,
          assignments: departmentAssignments,
          recentLessonRecords: departmentRecentLessonRecords,
          lecturers: departmentLecturersList,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching HOD dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching HOD dashboard",
      data: [],
    });
  }
};
