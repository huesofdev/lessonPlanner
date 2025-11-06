// src/routes/hod/AssignLecturers.jsx
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AuthContext } from "@/context/AuthContext";

export default function AssignLecturers() {
  const { token, isLoggedIn, authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate("/auth");
    }
  }, [authLoading, isLoggedIn, navigate]);

  const fetchCoursesAndLecturers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:3000/api/v1/hod/assign", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const availableCourses = res.data.data.courses.map(course => ({
          _id: course._id,
          name: course.courseTitle,
          code: course.courseId,
          year: course.year,
          semester: course.semester,
          mode: course.mode,
          assignedLecturer: course.assignedLecturer || null,
        }));

        setCourses(availableCourses);
        setLecturers(res.data.data.lecturers);
      } else {
        setError("Failed to load courses and lecturers.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Server error while loading data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      fetchCoursesAndLecturers();
    }
  }, [authLoading, isLoggedIn, token]);

  const handleCourseSelect = (courseId) => {
    setSelectedCourses(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const handleAssign = async () => {
    if (!selectedLecturer || selectedCourses.length === 0) {
      setError("Please select courses and a lecturer to assign.");
      return;
    }

    setAssigning(true);
    setError("");
    setSuccess("");

    try {
      await Promise.all(
        selectedCourses.map(courseId =>
          axios.post(
            `http://localhost:3000/api/v1/hod/assign/${courseId}`,
            { lecturer: selectedLecturer },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      setSelectedCourses([]);
      setSelectedLecturer("");
      setSuccess("Lecturer assigned successfully!");
      fetchCoursesAndLecturers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to assign lecturer.");
    } finally {
      setAssigning(false);
    }
  };

  if (authLoading || loading) return <div className="p-6 text-center font-medium text-gray-600">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Assign Lecturers</h1>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="default">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Select Courses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {courses.length === 0 && <div>No available courses to assign.</div>}
          {courses.map(course => (
            <div key={course._id} className="flex items-center justify-between border p-2 rounded">
              <div className="flex items-center">
                <Checkbox
                  checked={selectedCourses.includes(course._id)}
                  onCheckedChange={() => handleCourseSelect(course._id)}
                />
                <span className="ml-2">{course.name} ({course.code})</span>
              </div>
              <div>Assigned: {course.assignedLecturer || "None"}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Lecturer</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedLecturer} onValueChange={setSelectedLecturer}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a lecturer" />
            </SelectTrigger>
            <SelectContent>
              {lecturers.map(lecturer => (
                <SelectItem key={lecturer._id} value={lecturer._id}>
                  {lecturer.name} ({lecturer.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Button onClick={handleAssign} disabled={assigning}>
        {assigning ? "Assigning..." : "Assign Lecturer"}
      </Button>
    </div>
  );
}
