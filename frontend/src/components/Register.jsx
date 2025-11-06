import React, { useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const Register = ({ onSwitch }) => {
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
    department: "",
  });

  const [alert, setAlert] = useState(null); // { type: "error" | "success", message: "" }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { firstName, lastName, email, password, role, department } = formData;

    // Check for empty fields
    if (!firstName || !lastName || !email || !password || !role || !department) {
      setAlert({ type: "error", message: "All fields are required!" });
      setTimeout(() => setAlert(null), 1500);
      return;
    }

    // Password validation
    if (password.length < 8) {
      setAlert({
        type: "error",
        message: "Password must be at least 8 characters long.",
      });
      setTimeout(() => setAlert(null), 1500);
      return;
    }

    try {
      // Axios POST request
      const response = await axios.post(
        "http://localhost:3000/api/v1/user/signup",
        formData
      );

      setAlert({ type: "success", message: "Registration successful!" });

      // Clear alert and switch to login after 1.5s
      setTimeout(() => {
        setAlert(null);
        onSwitch(); // Switch to login page
      }, 1500);

      console.log("Registration response:", response.data);
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      setAlert({
        type: "error",
        message:
          error.response?.data?.message || "Registration failed. Please try again.",
      });
      setTimeout(() => setAlert(null), 1500);
    }
  };

  return (
    <div className="">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold">Register</CardTitle>
          <CardDescription className="text-center">
            Create your account to access the system.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {/* Alert Section */}
          {alert && (
            <Alert
              className={`mb-2 ${
                alert.type === "success"
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              }`}
            >
              <AlertTitle>{alert.type === "success" ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {/* First Name */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="password">
                Password <span className="text-xs text-gray-500">(min. 8 characters)</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="role">Role</Label>
              <Select
                onValueChange={(value) => handleSelectChange("role", value)}
                required
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hod">HOD</SelectItem>
                  <SelectItem value="lecturer">Lecturer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="department">Department</Label>
              <Select
                onValueChange={(value) => handleSelectChange("department", value)}
                required
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="accountancy">Accountancy</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="visiting">Visiting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <CardFooter className="pt-4 flex flex-col gap-2">
              <Button type="submit" className="w-full">
                Register
              </Button>
              <p className="text-sm text-center text-gray-500">
                Already have an account?{" "}
                <span
                  className="text-blue-500 hover:underline cursor-pointer"
                  onClick={onSwitch}
                >
                  Go back to login
                </span>
              </p>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
