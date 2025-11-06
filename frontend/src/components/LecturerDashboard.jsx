import { useState, useEffect, useContext } from "react";
import { BookOpen, Plus, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router";

export default function LecturerDashboard() {
  const { token, isLoggedIn, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");

  // Fetch lecturer dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/api/v1/user/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setDashboardData(res.data.data);
      } else {
        alert(res.data.message || "Failed to fetch dashboard data");
      }
    } catch (err) {
      console.error("Fetch dashboard error:", err);
      alert(err.response?.data?.message || "Server error while fetching dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isLoggedIn) fetchDashboardData();
  }, [authLoading, isLoggedIn]);

  if (authLoading || loading)
    return <div className="p-6 text-center font-medium text-gray-600">Loading dashboard...</div>;

  if (!dashboardData) return null;

  const { totalAssignments, totalLessonRecords, lessonRecordsThisWeek, assignedCourses, recentLessonRecords } = dashboardData;

  const filteredCourses = assignedCourses.filter((assignment) =>
    assignment.course.courseTitle.toLowerCase().includes(filterText.toLowerCase()) ||
    assignment.course.courseId.toLowerCase().includes(filterText.toLowerCase())
  );

  // Navigate to add lesson page, optionally pass course id in state
  const handleAddLesson = () => {
    navigate("lessons/add");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <p className="text-muted-foreground">Manage your assigned courses and lesson records</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessonRecords}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lessonRecordsThisWeek} lessons</div>
          </CardContent>
        </Card>
      </div>

      {/* My Assigned Courses */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>My Assigned Courses</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <input
                  type="text"
                  placeholder="Filter courses..."
                  className="pl-3 pr-3 py-2 border rounded-md w-full sm:w-64"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((assignment) => (
              <Card key={assignment.assignmentId} className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">{assignment.course.courseId}</CardTitle>
                  <p className="text-sm text-muted-foreground">{assignment.course.courseTitle}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">
                      <span className="font-semibold">
                        {recentLessonRecords.filter((lr) => lr.course?._id === assignment.course._id).length}
                      </span> Lesson Records
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleAddLesson(assignment.course._id)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Lesson
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Lesson Records */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Lesson Records</CardTitle>
            <Button onClick={() => navigate("lessons/add")}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Record
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Course</th>
                  <th className="text-left p-3 font-medium">Lessons</th>
                  <th className="text-left p-3 font-medium">Mode</th>
                </tr>
              </thead>
              <tbody>
                {recentLessonRecords.map((record) => (
                  <tr key={record._id} className="border-b hover:bg-muted/50">
                    <td className="p-3">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="p-3 font-medium">{record.course ? record.course.courseId : "No Course"}</td>
                    <td className="p-3">{record.lessons.join(", ")}</td>
                    <td className="p-3">{record.mode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
