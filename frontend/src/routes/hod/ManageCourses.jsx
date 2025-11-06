// src/routes/hod/ManageCourses.jsx
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Trash, Pencil, XCircle, CheckCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function ManageCourses() {
  const { isLoggedIn, loading: authLoading, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [form, setForm] = useState({ code: "", name: "", year: "1", semester: "1", mode: "fulltime" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !isLoggedIn) navigate("/auth");
  }, [authLoading, isLoggedIn, navigate]);

  // Fetch courses
  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get("http://localhost:3000/api/v1/hod/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isLoggedIn) fetchCourses();
  }, [authLoading, isLoggedIn, token]);

  const startEditing = (course) => {
    setEditingCourseId(course._id);
    setForm({
      code: course.courseId,
      name: course.courseTitle,
      year: String(course.year),
      semester: String(course.semester),
      mode: course.mode,
    });
  };

  const cancelEditing = () => setEditingCourseId(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const updateCourse = async (courseId) => {
    setError("");
    try {
      await axios.put(
        `http://localhost:3000/api/v1/hod/course/${courseId}`,
        {
          courseTitle: form.name,
          year: form.year,
          semester: form.semester,
          mode: form.mode,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingCourseId(null);
      fetchCourses();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Update failed");
    }
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    setError("");
    try {
      await axios.delete(`http://localhost:3000/api/v1/hod/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCourses();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  if (authLoading || loading) return <div className="p-6 text-center">Loading courses...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Manage Department Courses</h1>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse table-auto">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border">Course Code</th>
                <th className="px-4 py-2 border">Course Name</th>
                <th className="px-4 py-2 border">Year</th>
                <th className="px-4 py-2 border">Semester</th>
                <th className="px-4 py-2 border">Mode</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id} className="border-b hover:bg-gray-50">
                  {editingCourseId === course._id ? (
                    <>
                      <td className="px-4 py-2 border">
                        <Input name="code" value={form.code} onChange={handleChange} />
                      </td>
                      <td className="px-4 py-2 border">
                        <Input name="name" value={form.name} onChange={handleChange} />
                      </td>
                      <td className="px-4 py-2 border">
                        <Input type="number" min={1} max={4} name="year" value={form.year} onChange={handleChange} />
                      </td>
                      <td className="px-4 py-2 border">
                        <Input type="number" min={1} max={2} name="semester" value={form.semester} onChange={handleChange} />
                      </td>
                      <td className="px-4 py-2 border">
                        <Select value={form.mode} onValueChange={(val) => setForm({ ...form, mode: val })}>
                          <SelectTrigger><SelectValue placeholder="Mode" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fulltime">Fulltime</SelectItem>
                            <SelectItem value="parttime">Parttime</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-2 border flex gap-2">
                        <Button onClick={() => updateCourse(course._id)} variant="success">
                          <CheckCircle size={16} />
                        </Button>
                        <Button onClick={cancelEditing} variant="secondary">
                          <XCircle size={16} />
                        </Button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2 border">{course.courseId}</td>
                      <td className="px-4 py-2 border">{course.courseTitle}</td>
                      <td className="px-4 py-2 border">{course.year}</td>
                      <td className="px-4 py-2 border">{course.semester}</td>
                      <td className="px-4 py-2 border">{course.mode}</td>
                      <td className="px-4 py-2 border flex gap-2">
                        <Button onClick={() => startEditing(course)} variant="ghost">
                          <Pencil size={16} />
                        </Button>
                        <Button onClick={() => deleteCourse(course._id)} variant="destructive">
                          <Trash size={16} />
                        </Button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
