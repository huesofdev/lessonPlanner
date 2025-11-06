// src/routes/hod/AddCourse.jsx
import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AuthContext } from "@/context/AuthContext";

const departments = ["it", "accountancy", "english"];
const modes = ["fulltime", "parttime"];

export default function AddCourse() {
  const { token, isLoggedIn, authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    courseId: "",
    courseTitle: "",
    department: "it",
    year: "1",
    semester: "1",
    mode: "fulltime",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate("/auth");
    }
  }, [authLoading, isLoggedIn, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/v1/hod/course",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setSuccess("Course added successfully!");
        setForm({
          courseId: "",
          courseTitle: "",
          department: "it",
          year: "1",
          semester: "1",
          mode: "fulltime",
        });
      } else {
        setError(res.data.message || "Failed to add course.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Server error while adding course.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="p-6 text-center font-medium text-gray-600">Checking authentication...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Add New Course</h1>

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
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Course ID</label>
                <Input
                  name="courseId"
                  value={form.courseId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Course Title</label>
                <Input
                  name="courseTitle"
                  value={form.courseTitle}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Department</label>
                <Select
                  value={form.department}
                  onValueChange={(val) => setForm({ ...form, department: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Year</label>
                <Input
                  type="number"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  min={1}
                  max={form.department === "accountancy" ? 4 : 2}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Semester</label>
                <Input
                  type="number"
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                  min={1}
                  max={2}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Mode</label>
                <Select
                  value={form.mode}
                  onValueChange={(val) => setForm({ ...form, mode: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modes.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Course"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
