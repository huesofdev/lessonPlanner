// src/routes/admin/PendingUserApprovals.jsx
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const mockUsers = [
  { _id: "u001", firstName: "Alice", lastName: "Smith", email: "alice@mail.com", role: "lecturer", department: "it", status: "pending" },
  { _id: "u002", firstName: "Bob", lastName: "Johnson", email: "bob@mail.com", role: "hod", department: "accountancy", status: "pending" },
];

export default function PendingUserApprovals() {
  const [users, setUsers] = useState(mockUsers);

  const handleApprove = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, status: "approved" } : u))
    );
    alert("User approved (mock)");
  };

  const handleReject = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, status: "rejected" } : u))
    );
    alert("User rejected (mock)");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Pending User Approvals</h1>

      <Card>
        <CardHeader>
          <CardTitle>Pending Users</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse table-auto">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Role</th>
                <th className="px-4 py-2 border">Department</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b">
                  <td className="px-4 py-2 border">{user.firstName} {user.lastName}</td>
                  <td className="px-4 py-2 border">{user.email}</td>
                  <td className="px-4 py-2 border">{user.role}</td>
                  <td className="px-4 py-2 border">{user.department}</td>
                  <td className="px-4 py-2 border space-x-2">
                    <Button size="sm" onClick={() => handleApprove(user._id)}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(user._id)}>Reject</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
