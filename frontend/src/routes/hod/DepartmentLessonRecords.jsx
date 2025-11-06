// src/routes/hod/DepartmentLessonRecords.jsx
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AuthContext } from "@/context/AuthContext";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function DepartmentLessonRecords() {
  const { token, isLoggedIn, authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modeFilter, setModeFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !isLoggedIn) navigate("/auth");
  }, [authLoading, isLoggedIn, navigate]);

  const fetchLessonRecords = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:3000/api/v1/hod/lessonrecords", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setRecords(res.data.data);
      } else {
        setError("Failed to load lesson records");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Server error while fetching records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isLoggedIn) fetchLessonRecords();
  }, [authLoading, isLoggedIn, token]);

  if (authLoading || loading)
    return <div className="p-6 text-center font-medium text-gray-600">Loading lesson records...</div>;

  // Apply filters
  const filteredRecords = records.filter(r => {
    const modeMatch = modeFilter === "all" || r.mode === modeFilter;
    const yearMatch = yearFilter === "all" || r.course?.year?.toString() === yearFilter;
    return modeMatch && yearMatch;
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Department Lesson Records</h1>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={modeFilter} onValueChange={setModeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            <SelectItem value="fulltime">Fulltime</SelectItem>
            <SelectItem value="parttime">Parttime</SelectItem>
          </SelectContent>
        </Select>

        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            <SelectItem value="1">1st Year</SelectItem>
            <SelectItem value="2">2nd Year</SelectItem>
            <SelectItem value="3">3rd Year</SelectItem>
            <SelectItem value="4">4th Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lesson Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.length > 0 ? (
          filteredRecords.map(record => (
            <Card key={record._id} className="hover:shadow-lg transition-shadow duration-200 border border-gray-100">
              <div className="w-full bg-gray-900 text-white px-4 py-1 text-base font-semibold">
                {record.course?.courseTitle || "Deleted Course"}
              </div>
              <CardContent className="space-y-3">
                <p className="text-gray-800 text-sm">
                  <span className="font-medium">Course Code:</span> {record.course?.courseId || "-"}
                </p>
                <p className="text-gray-800 text-sm">
                  <span className="font-medium">Date:</span> {new Date(record.date).toLocaleDateString()}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-blue-100 text-blue-800 text-sm">{record.mode}</Badge>
                  <Badge className="bg-green-100 text-green-800 text-sm">
                    {record.startTime} - {record.endTime}
                  </Badge>
                  {record.course?.year && (
                    <Badge className="bg-purple-100 text-purple-800 text-sm">{record.course.year} Year</Badge>
                  )}
                </div>
                <p className="text-gray-800 text-sm">
                  <span className="font-medium">Lecturer:</span> {record.lecturer?.name || "Unassigned"}
                </p>
                <p className="text-gray-800 text-sm">
                  <span className="font-medium">Student Attendance:</span> {record.studentAttendance}
                </p>
                <div className="flex flex-wrap gap-1">
                  {record.lessons.map((lesson, idx) => (
                    <Badge key={idx} className="bg-yellow-100 text-yellow-800 text-sm">{lesson}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center py-6 text-gray-500">
            No lesson records found for selected filters
          </p>
        )}
      </div>
    </div>
  );
}
