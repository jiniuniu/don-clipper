// components/layout/layout.tsx
"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  className?: string;
}

export function Layout({
  children,
  showSidebar = true,
  className,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Mobile sidebar overlay */}
      {showSidebar && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        {showSidebar && (
          <>
            {/* Desktop sidebar */}
            <div className="hidden lg:flex lg:w-64 lg:flex-col">
              <Sidebar />
            </div>

            {/* Mobile sidebar */}
            <div
              className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform lg:hidden",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              )}
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile header */}
          {showSidebar && (
            <div className="lg:hidden flex items-center justify-between p-4 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Teaching Demo Creator</h1>
              <div className="w-9" /> {/* Spacer for centering */}
            </div>
          )}

          {/* Content area */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
