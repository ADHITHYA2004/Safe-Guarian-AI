import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Shield, Camera, Users, History, Settings, AlertTriangle, FileText, BarChart3, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      authApi.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const navItems = [
    { href: "/home", icon: Camera, label: "Live Detection", primary: true },
    { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
    { href: "/analytics", icon: AlertTriangle, label: "Threat Analytics" },
    { href: "/friends", icon: Users, label: "Emergency Contacts" },
    { href: "/history", icon: History, label: "Alert History" },
    { href: "/architecture", icon: FileText, label: "System Info" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <div>
                <h1 className="text-base md:text-xl font-bold text-foreground">SafeGuard AI</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Harassment Detection System</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 rounded-full bg-success/10 px-2 py-1 md:px-3">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
              <span className="text-xs md:text-sm font-medium text-success hidden sm:inline">System Active</span>
              <span className="text-xs md:text-sm font-medium text-success sm:hidden">Active</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {isMobile && isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "border-r bg-card transition-all duration-300",
          isMobile 
            ? cn(
                "fixed top-[57px] left-0 h-[calc(100vh-57px)] z-50 w-64",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
              )
            : isCollapsed ? "w-16" : "w-64"
        )}>
          <nav className="flex flex-col h-full p-4">
            <div className="space-y-2 flex-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => isMobile && setIsMobileMenuOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive 
                      ? item.primary 
                        ? "gradient-primary text-primary-foreground" 
                        : "bg-primary text-primary-foreground"
                      : "text-muted-foreground",
                    !isMobile && isCollapsed && "justify-center"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {(!isCollapsed || isMobile) && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
            
            {/* Logout Button */}
            <div className="pt-4 border-t border-border mt-4">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className={cn(
                  "w-full flex items-center gap-3 justify-start text-destructive hover:text-destructive hover:bg-destructive/10",
                  !isMobile && isCollapsed && "justify-center"
                )}
              >
                <LogOut className="h-4 w-4" />
                {(!isCollapsed || isMobile) && <span>Logout</span>}
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;