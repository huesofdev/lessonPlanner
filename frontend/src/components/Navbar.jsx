import React from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuList } from "@/components/ui/navigation-menu";

const Navbar = () => {
  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <img
              className="h-14 w-auto"
              src="/logo.png" // replace with your logo path
              alt="Logo"
            />
          </div>

          {/* Center: Title */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-2xl font-semibold text-gray-800">
              Lesson Records Management System
            </h1>
          </div>

          {/* Right: Buttons */}
          <div className="flex items-center space-x-4">
            <Link to={"auth"}><Button variant="outline">Login</Button></Link>
            <Link to={"auth"}><Button variant="default">Register</Button></Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
