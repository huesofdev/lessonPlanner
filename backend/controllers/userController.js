import bcrypt from "bcrypt";
import { genarateJwt } from "../utils/jwt.util.js";
import * as z  from 'zod';
import User from "../models/User.model.js";
import LessonRecord from "../models/LessonRecord.model.js";
import Course from "../models/Course.model.js";
import CourseAssignment from "../models/CourseAssignment.model.js";




// ====================== SIGNUP ======================

export const createUser = async (req, res) => {
  try {
    if (req.user) {
      return res.status(403).json({
        success: false,
        data: [],
        message: "You must logout before signing up",
        errors: [],
      });
    }

    const signupSchema = z.object({
      firstName: z.string().min(2),
      lastName: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
      role: z.enum(["admin", "lecturer", "hod"]),
      department: z.enum(["it", "accountancy", "english", "visiting"]),
    });

    const user = signupSchema.parse(req.body);
    user.passwordHash = await bcrypt.hash(user.password, 10);
    const newUser = await User.create(user);

    // Now newUser._id exists
const token = genarateJwt({
  _id: newUser._id,
  email: newUser.email,
  firstName: newUser.firstName,
  lastName: newUser.lastName,
  role: newUser.role,
  department: newUser.department,
  isActive: newUser.isActive
});

    res.status(201).json({
      success: true,
      data: token,
      message: "Account created successfully",
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
}

// ====================== SIGNIN ======================
export const userLogin = async (req, res) => {
  try {
    if (req.user) {
      return res.status(403).json({
        success: false,
        data: [],
        message: "You are already signed in",
        errors: [],
      });
    }

    const signinSchema = z.object({
      email: z.email(),
      password: z.string().min(8),
    });

    const credentials = signinSchema.parse(req.body);

    const user = await User.findOne({ email: credentials.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        data: [],
        message: "No user found",
        errors: [],
      });
    }

    const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        data: [],
        message: "Invalid credentials",
        errors: [],
      });
    }

    const { _id, email, firstName,isActive,  lastName, role, department } = user;
    const token = genarateJwt({ _id, email, isActive, firstName, lastName, role, department });

    res.status(200).json({
      success: true,
      data: token,
      message: "Signed in successfully",
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

// ====================== CREATE LESSON RECORD ======================
export const createLessonRecord = async (req, res) => {
  try {
    const { role } = req.user;
    const lecturer = req.user._id.toString();

    // Only HODs or lecturers can add lesson records
    if (role !== "hod" && role !== "lecturer") {
      return res.status(403).json({
        success: false,
        data: [],
        message: "You must be a HOD or lecturer to add lesson records",
        errors: [],
      });
    }

    const { id } = req.params;
    const { date, startTime, endTime, studentAttendance, lessons } = req.body;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/) || !lecturer.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        data: [],
        message: "Invalid courseId or lecturer ID",
        errors: [],
      });
    }

    // Fetch course
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        data: [],
        message: "Course not found",
        errors: [],
      });
    }

    // Check if lecturer is assigned to this course
    const assignmentExists = await CourseAssignment.findOne({
      course: course._id,
      lecturer,
      mode: course.mode,
    });

    if (!assignmentExists) {
      return res.status(400).json({
        success: false,
        data: [],
        message: "Lecturer is not assigned to this course",
        errors: [],
      });
    }

    // Time validation helpers
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const toMinutes = (time) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    // Validate using zod
    const lessonRecordSchema = z
      .object({
        course: z.string().regex(/^[0-9a-fA-F]{24}$/),
        lecturer: z.string().regex(/^[0-9a-fA-F]{24}$/),
        date: z.coerce.date(),
        startTime: z.string().regex(timeRegex),
        endTime: z.string().regex(timeRegex),
        studentAttendance: z.number().min(1),
        lessons: z.array(z.string()).min(1),
        mode: z.enum(["fulltime", "parttime"]),
      })
      .refine((data) => toMinutes(data.endTime) > toMinutes(data.startTime), {
        message: "endTime must be later than startTime",
        path: ["endTime"],
      });

    const parsedRecord = lessonRecordSchema.parse({
      course: course._id.toString(),
      lecturer,
      date,
      startTime,
      endTime,
      studentAttendance,
      lessons,
      mode: course.mode,
    });

    // Create lesson record
    const newRecord = await LessonRecord.create(parsedRecord);

    res.status(201).json({
      success: true,
      data: newRecord,
      message: "Lesson record added successfully",
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
}


export const getAssignedCourses = async (req, res) => {
   try {
    if (!req.user && req.user.role === "admin") {
      return res.status(403).json({
        success: false,
        data: [],
        message: "admins can't get courses ",
        errors: [],
      });
    }
  const lecturerId = req.user._id;

  const assignments = await CourseAssignment.find({lecturer:lecturerId}).populate(
    {
      path:"course",
      select: "_id courseTitle courseId mode"
    }
  ).exec();
   




    res.status(201).json({
      success: true,
      data: assignments,
      message: "Account created successfully",
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
}

//view assigned courses:

// controllers/courseAssignmentController.js

export const getMyAssignedCourses = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1️⃣ Find all course assignments for the logged-in user
    const assignments = await CourseAssignment.find({ lecturer: userId })
      .populate({
        path: "course",
        select: "_id courseId courseTitle department year semester mode",
      })
      .lean();

    // 2️⃣ Filter out assignments without a course (just in case)
    const filteredAssignments = assignments.filter(a => a.course !== null);

    // 3️⃣ Count lesson records for each course
    const result = await Promise.all(
      filteredAssignments.map(async (assignment) => {
        const lessonCount = await LessonRecord.countDocuments({
          course: assignment.course._id,
          mode: assignment.mode
        });

        return {
          _id: assignment._id,
          course: assignment.course,
          mode: assignment.mode,
          lessonCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Error fetching my assigned courses:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      data: [],
    });
  }
};


//getting the course related lesson records:

export const getLessonRecordsByCourse = async (req, res) => {
  try {
    const lecturerId = req.user._id; // from auth middleware
    const { id } = req.params;
    console.log(req.user.firstName);
    console.log(id)

    // ✅ 1. Verify lecturer is assigned to the course
    const assigned = await CourseAssignment.findOne({
      course: id,
      lecturer: lecturerId,
    });

    if (!assigned) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this course",
      });
    }

    // ✅ 2. Fetch lesson records with populated course details
    const records = await LessonRecord.find({ course: id })
      .populate("course", "courseId courseTitle department")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (err) {
    console.error("Error fetching lesson records:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching lesson records",
    });
  }
};


//update lessonrecord: with lessonrecord id

export const updateLessonRecord = async (req, res) => {
  try {
    const { role } = req.user;
    const lecturer = req.user._id.toString();

    if (role !== "hod" && role !== "lecturer") {
      return res.status(403).json({
        success: false,
        data: [],
        message: "You must be a HOD or lecturer to update lesson records",
        errors: [],
      });
    }

    const { lessonRecordId } = req.params;
    const { date, startTime, endTime, studentAttendance, lessons } = req.body;

    if (!lessonRecordId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        data: [],
        message: "Invalid lessonRecordId",
        errors: [],
      });
    }

    // Fetch the existing lesson record
    const existingRecord = await LessonRecord.findById(lessonRecordId);
    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        data: [],
        message: "Lesson record not found",
        errors: [],
      });
    }

    // Check if lecturer is assigned to the course
    const assignmentExists = await CourseAssignment.findOne({
      course: existingRecord.course,
      lecturer,
      mode: existingRecord.mode,
    });

    if (!assignmentExists) {
      return res.status(400).json({
        success: false,
        data: [],
        message: "Lecturer is not assigned to this course",
        errors: [],
      });
    }

    // Time validation helpers
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const toMinutes = (time) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    // Validate input using Zod
    const lessonRecordSchema = z
      .object({
        date: z.coerce.date(),
        startTime: z.string().regex(timeRegex),
        endTime: z.string().regex(timeRegex),
        studentAttendance: z.number().min(1),
        lessons: z.array(z.string()).min(1),
      })
      .refine((data) => toMinutes(data.endTime) > toMinutes(data.startTime), {
        message: "endTime must be later than startTime",
        path: ["endTime"],
      });

    const parsedData = lessonRecordSchema.parse({
      date,
      startTime,
      endTime,
      studentAttendance,
      lessons,
    });

    // Update the record
    existingRecord.date = parsedData.date;
    existingRecord.startTime = parsedData.startTime;
    existingRecord.endTime = parsedData.endTime;
    existingRecord.studentAttendance = parsedData.studentAttendance;
    existingRecord.lessons = parsedData.lessons;

    await existingRecord.save();

    return res.status(200).json({
      success: true,
      data: existingRecord,
      message: "Lesson record updated successfully",
      errors: [],
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: [],
      message: error.message,
      errors: [],
    });
  }
};




//get all the lesson records:

// Get all lesson records for the logged-in user
export const getAllLessonRecordsForUser = async (req, res) => {
  try {
    const userId = req.user._id; // logged-in user's ObjectId

    // 1️⃣ Fetch all course assignments for this user and populate course details
    const assignments = await CourseAssignment.find({ lecturer: userId })
      .populate({
        path: "course",
        select: "_id courseId courseTitle department year semester mode",
      })
      .lean();

    if (!assignments.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: "No course assignments found for this user",
      });
    }

    // 2️⃣ Filter out assignments where the course was deleted or missing
    const validAssignments = assignments.filter(a => a.course !== null);

    // 3️⃣ Fetch lesson records for each assigned course
    const result = await Promise.all(
      validAssignments.map(async (assignment) => {
        const records = await LessonRecord.find({
          course: assignment.course._id,
          mode: assignment.mode,
          lecturer: userId,
        })
        .populate("course", "_id courseId courseTitle department")
        .sort({ date: -1 })
        .lean();

        return {
          assignmentId: assignment._id,
          course: assignment.course,
          mode: assignment.mode,
          lessonRecords: records,
          lessonCount: records.length,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });

  } catch (error) {
    console.error("Error fetching lesson records:", error);
    return res.status(500).json({
      success: false,
      data: [],
      message: "Server error while fetching lesson records",
    });
  }
};


// Dashboard stats for logged-in lecturer
export const getLecturerDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // ✅ 1. Total course assignments & get assigned courses with details
    const assignments = await CourseAssignment.find({ lecturer: userId })
      .populate({
        path: "course",
        select: "_id courseId courseTitle department year semester mode",
      })
      .lean();

    const totalAssignments = assignments.length;

    // Filter out invalid or deleted courses just in case
    const assignedCourses = assignments
      .filter(a => a.course !== null)
      .map(a => ({
        assignmentId: a._id,
        course: a.course,
        mode: a.mode,
      }));

    // Get array of course ObjectIds
    const assignedCourseIds = assignedCourses.map(a => a.course._id);

    // ✅ 2. Total lesson records for this lecturer
    const totalLessonRecords = await LessonRecord.countDocuments({ lecturer: userId });

    // ✅ 3. Total lesson records for this week
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

    const lessonRecordsThisWeek = await LessonRecord.countDocuments({
      lecturer: userId,
      date: { $gte: startOfWeek, $lte: endOfWeek },
    });

    // ✅ 4. Recent 10 lesson records
    const recentLessonRecords = await LessonRecord.find({ lecturer: userId })
      .populate("course", "_id courseId courseTitle department")
      .sort({ date: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        totalAssignments,
        totalLessonRecords,
        lessonRecordsThisWeek,
        assignedCourses,
        recentLessonRecords,
      },
    });
  } catch (error) {
    console.error("Error fetching lecturer dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard",
      data: [],
    });
  }
};


//profile api

export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-passwordHash").lean(); // exclude passwordHash
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
      data: [],
    });
  }
};


//passwordchna

// -------------------- CHANGE PASSWORD --------------------
export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both oldPassword and newPassword are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.passwordHash = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while changing password",
    });
  }
};