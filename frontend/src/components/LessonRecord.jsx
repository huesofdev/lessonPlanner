// src/components/LessonRecordsTable.jsx
import { useState, useEffect, useContext } from "react";
import { Calendar, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AuthContext } from "@/context/AuthContext";

export default function LessonRecord({
  title,
  records,
  limit = 10,
  editable = false, // allow editing
  onSave = (updatedRecords) => {}, // callback for submit
}) {
  const { authLoading, isLoggedIn } = useContext(AuthContext);

  const [localRecords, setLocalRecords] = useState([]);
  const [error, setError] = useState("");

  // Initialize local records when records prop changes
  useEffect(() => {
    if (records?.length) {
      const prepared = records.slice(0, limit).map((r) => ({
        ...r,
        id: r.id || r._id, // ensure we have a unique id
      }));
      setLocalRecords(prepared);
    }
  }, [records, limit]);

  const handleChange = (id, field, value) => {
    setLocalRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSave = () => {
    try {
      onSave(localRecords);
    } catch (err) {
      console.error(err);
      setError("Failed to save lesson records.");
    }
  };

  if (authLoading) {
    return <div className="p-6 text-center font-medium text-gray-600">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          {editable && (
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" /> Save Changes
            </Button>
          )}
        </div>
      </CardHeader>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Course ID</th>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Course</th>
                <th className="text-left p-3 font-medium">Department</th>
                <th className="text-left p-3 font-medium">Mode</th>
                <th className="text-left p-3 font-medium">Start Time</th>
                <th className="text-left p-3 font-medium">End Time</th>
                <th className="text-left p-3 font-medium">Attendance</th>
                <th className="text-left p-3 font-medium">Lessons</th>
              </tr>
            </thead>
            <tbody>
              {localRecords.map((record) => (
                <tr key={record.id} className="border-b hover:bg-muted/50">
                  <td className="p-3 font-medium">{record.courseId}</td>
                  <td className="p-3">
                    {editable ? (
                      <input
                        type="date"
                        value={new Date(record.date).toISOString().split("T")[0]}
                        onChange={(e) =>
                          handleChange(record.id, "date", e.target.value)
                        }
                        className="border rounded-md px-2 py-1 w-full"
                      />
                    ) : (
                      new Date(record.date).toLocaleDateString()
                    )}
                  </td>
                  <td className="p-3 font-medium">{record.courseTitle}</td>
                  <td className="p-3">{record.department}</td>
                  <td className="p-3 capitalize">{record.mode}</td>
                  <td className="p-3">
                    {editable ? (
                      <input
                        type="time"
                        value={record.startTime}
                        onChange={(e) =>
                          handleChange(record.id, "startTime", e.target.value)
                        }
                        className="border rounded-md px-2 py-1 w-20"
                      />
                    ) : (
                      record.startTime
                    )}
                  </td>
                  <td className="p-3">
                    {editable ? (
                      <input
                        type="time"
                        value={record.endTime}
                        onChange={(e) =>
                          handleChange(record.id, "endTime", e.target.value)
                        }
                        className="border rounded-md px-2 py-1 w-20"
                      />
                    ) : (
                      record.endTime
                    )}
                  </td>
                  <td className="p-3">{record.studentAttendance}</td>
                  <td className="p-3">
                    <ul className="list-disc ml-4">
                      {record.lessons.map((lesson, index) => (
                        <li key={index}>{lesson}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
