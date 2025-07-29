// app/explanation/[id]/not-found.tsx
"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="space-y-6">
          {/* 图标 */}
          <div className="text-6xl mb-6">🔍</div>

          {/* 错误信息 */}
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Not Found</h1>
            </div>

            <div className="space-y-2">
              <p className="text-gray-600 text-lg">
                The physics explanation you&apos;re looking for doesn&apos;t
                exist or is not publicly available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
