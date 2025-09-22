import React, { useState } from "react";
import { useAuth } from "../contexts/auth-context";
import {
  Home,
  MapPin,
  CheckSquare,
  AlertTriangle,
  MoreHorizontal,
  BarChart3,
  Clock,
  Package,
  TrendingUp,
  Settings,
  Camera,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface BottomNavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function BottomNavigation({
  currentView,
  onNavigate,
}: BottomNavigationProps) {
  const { user } = useAuth();
  const [showMore, setShowMore] = useState(false);

  // Main navigation items - basic for all roles
  const getMainNavItems = () => {
    const baseItems = [
      { id: "dashboard", label: "Home", icon: Home },
      {
        id: "incidents",
        label: "Incidents",
        icon: AlertTriangle,
      },
    ];

    // Add role-specific items
    if (user?.role !== "hr") {
      baseItems.splice(
        1,
        0,
        { id: "tracking", label: "GPS", icon: MapPin },
        {
          id: "checkpoints",
          label: "Patrol",
          icon: CheckSquare,
        },
      );
    }

    return baseItems;
  };

  // Additional items in "More" menu
  const getMoreItems = () => {
    const items = [
      { id: "attendance", label: "Attendance", icon: Clock },
      { id: "reports", label: "Reports", icon: BarChart3 },
      { id: "shifts", label: "Shifts", icon: Clock },
      { id: "equipment", label: "Equipment", icon: Package },
      { id: "analytics", label: "Analytics", icon: TrendingUp },
      { id: "settings", label: "Settings", icon: Settings },
    ];

    // Add CCTV for supervisors and admins
    if (user?.role === "supervisor" || user?.role === "admin") {
      items.unshift({
        id: "cctv",
        label: "CCTV",
        icon: Camera,
      });
    }

    return items;
  };

  const moreItems = getMoreItems();

  const mainNavItems = getMainNavItems();

  return (
    <>
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-card border-t">
        <div className="flex items-center justify-around p-2">
          {mainNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentView === item.id;

            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-1 h-auto py-2 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <IconComponent className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMore(!showMore)}
            className="flex flex-col items-center gap-1 h-auto py-2 text-muted-foreground"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-xs">More</span>
          </Button>
        </div>
      </nav>

      {/* More Menu Overlay */}
      {showMore && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setShowMore(false)}
        >
          <Card className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {moreItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = currentView === item.id;

                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? "default" : "outline"}
                      onClick={() => {
                        onNavigate(item.id);
                        setShowMore(false);
                      }}
                      className="flex items-center gap-2 justify-start h-auto p-3"
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm">
                        {item.label}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}