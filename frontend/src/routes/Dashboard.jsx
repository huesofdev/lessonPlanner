// src/routes/DashboardLayout.jsx
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export default function Dashboard() {
  const { user, isLoggedIn, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate("/auth");
    }
  }, [loading, isLoggedIn, navigate]);

  if (loading) return <div>loading......</div>;
  
 return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col overflow-auto">
          <header className="border-b px-4 py-3 flex items-center gap-4">
            <SidebarTrigger />
          </header>
          
          {/* NOW center the content if needed */}
          <div className="flex-1 flex  justify-center p-6">
            <div className="w-full max-w-4xl">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}