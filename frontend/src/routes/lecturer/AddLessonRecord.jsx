import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AuthContext } from "@/context/AuthContext";

// ⛔ import AlertDialog components
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function AddLessonRecord() {
  const { token, isLoggedIn, loading: authLoading } = useContext(AuthContext);

  const [assignedCourses, setAssignedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    studentAttendance: "",
    lessons: [],
    mode: "",
  });

  // 👇 for AlertDialog
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  // ✅ Fetch assigned courses
  const fetchAssignedCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/api/v1/user/myassigned-courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setAssignedCourses(res.data.data);
      } else {
        showAlert("Error", res.data.message || "Failed to load assigned courses");
      }
    } catch (err) {
      console.error("Failed to fetch assigned courses:", err);
      showAlert("Error", err.response?.data?.message || "Server error while loading courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isLoggedIn) fetchAssignedCourses();
  }, [authLoading, isLoggedIn, token]);

  // ✅ Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "lessons") {
      setForm({ ...form, lessons: value.split(",").map((l) => l.trim()) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ✅ Handle course selection correctly
  const handleCourseSelect = (courseId) => {
    const selectedAssignment = assignedCourses.find((c) => c.course._id === courseId);
    if (selectedAssignment) {
      setSelectedCourse(courseId);
      setForm((prev) => ({ ...prev, mode: selectedAssignment.mode }));
    }
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return showAlert("Missing Info", "Please select a course");

    try {
      const payload = {
        ...form,
        studentAttendance: Number(form.studentAttendance),
      };

      const res = await axios.post(
        `http://localhost:3000/api/v1/user/lesson/${selectedCourse}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        showAlert("Success", res.data.message || "Lesson record added successfully!");
        setForm({
          date: "",
          startTime: "",
          endTime: "",
          studentAttendance: "",
          lessons: [],
          mode: "",
        });
        setSelectedCourse("");
      } else {
        const message =
          res.data.message ||
          res.data.errors?.join(", ") ||
          "Failed to add lesson record";
        showAlert("Error", message);
      }
    } catch (err) {
      console.error("Add lesson error:", err);
      showAlert("Error", err.response?.data?.message || "Server error while adding lesson record");
    }
  };

  if (authLoading || loading)
    return <div className="p-6 text-center font-medium text-gray-600">Loading assigned courses...</div>;

  return (
    <>
      {/* 🔔 AlertDialog for showing API messages */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 🧾 Main form */}
      <div className="p-6 flex justify-center">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Add Lesson Record
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Course Dropdown */}
              <div>
                <Label className="text-sm font-medium">Select Course</Label>
                <Select value={selectedCourse} onValueChange={handleCourseSelect}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedCourses.map((c) => (
                      <SelectItem key={c._id} value={c.course._id}>
                        {c.course.courseId} — {c.course.courseTitle} ({c.mode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mode */}
              <div>
                <Label className="text-sm font-medium">Mode</Label>
                <Input name="mode" value={form.mode} readOnly className="mt-1" />
              </div>

              {/* Date */}
              <div>
                <Label className="text-sm font-medium">Date</Label>
                <Input type="date" name="date" value={form.date} onChange={handleChange} required />
              </div>

              {/* Start & End Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Start Time</Label>
                  <Input type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
                </div>
                <div>
                  <Label className="text-sm font-medium">End Time</Label>
                  <Input type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
                </div>
              </div>

              {/* Student Attendance */}
              <div>
                <Label className="text-sm font-medium">Student Attendance</Label>
                <Input
                  type="number"
                  name="studentAttendance"
                  value={form.studentAttendance}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Lessons */}
              <div>
                <Label className="text-sm font-medium">Lessons Covered (comma separated)</Label>
                <Textarea
                  name="lessons"
                  value={form.lessons.join(", ")}
                  onChange={handleChange}
                  placeholder="e.g., Introduction, Arrays, Functions"
                  required
                />
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full">
                Add Lesson Record
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
