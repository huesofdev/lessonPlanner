// src/routes/lecturer/AssignedCourses.jsx
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, CalendarDays } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";

export default function AssignedCourses() {
  const navigate = useNavigate();
  const { token, isLoggedIn, loading: authLoading } = useContext(AuthContext);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch assigned courses
  const fetchAssignedCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/api/v1/user/myassigned-courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setCourses(res.data.data);
    } catch (err) {
      console.error("Failed to fetch assigned courses:", err);
      alert("Failed to load assigned courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      fetchAssignedCourses();
    }
  }, [authLoading, isLoggedIn, token]);

  if (authLoading || loading)
    return <div className="p-6 text-center font-medium text-gray-600">Loading assigned courses...</div>;

  const handleViewRecords = (courseId) => {
    navigate(`/dashboard/lessons/list/${courseId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Assigned Courses</h1>
      <p className="text-gray-500">
        Here are the courses assigned to you. You can view or manage lesson records for each course.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.length === 0 && (
          <p className="col-span-full text-center text-gray-500 mt-4">No assigned courses found.</p>
        )}

        {courses.map((item) => {
          const course = item.course;
          return (
            <Card key={item._id} className="hover:shadow-md transition">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  {course?.courseTitle || "Deleted Course"}
                </CardTitle>
                <CardDescription>{course?.courseId?.toUpperCase() || "-"}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mode</span>
                  <span className="font-medium capitalize">{course?.mode || "-"}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Year</span>
                  <span className="font-medium">{course?.year || "-"}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Semester</span>
                  <span className="font-medium">{course?.semester || "-"}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Lessons</span>
                  <span className="font-medium">{item.lessonCount}</span>
                </div>

                <Button
                  variant="default"
                  className="w-full mt-2"
                  onClick={() => handleViewRecords(course?._id)}
                >
                  <CalendarDays className="w-4 h-4 mr-2" />
                  View Lesson Records
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
