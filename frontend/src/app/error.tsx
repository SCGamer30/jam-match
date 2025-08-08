"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">
            Something went wrong!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm">
            We encountered an unexpected error. Please try again or contact
            support if the problem persists.
          </p>
          <div className="space-y-2">
            <Button
              onClick={reset}
              className="w-full bg-orange-200 hover:bg-orange-300 text-orange-900"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              Go Home
            </Button>
          </div>
          {process.env.NODE_ENV === "development" && (
            <details className="text-left mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer">
                Error Details (Development)
              </summary>
              <pre className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
