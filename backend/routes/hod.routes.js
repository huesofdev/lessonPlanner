import { Router } from "express";
import authMiddleware from "../middlewares/jwt.auth.js";
import { addCourse, assignCourse, deleteCourse, getAllAssignments, getAllCourses, getDepartmentLessonRecords, getHodDashboard, getUnassignedDetails, updateCourse, updateCourseLecturer} from "../controllers/hodController.js";

const hodRouter = Router();

//get all the dept course
hodRouter.get("/courses", authMiddleware, getAllCourses)
// ====================== ADD COURSE ======================
hodRouter.post("/course", authMiddleware, addCourse);

// ====================== UPDATE COURSE ======================
hodRouter.put("/course/:id", authMiddleware, updateCourse);

// ====================== DELETE COURSE ======================
hodRouter.delete("/course/:id", authMiddleware, deleteCourse);

// ====================== ASSIGN COURSE TO LECTURER ======================
hodRouter.post("/assign/:id", authMiddleware, assignCourse);

//preassign getting data to be assigned like lsit of courses and thigns
hodRouter.get('/assign',authMiddleware,  getUnassignedDetails);

hodRouter.get('/current-assignments',authMiddleware,getAllAssignments)

// ====================== ASSIGN COURSE TO LECTURER ======================
hodRouter.put("/reassign/:id", authMiddleware, updateCourseLecturer );

//get all department lesson records
hodRouter.get("/lessonrecords", authMiddleware, getDepartmentLessonRecords)


hodRouter.get("/dashboard", authMiddleware, getHodDashboard);


export default hodRouter;
