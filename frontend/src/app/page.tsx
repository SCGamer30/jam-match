"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Music,
  Users,
  MessageCircle,
  Star,
  Zap,
  Heart,
  Sparkles,
  Play,
  Guitar,
  Mic,
  Headphones,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-secondary relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-chart-2/30 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent/25 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-1000"></div>
      </div>

      {/* Floating Music Notes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 text-primary/30 text-6xl animate-music-bounce animation-delay-1000">
          ♪
        </div>
        <div className="absolute top-1/3 right-1/4 text-chart-2/30 text-4xl animate-music-bounce animation-delay-3000">
          ♫
        </div>
        <div className="absolute bottom-1/4 left-1/3 text-primary/25 text-5xl animate-music-bounce animation-delay-2000">
          ♬
        </div>
        <div className="absolute top-1/2 right-1/3 text-accent-foreground/30 text-3xl animate-music-bounce animation-delay-4000">
          ♩
        </div>
        <div className="absolute top-3/4 right-1/5 text-chart-2/20 text-4xl animate-music-bounce animation-delay-1500">
          ♭
        </div>
        <div className="absolute top-1/5 left-1/5 text-primary/20 text-3xl animate-music-bounce animation-delay-2500">
          ♯
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-border shadow-lg">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-foreground/90 text-sm font-medium">
              AI-Powered Music Matching
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Find Your Perfect
            <span className="animate-gradient block">Band Members</span>
          </h1>

          <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect with musicians who share your passion, style, and vision.
            Our AI analyzes compatibility to create the perfect musical
            chemistry.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-full shadow-2xl btn-enhanced animate-pulse-glow border-0"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Start Jamming
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-border text-foreground hover:bg-accent px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm"
            >
              <Link href="/profile/setup">Explore Features</Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card className="bg-card/80 backdrop-blur-lg border border-border card-hover group shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="text-center pb-4 relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-chart-2 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg animate-pulse-glow">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-foreground text-xl font-bold">
                AI-Powered Matching
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Our advanced AI analyzes musical DNA, personality traits, and
                creative goals to find your perfect musical soulmates.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/80 backdrop-blur-lg border border-border card-hover group shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="text-center pb-4 relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-chart-2 to-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg animate-pulse-glow animation-delay-1000">
                <MessageCircle className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-foreground text-xl font-bold">
                Instant Connection
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Chat in real-time, share music samples, and collaborate on ideas
                before you even meet in person.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/80 backdrop-blur-lg border border-border card-hover group shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="text-center pb-4 relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-foreground to-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg animate-pulse-glow animation-delay-2000">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-foreground text-xl font-bold">
                Smart Band Formation
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                When compatibility scores align, we automatically create your
                dream band and set up your first jam session.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Your Musical Journey
          </h2>
          <p className="text-muted-foreground text-xl mb-12">
            Four simple steps to find your perfect bandmates
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-chart-2 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-primary-foreground font-bold text-2xl">
                    1
                  </span>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-chart-2/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="font-bold mb-3 text-xl text-foreground">
                Create Your Profile
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Share your musical DNA - instruments, genres, experience, and
                what makes you tick as an artist.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-chart-2 to-primary rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-primary-foreground font-bold text-2xl">
                    2
                  </span>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-chart-2/20 to-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="font-bold mb-3 text-xl text-foreground">
                AI Magic Happens
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Our AI analyzes thousands of compatibility factors to find
                musicians who complement your style perfectly.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-accent-foreground to-chart-2 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-primary-foreground font-bold text-2xl">
                    3
                  </span>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-accent-foreground/20 to-chart-2/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="font-bold mb-3 text-xl text-foreground">
                Connect & Chat
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Meet your matches, share ideas, and vibe check through our
                built-in messaging and collaboration tools.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent-foreground rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-primary-foreground font-bold text-2xl">
                    4
                  </span>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent-foreground/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="font-bold mb-3 text-xl text-foreground">
                Form Your Band
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                When the chemistry is right, we automatically create your band
                and help you start making music together.
              </p>
            </div>
          </div>
        </div>

        {/* Instruments Showcase */}
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            For Every Instrument, Every Genre
          </h2>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-chart-2 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Guitar className="h-8 w-8 text-primary-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Guitar</span>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-chart-2 to-primary rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Mic className="h-8 w-8 text-primary-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Vocals</span>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-foreground to-primary rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Music className="h-8 w-8 text-primary-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Piano</span>
            </div>
            <div className="flex flex-col items-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent-foreground rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Headphones className="h-8 w-8 text-primary-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">Producer</span>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-4xl mx-auto bg-card/90 backdrop-blur-xl border border-border shadow-2xl card-hover relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-chart-2/5 to-accent-foreground/5"></div>
            <CardHeader className="pb-6 relative z-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-primary animate-pulse" />
                <Star className="h-8 w-8 text-chart-2 animate-pulse animation-delay-1000" />
                <Heart className="h-6 w-6 text-primary animate-pulse animation-delay-2000" />
              </div>
              <CardTitle className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Ready to Find Your Musical Soulmates?
              </CardTitle>
              <CardDescription className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of musicians who have discovered their perfect
                bandmates and are creating amazing music together.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8 relative z-10">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-4 text-lg font-semibold rounded-full shadow-2xl btn-enhanced animate-pulse-glow"
                >
                  <Link
                    href="/profile/setup"
                    className="flex items-center gap-2"
                  >
                    <Music className="h-5 w-5" />
                    Start Your Journey
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-border text-foreground hover:bg-accent px-12 py-4 text-lg font-semibold rounded-full backdrop-blur-sm btn-enhanced"
                >
                  <Link href="/dashboard">Explore Dashboard</Link>
                </Button>
              </div>

              <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span>Free to join</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-chart-2 rounded-full animate-pulse animation-delay-1000"></div>
                  <span>AI-powered matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-foreground rounded-full animate-pulse animation-delay-2000"></div>
                  <span>Instant connections</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
