import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Users, Activity, Settings, Menu, ChevronDown 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItemProps {
  icon: React.ReactNode;
  href: string;
  children: React.ReactNode;
  isActive: boolean;
}

function NavItem({ icon, href, children, isActive }: NavItemProps) {
  return (
    <li className="mb-2">
      <Link 
        href={href}
        className={cn(
          "flex items-center gap-3 p-2 rounded-md transition-colors",
          isActive 
            ? "bg-primary text-primary-foreground" 
            : "hover:bg-primary/80 hover:text-primary-foreground"
        )}
      >
        {icon}
        <span>{children}</span>
      </Link>
    </li>
  );
}

export default function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="block md:hidden fixed top-0 left-0 w-full bg-primary z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary-foreground" />
            <h1 className="text-xl font-bold text-primary-foreground">Admin Panel</h1>
          </div>
          <Button 
            variant="ghost" 
            className="text-primary-foreground" 
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Sidebar for mobile (drawer) */}
      <div 
        className={cn(
          "fixed inset-0 z-20 md:hidden bg-background/80 backdrop-blur-sm transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      >
        <div 
          className={cn(
            "fixed inset-y-0 left-0 z-30 w-64 bg-primary p-4 transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary-foreground" />
              <h1 className="text-xl font-bold text-primary-foreground">Admin Panel</h1>
            </div>
            <Button 
              variant="ghost" 
              className="text-primary-foreground" 
              onClick={() => setIsOpen(false)}
            >
              <ChevronDown className="h-6 w-6" />
            </Button>
          </div>
          <nav>
            <ul>
              <NavItem 
                icon={<Users className="h-5 w-5" />} 
                href="/" 
                isActive={location === "/"} 
              >
                User Management
              </NavItem>
              <NavItem 
                icon={<Activity className="h-5 w-5" />} 
                href="/analytics" 
                isActive={location === "/analytics"} 
              >
                Analytics
              </NavItem>
              <NavItem 
                icon={<Settings className="h-5 w-5" />} 
                href="/settings" 
                isActive={location === "/settings"} 
              >
                Settings
              </NavItem>
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:block bg-primary text-primary-foreground w-64 min-h-screen p-4">
        <div className="flex items-center gap-3 mb-8">
          <Users className="h-6 w-6" />
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav>
          <ul>
            <NavItem 
              icon={<Users className="h-5 w-5" />} 
              href="/" 
              isActive={location === "/"} 
            >
              User Management
            </NavItem>
            <NavItem 
              icon={<Activity className="h-5 w-5" />} 
              href="/analytics" 
              isActive={location === "/analytics"} 
            >
              Analytics
            </NavItem>
            <NavItem 
              icon={<Settings className="h-5 w-5" />} 
              href="/settings" 
              isActive={location === "/settings"} 
            >
              Settings
            </NavItem>
          </ul>
        </nav>
      </aside>
    </>
  );
}
