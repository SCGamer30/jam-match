"use client";

import { ProfileSetupWizard } from "@/components/ProfileSetupWizard";

export default function ProfileSetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Complete Your Profile
            </h1>
            <p className="text-muted-foreground">
              Help us find the perfect band members for you by completing your
              musical profile.
            </p>
          </div>
          <ProfileSetupWizard />
        </div>
      </div>
    </div>
  );
}
