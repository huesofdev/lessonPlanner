// src/routes/admin/ApprovedRejectedUsers.jsx
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const mockUsers = [
  { _id: "u003", firstName: "Charlie", lastName: "Brown", email: "charlie@mail.com", role: "lecturer", department: "english", status: "approved" },
  { _id: "u004", firstName: "Diana", lastName: "White", email: "diana@mail.com", role: "lecturer", department: "it", status: "rejected" },
];

export default function ApprovedRejectedUsers() {
  const [users] = useState(mockUsers);

  const approvedUsers = users.filter(u => u.status === "approved");
  const rejectedUsers = users.filter(u => u.status === "rejected");

  const renderTable = (list) => (
    <table className="w-full border-collapse table-auto">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="px-4 py-2 border">Name</th>
          <th className="px-4 py-2 border">Email</th>
          <th className="px-4 py-2 border">Role</th>
          <th className="px-4 py-2 border">Department</th>
        </tr>
      </thead>
      <tbody>
        {list.map(user => (
          <tr key={user._id} className="border-b">
            <td className="px-4 py-2 border">{user.firstName} {user.lastName}</td>
            <td className="px-4 py-2 border">{user.email}</td>
            <td className="px-4 py-2 border">{user.role}</td>
            <td className="px-4 py-2 border">{user.department}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Approved / Rejected Users</h1>

      <Card>
        <CardHeader>
          <CardTitle>Approved Users</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">{renderTable(approvedUsers)}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rejected Users</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">{renderTable(rejectedUsers)}</CardContent>
      </Card>
    </div>
  );
}
