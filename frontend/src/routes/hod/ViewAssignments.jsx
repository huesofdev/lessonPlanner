// src/routes/hod/ViewAssignments.jsx
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AuthContext } from "@/context/AuthContext";

export default function ViewAssignments() {
  const { token, isLoggedIn, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all"); // all, assigned, unassigned
  const [modeFilter, setModeFilter] = useState("all"); // all, fulltime, parttime

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate("/auth");
    }
  }, [authLoading, isLoggedIn, navigate]);

  // Fetch current assignments
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:3000/api/v1/hod/current-assignments",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
      alert("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      fetchAssignments();
    }
  }, [authLoading, isLoggedIn, token]);

  if (authLoading || loading) return <div className="p-6 text-lg">Loading...</div>;

  // Apply filters
  const filteredAssignments = assignments.filter(a => {
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "assigned" && a.lecturer) ||
      (statusFilter === "unassigned" && !a.lecturer);
    const modeMatch = modeFilter === "all" || a.mode === modeFilter;
    return statusMatch && modeMatch;
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Department Course Assignments</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
          </SelectContent>
        </Select>

        <Select value={modeFilter} onValueChange={setModeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="fulltime">Fulltime</SelectItem>
            <SelectItem value="parttime">Parttime</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments Overview</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse table-auto text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border">Course Code</th>
                <th className="px-4 py-2 border">Course Name</th>
                <th className="px-4 py-2 border">Year</th>
                <th className="px-4 py-2 border">Semester</th>
                <th className="px-4 py-2 border">Mode</th>
                <th className="px-4 py-2 border">Assigned Lecturer</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((assignment) => (
                <tr
                  key={assignment._id}
                  className={assignment.lecturer ? "" : "bg-red-100"}
                >
                  <td className="px-4 py-2 border">{assignment.course?.courseId || "N/A"}</td>
                  <td className="px-4 py-2 border">{assignment.course?.courseTitle || "N/A"}</td>
                  <td className="px-4 py-2 border">{assignment.course?.year || "N/A"}</td>
                  <td className="px-4 py-2 border">{assignment.course?.semester || "N/A"}</td>
                  <td className="px-4 py-2 border">{assignment.mode || "N/A"}</td>
                  <td className="px-4 py-2 border font-semibold">
                    {assignment.lecturer?.name || "Unassigned"}
                  </td>
                </tr>
              ))}
              {filteredAssignments.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No assignments found for selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
