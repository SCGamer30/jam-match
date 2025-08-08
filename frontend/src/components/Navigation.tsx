"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import { Menu, X, Music, User, Settings, LogOut } from "lucide-react";

export function Navigation() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const isActive = (path: string) => pathname === path;

  // Don't show navigation on landing, login, or register pages for unauthenticated users
  if (
    !user &&
    (pathname === "/" || pathname === "/login" || pathname === "/register")
  ) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-orange-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex items-center gap-2"
          >
            <Music className="h-6 w-6 text-orange-600" />
            <span className="font-bold text-lg text-gray-900">JamMatch</span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              <Button
                asChild
                variant={isActive("/dashboard") ? "default" : "ghost"}
                size="sm"
                className={
                  isActive("/dashboard") ? "bg-orange-200 text-orange-900" : ""
                }
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button
                asChild
                variant={isActive("/settings") ? "default" : "ghost"}
                size="sm"
                className={
                  isActive("/settings") ? "bg-orange-200 text-orange-900" : ""
                }
              >
                <Link href="/settings">
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </Link>
              </Button>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>

        {/* Mobile Navigation */}
        {user && isMobileMenuOpen && (
          <div className="md:hidden border-t border-orange-100 py-3">
            <div className="flex flex-col gap-2">
              <Button
                asChild
                variant={isActive("/dashboard") ? "default" : "ghost"}
                size="sm"
                className={`justify-start ${
                  isActive("/dashboard") ? "bg-orange-200 text-orange-900" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link href="/dashboard">
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button
                asChild
                variant={isActive("/settings") ? "default" : "ghost"}
                size="sm"
                className={`justify-start ${
                  isActive("/settings") ? "bg-orange-200 text-orange-900" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link href="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
              <Button
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                variant="ghost"
                size="sm"
                className="justify-start text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
