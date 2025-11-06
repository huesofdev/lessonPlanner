// src/routes/lecturer/LessonRecordsList.jsx
import { useState, useEffect, useMemo, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Edit } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";

export default function LessonRecordsList() {
  const { courseId } = useParams(); // course MongoDB _id
  const navigate = useNavigate();
  const { token, isLoggedIn, loading: authLoading } = useContext(AuthContext);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    studentAttendance: "",
    lessons: [],
    mode: "",
  });

  // Fetch lesson records for this course
  const fetchLessonRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3000/api/v1/user/lesson/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setRecords(res.data.data);
      } else {
        alert(res.data.message || "Failed to fetch lesson records");
      }
    } catch (err) {
      console.error("Fetch lessons error:", err);
      alert(err.response?.data?.message || "Server error while fetching lessons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isLoggedIn) fetchLessonRecords();
  }, [authLoading, isLoggedIn, courseId]);

  // Get course info from first record
  const courseInfo = useMemo(() => (records.length ? records[0].course : null), [records]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "lessons") {
      setForm({ ...form, lessons: value.split(",").map((l) => l.trim()) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Open edit modal
  const handleEdit = (record) => {
    setEditingRecord(record);
    setForm({
      date: record.date.split("T")[0],
      startTime: record.startTime,
      endTime: record.endTime,
      studentAttendance: record.studentAttendance,
      lessons: record.lessons,
      mode: record.mode,
    });
  };

  // Save edited record
  const handleSave = async () => {
    if (!editingRecord) return;

    try {
      const payload = {
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        studentAttendance: Number(form.studentAttendance),
        lessons: form.lessons,
      };

      const res = await axios.put(
        `http://localhost:3000/api/v1/user/lesson/${editingRecord._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert("✅ Lesson record updated successfully!");
        setEditingRecord(null);
        fetchLessonRecords(); // refresh list
      } else {
        alert(res.data.message || "Failed to update lesson record");
      }
    } catch (err) {
      console.error("Update lesson error:", err);
      alert(err.response?.data?.message || "Server error while updating lesson record");
    }
  };

  if (authLoading || loading)
    return <div className="p-6 text-center font-medium text-gray-600">Loading lesson records...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Lesson Records for Course:{" "}
        {courseInfo ? `${courseInfo.courseId} — ${courseInfo.courseTitle}` : courseId}
      </h1>

      <Button onClick={() => navigate(`/dashboard/lessons/add/`)} className="mb-4">
        Add New Lesson Record
      </Button>

      <div className="grid gap-4">
        {records.map((record) => (
          <Card key={record._id} className="hover:shadow-md transition">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-lg">
                <CalendarDays className="inline w-5 h-5 mr-2" />
                {new Date(record.date).toLocaleDateString()}
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="default" onClick={() => handleEdit(record)}>
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p><span className="font-medium">Time:</span> {record.startTime} - {record.endTime}</p>
              <p><span className="font-medium">Mode:</span> {record.mode}</p>
              <p><span className="font-medium">Attendance:</span> {record.studentAttendance}</p>
              <p><span className="font-medium">Lessons:</span> {record.lessons.join(", ")}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Edit Lesson Record</h2>

            <div>
              <label className="block font-medium">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full mt-1 border p-2 rounded"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  className="w-full mt-1 border p-2 rounded"
                />
              </div>
              <div>
                <label className="block font-medium">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                  className="w-full mt-1 border p-2 rounded"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium">Attendance</label>
              <input
                type="number"
                name="studentAttendance"
                value={form.studentAttendance}
                onChange={handleChange}
                className="w-full mt-1 border p-2 rounded"
              />
            </div>
            <div>
              <label className="block font-medium">Lessons (comma separated)</label>
              <input
                type="text"
                name="lessons"
                value={form.lessons.join(", ")}
                onChange={handleChange}
                className="w-full mt-1 border p-2 rounded"
              />
            </div>
            <div>
              <label className="block font-medium">Mode</label>
              <input
                type="text"
                name="mode"
                value={form.mode}
                readOnly
                className="w-full mt-1 border p-2 rounded bg-gray-100"
              />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <Button variant="outline" onClick={() => setEditingRecord(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
