"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/useAuth";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users to dashboard
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find Your Perfect
            <span className="text-orange-600"> Band Members</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            JamMatch uses AI-powered compatibility analysis to connect musicians
            based on location, musical preferences, and experience level.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-orange-200 hover:bg-orange-300 text-orange-900 px-8 py-3"
            >
              <Link href="/register">Get Started</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-orange-200 text-orange-700 hover:bg-orange-50 px-8 py-3"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="text-orange-800">
                🎯 Smart Matching
              </CardTitle>
              <CardDescription>
                Our AI analyzes your musical preferences, experience, and
                location to find the most compatible band members.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="text-orange-800">
                💬 Real-time Chat
              </CardTitle>
              <CardDescription>
                Connect instantly with your matched band members through our
                built-in messaging system.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-orange-100">
            <CardHeader>
              <CardTitle className="text-orange-800">
                🎵 Auto Band Formation
              </CardTitle>
              <CardDescription>
                When 3-4 musicians have high compatibility scores, we
                automatically form a band for you.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-800 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Create Profile</h3>
              <p className="text-sm text-gray-600">
                Tell us about your musical background, instruments, and
                preferences.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-800 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Get Matched</h3>
              <p className="text-sm text-gray-600">
                Our AI finds musicians with compatible styles and experience.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-800 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Form Bands</h3>
              <p className="text-sm text-gray-600">
                When compatibility is high, we automatically create your band.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-800 font-bold">4</span>
              </div>
              <h3 className="font-semibold mb-2">Start Jamming</h3>
              <p className="text-sm text-gray-600">
                Connect with your band members and start making music together.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-2xl text-orange-800">
                Ready to Find Your Band?
              </CardTitle>
              <CardDescription className="text-lg">
                Join thousands of musicians who have found their perfect match.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                size="lg"
                className="bg-orange-200 hover:bg-orange-300 text-orange-900 px-12 py-3"
              >
                <Link href="/register">Create Your Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
