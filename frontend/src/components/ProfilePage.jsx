import { useState, useEffect, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Save, Lock } from "lucide-react";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";

export default function ProfilePage() {
  const { token } = useContext(AuthContext);

  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:3000/api/v1/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setUser(res.data.data);
        } else {
          alert(res.data.message || "Failed to fetch profile");
        }
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Server error while fetching profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  // Handle profile input changes
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Save profile updates
  const handleSave = async () => {
    try {
      const res = await axios.put(
        "http://localhost:3000/api/v1/user/profile",
        {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          department: user.department,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        alert("Profile updated successfully");
        setIsEditing(false);
      } else {
        alert(res.data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Server error while updating profile");
    }
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  // Update password
  const handlePasswordUpdate = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      return alert("New password and confirm password do not match!");
    }
    try {
      const res = await axios.post(
        "http://localhost:3000/api/v1/user/password",
        {
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        alert("Password updated successfully");
        setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        alert(res.data.message || "Failed to update password");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Server error while updating password");
    }
  };

  if (loading || !user) return <div className="p-6 text-center">Loading profile...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">View and update your details</p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Profile Details</CardTitle>
          {isEditing ? (
            <Button onClick={handleSave} variant="default">
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
          )}
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`}
                  alt="User Avatar"
                />
                <AvatarFallback>
                  {user.firstName[0]}
                  {user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <p className="font-semibold text-lg">{`${user.firstName} ${user.lastName}`}</p>
              <p className="text-sm text-muted-foreground">{user.role}</p>
            </div>

            {/* Details */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div>
                <Label>First Name</Label>
                {isEditing ? (
                  <Input name="firstName" value={user.firstName} onChange={handleChange} />
                ) : (
                  <p className="p-2 border rounded-md bg-muted/30">{user.firstName}</p>
                )}
              </div>
              <div>
                <Label>Last Name</Label>
                {isEditing ? (
                  <Input name="lastName" value={user.lastName} onChange={handleChange} />
                ) : (
                  <p className="p-2 border rounded-md bg-muted/30">{user.lastName}</p>
                )}
              </div>
              <div>
                <Label>Email</Label>
                {isEditing ? (
                  <Input name="email" value={user.email} onChange={handleChange} />
                ) : (
                  <p className="p-2 border rounded-md bg-muted/30">{user.email}</p>
                )}
              </div>
              <div>
                <Label>Department</Label>
                {isEditing ? (
                  <select
                    name="department"
                    value={user.department}
                    onChange={handleChange}
                    className="p-2 border rounded-md w-full bg-background"
                  >
                    <option value="it">IT</option>
                    <option value="english">English</option>
                    <option value="accountancy">Accountancy</option>
                  </select>
                ) : (
                  <p className="p-2 border rounded-md bg-muted/30">{user.department}</p>
                )}
              </div>
              <div>
                <Label>Role</Label>
                <p className="p-2 border rounded-md bg-muted/30">{user.role}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Old Password</Label>
            <Input
              type="password"
              name="oldPassword"
              value={passwords.oldPassword}
              onChange={handlePasswordChange}
              placeholder="Enter old password"
            />
          </div>
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
            />
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
            />
          </div>
          <div className="sm:col-span-3">
            <Button onClick={handlePasswordUpdate} className="w-full sm:w-auto">
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
