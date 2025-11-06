import { Router } from "express";
import authMiddleware from "../middlewares/jwt.auth.js";
import { changePassword, createLessonRecord, createUser, getAllLessonRecordsForUser, getAssignedCourses, getLecturerDashboard, getLessonRecordsByCourse, getMyAssignedCourses, getProfile, updateLessonRecord, userLogin } from "../controllers/userController.js";

const userRouter = Router();

// ====================== SIGNUP ======================
userRouter.post("/signup", createUser);

// ====================== SIGNIN ======================
userRouter.post("/signin", userLogin);

// ====================== LESSON RECORD ======================
userRouter.post("/lesson/:id",authMiddleware, createLessonRecord);
userRouter.put("/lesson/:lessonRecordId", authMiddleware, updateLessonRecord)

//get all the lesson rcords of user
userRouter.get("/lessons/all", authMiddleware, getAllLessonRecordsForUser)

userRouter.get("/lesson/:id",authMiddleware, getLessonRecordsByCourse);

//user gets the assigned courses details.......
userRouter.get("/assigned-courses", authMiddleware, getAssignedCourses);

userRouter.get("/myassigned-courses", authMiddleware, getMyAssignedCourses)

//get dashboard api
userRouter.get("/dashboard", authMiddleware, getLecturerDashboard)

//profile api
userRouter.get("/profile", authMiddleware, getProfile);
//password change
userRouter.post('/password', authMiddleware, changePassword);


export default userRouter;
