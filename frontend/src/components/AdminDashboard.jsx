import { useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Building,
  Shield,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock data — replace with real API calls later
const mockUsers = [
  { id: 1, name: "Mr. Arun", role: "lecturer", department: "IT", status: "pending" },
  { id: 2, name: "Ms. Divya", role: "hod", department: "English", status: "approved" },
  { id: 3, name: "Mr. John", role: "lecturer", department: "Business", status: "pending" },
  { id: 4, name: "Ms. Priya", role: "lecturer", department: "IT", status: "approved" },
];

export default function AdminDashboard() {
  const [users, setUsers] = useState(mockUsers);

  const pendingUsers = users.filter((u) => u.status === "pending");
  const totalLecturers = users.filter((u) => u.role === "lecturer").length;
  const totalHODs = users.filter((u) => u.role === "hod").length;

  const handleApprove = (id) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, status: "approved" } : u)));
  };

  const handleReject = (id) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, approvals, and department activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lecturers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLecturers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heads of Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHODs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending User Approvals */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Pending User Approvals</CardTitle>
            <Shield className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No pending approvals</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-left p-3 font-medium">Department</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{user.name}</td>
                      <td className="p-3 capitalize">{user.role}</td>
                      <td className="p-3">{user.department}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">
                          {user.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(user.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(user.id)}
                            className="border-red-500 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
