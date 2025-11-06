import { 
  BookOpen, 
  FileText, 
  Users, 
  PlusCircle, 
  CheckCircle, 
  BarChart3,
  Settings,
  LogOut,
  User,
  Filter,
  UserPlus,
  BookAlert
} from "lucide-react"
import { useContext } from "react"
import { AuthContext } from "@/context/AuthContext"
import { Link, useNavigate } from "react-router"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"



// Menu items for each role
const menuItems = {
  lecturer: [
    {
      title: "My Courses",
      icon: BookOpen,
      items: [
        { title: "View Assigned Courses", url: "/dashboard/courses", icon: BookOpen },
      ]
    },
    {
      title: "Lesson Records",
      icon: FileText,
      items: [
        { title: "Add Lesson Record", url: "/dashboard/lessons/add", icon: PlusCircle },
        { title: "View All Records", url: "/dashboard/lessons/list/all", icon: FileText },
        {title: "Back To Dashboard", url: "/dashboard", icon: BookAlert}
      ]
    },
  ],
  
  hod: [
    {
      title: "My Personal Management",
      icon: BookOpen,
      items: [
        { title: "My Assigned Courses", url: "/dashboard/courses", icon: BookOpen },
        { title: "My LessonRecords", url: "/dashboard/lessons/list/all", icon: BookOpen },
        { title: "Add LessonRecords", url: "/dashboard/lessons/add", icon: PlusCircle },
        {title: "Back To Dashboard", url: "/dashboard", icon: BookAlert}
      ]
    },
    {
      title: "Department Management",
      icon: Users,
      items: [
        { title: "Assign Lecturers", url: "/dashboard/hod/assign", icon: UserPlus },
        { title: "View Assignments", url: "/dashboard/hod/assignments", icon: BookOpen },
        { title: "Department Courses", url: "/dashboard/hod/courses", icon: BookOpen },
        { title: "Add New Courses", url: "/dashboard/hod/course/add", icon: PlusCircle },
        { title: "View All Departmnet Lesson Records", url: "/dashboard/hod/lessons/list", icon: BookOpen },
      ]
    },
  ],
  
  admin: [
    {
      title: "User Approvals",
      icon: CheckCircle,
      items: [
        { title: "Pending Requests", url: "/dashboard/admin/pending", icon: CheckCircle },
        { title: "Approved Users", url: "/dashboard/admin/allusers", icon: Users },
        {title: "Back To Dashboard", url: "/dashboard", icon: BookAlert}
      ]
    },
  ]
}

export function AppSidebar() {
  const { user, logout, loading } = useContext(AuthContext)
  const navigate = useNavigate()

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <Sidebar variant="sidebar">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Loading...</SidebarGroupLabel>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    )
  }



  // Get menu items based on user role (case-insensitive)
  const userRole = user?.role?.toLowerCase() || 'lecturer'
  const items = menuItems[userRole] || menuItems.lecturer

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <Sidebar variant="sidebar">
      <SidebarContent>
        {/* User Info Header */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold">
            <div className="flex flex-col">
              <span>{user?.name || user?.username || 'User'}</span>
              <span className="text-xs text-muted-foreground font-normal">
                {userRole.toUpperCase()}
              
              </span>
            </div>
          </SidebarGroupLabel>
        </SidebarGroup>

        {/* Dynamic Menu based on Role */}
        {items.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer with Profile & Logout */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/dashboard/profile">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}