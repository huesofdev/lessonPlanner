// src/routes/hod/HODDashboard.jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import { BookOpen, Users, ClipboardList, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthContext } from "@/context/AuthContext";
import LessonRecord from "./LessonRecord";
import axios from "axios";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";

export default function HodDashboard() {
  const { token, isLoggedIn, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [personalData, setPersonalData] = useState(null);
  const [departmentData, setDepartmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Auth redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate("/auth");
    }
  }, [authLoading, isLoggedIn, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:3000/api/v1/hod/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setPersonalData(res.data.data.personal);
        setDepartmentData(res.data.data.department);
      } else {
        setError(res.data.message || "Failed to fetch HOD dashboard");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Server error while fetching HOD dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      fetchDashboardData();
    }
  }, [authLoading, isLoggedIn, token]);

  if (authLoading || loading) {
    return <div className="p-6 text-center font-medium text-gray-600">Loading dashboard...</div>;
  }

  const getLessonCountForCourse = (courseId) => {
    return (departmentData?.recentLessonRecords || []).filter(lr => lr.course?._id === courseId).length;
  };

  return (
    <div className="p-6 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <h1 className="text-3xl font-bold">HOD Dashboard</h1>
        <p className="text-muted-foreground">Manage department courses, lecturers, and lesson records</p>
      </div>

      {/* Department Stats */}
      <h2 className="text-xl font-semibold">Department Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentData?.totalCourses || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Lecturers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentData?.lecturers?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Lesson Records</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentData?.totalLessonRecords || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentData?.lessonRecordsThisWeek || 0} lessons</div>
          </CardContent>
        </Card>
      </div>

      {/* Department Courses */}
      <h2 className="text-lg font-semibold">Department Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(departmentData?.assignments || []).filter(a => a.course).map(a => (
          <Card key={a._id} className="border-2">
            <CardHeader>
              <CardTitle className="text-lg">{a.course?.courseId || "No Course"}</CardTitle>
              <p className="text-sm text-muted-foreground">{a.course?.courseTitle || "No Title"}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Lecturer:</span>{" "}
                  {a.lecturer ? `${a.lecturer.firstName} ${a.lecturer.lastName}` : "TBA"}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Mode:</span> {a.course?.mode || "N/A"}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Lesson Records:</span> {getLessonCountForCourse(a.course._id)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department Lesson Records */}
      <LessonRecord
        title="Department Lesson Records"
        records={(departmentData?.recentLessonRecords || []).map(lr => ({
          ...lr,
          courseId: lr.course?._id,
          courseTitle: lr.course?.courseTitle || "No Course",
          lecturerName: lr.lecturer ? `${lr.lecturer.firstName} ${lr.lecturer.lastName}` : "No Lecturer",
        }))}
        editable={false}
        onSave={(updatedRecords) => console.log("Saved records:", updatedRecords)}
      />

      {/* Personal Stats */}
      <h2 className="text-xl font-semibold mt-6">My Assignments</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personalData?.totalAssignments || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personalData?.totalLessonRecords || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{personalData?.lessonRecordsThisWeek || 0} lessons</div>
          </CardContent>
        </Card>
      </div>

      {/* Personal Courses */}
      <h2 className="text-lg font-semibold">My Assigned Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(personalData?.assignedCourses || []).map((a) => (
          <Card key={a.assignmentId} className="border-2">
            <CardHeader>
              <CardTitle className="text-lg">{a.course?.courseId}</CardTitle>
              <p className="text-sm text-muted-foreground">{a.course?.courseTitle}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Mode:</span> {a.course?.mode || "N/A"}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Lesson Records:</span>{" "}
                  {(personalData?.recentLessonRecords || []).filter(lr => lr.course?._id === a.course._id).length}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Personal Lesson Records */}
      <LessonRecord
        title="My Recent Lesson Records"
        records={(personalData?.recentLessonRecords || []).map(lr => ({
          ...lr,
          courseId: lr.course?._id,
          courseTitle: lr.course?.courseTitle || "No Course",
          lecturerName: lr.lecturer ? `${lr.lecturer.firstName} ${lr.lecturer.lastName}` : "No Lecturer",
        }))}
        editable={true}
        onSave={(updatedRecords) => console.log("Saved personal records:", updatedRecords)}
      />
    </div>
  );
}
