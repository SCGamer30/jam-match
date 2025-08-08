"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Music,
  User,
  Settings,
  MessageCircle,
  Users,
  Heart,
  Sparkles,
} from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  // Show navigation on all pages now

  return (
    <nav className="bg-card/95 backdrop-blur-md border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Music className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
              <Sparkles className="h-3 w-3 text-chart-2 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
              JamMatch
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              asChild
              variant={isActive("/") ? "default" : "ghost"}
              size="sm"
              className={
                isActive("/")
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-accent hover:text-accent-foreground"
              }
            >
              <Link href="/">Home</Link>
            </Button>
            <Button
              asChild
              variant={isActive("/dashboard") ? "default" : "ghost"}
              size="sm"
              className={
                isActive("/dashboard")
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-accent hover:text-accent-foreground"
              }
            >
              <Link href="/dashboard" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button
              asChild
              variant={isActive("/profile/setup") ? "default" : "ghost"}
              size="sm"
              className={
                isActive("/profile/setup")
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-accent hover:text-accent-foreground"
              }
            >
              <Link href="/profile/setup" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </Button>
            <Button
              asChild
              variant={isActive("/chat") ? "default" : "ghost"}
              size="sm"
              className={
                isActive("/chat")
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-accent hover:text-accent-foreground"
              }
            >
              <Link href="/chat/demo" className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                Chat
              </Link>
            </Button>
            <Button
              asChild
              variant={isActive("/settings") ? "default" : "ghost"}
              size="sm"
              className={
                isActive("/settings")
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-accent hover:text-accent-foreground"
              }
            >
              <Link href="/settings" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 hover:bg-accent"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-3 bg-card/95 backdrop-blur-md">
            <div className="flex flex-col gap-2">
              <Button
                asChild
                variant={isActive("/") ? "default" : "ghost"}
                size="sm"
                className={`justify-start ${
                  isActive("/")
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link href="/" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Home
                </Link>
              </Button>
              <Button
                asChild
                variant={isActive("/dashboard") ? "default" : "ghost"}
                size="sm"
                className={`justify-start ${
                  isActive("/dashboard")
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button
                asChild
                variant={isActive("/profile/setup") ? "default" : "ghost"}
                size="sm"
                className={`justify-start ${
                  isActive("/profile/setup")
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link href="/profile/setup" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile Setup
                </Link>
              </Button>
              <Button
                asChild
                variant={isActive("/chat") ? "default" : "ghost"}
                size="sm"
                className={`justify-start ${
                  isActive("/chat")
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link href="/chat/demo" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </Link>
              </Button>
              <Button
                asChild
                variant={isActive("/settings") ? "default" : "ghost"}
                size="sm"
                className={`justify-start ${
                  isActive("/settings")
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
