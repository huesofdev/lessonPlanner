import React, { useState, useContext } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router";

const Login = ({ onSwitch }) => {
  const {login} = useContext(AuthContext)
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    // Basic validation
    if (!email || !password) {
      setAlert({ type: "error", message: "Please fill in all fields." });
      setTimeout(() => setAlert(null), 1500);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlert({ type: "error", message: "Please enter a valid email address." });
      setTimeout(() => setAlert(null), 1500);
      return;
    }

    if (password.length < 8) {
      setAlert({
        type: "error",
        message: "Password must be at least 8 characters long.",
      });
      setTimeout(() => setAlert(null), 1500);
      return;
    }

    setAlert(null);
    setLoading(true);

    try {
      // send request to backend
      const response = await axios.post("http://localhost:3000/api/v1/user/signin", {
        email,
        password,
      });

      // store token in localStorage
      const token = response.data?.data;

   
      if (token) {
       login(token)
      }

      // show success alert
      setAlert({ type: "success", message: "Login successful!" });
      setTimeout(() => setAlert(null), 1500);


    //navigating to the dashboard:
    setTimeout(() => {
      navigate('/dashboard')
    }, 650);
      
    } catch (error) {
      console.error("Login error:", error);

      const errMsg =
        error.response?.data?.message ||
        "Login failed. Please check your credentials or try again later.";

      setAlert({ type: "error", message: errMsg });
      setTimeout(() => setAlert(null), 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold">
            Login to your account
          </CardTitle>
          <CardDescription className="text-center">
            Use your email to log in to your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Alert section */}
          {alert && (
            <Alert
              className={`mb-4 ${
                alert.type === "success"
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              }`}
            >
              <AlertTitle>
                {alert.type === "success" ? "Success" : "Error"}
              </AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password">
                Password <span className="text-xs text-gray-500">(min. 8 characters)</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Buttons + link */}
            <CardFooter className="flex flex-col gap-3 pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
              <p className="text-sm text-center text-gray-500">
                Don’t have an account?{" "}
                <span
                  className="text-blue-500 hover:underline cursor-pointer"
                  onClick={onSwitch}
                >
                  Register here
                </span>
              </p>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
