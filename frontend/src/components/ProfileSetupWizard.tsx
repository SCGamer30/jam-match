"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BasicInfoStep } from "./profile-setup/BasicInfoStep";
import { MusicalPreferencesStep } from "./profile-setup/MusicalPreferencesStep";
import { InstrumentsStep } from "./profile-setup/InstrumentsStep";
import { ProfileSetupData } from "@/types/profile";
import {
  validateProfileSetupStep,
  validateAndSanitizeProfile,
} from "@/lib/profileValidation";

const STEPS = [
  { id: 1, title: "Basic Info", description: "Tell us about yourself" },
  {
    id: 2,
    title: "Musical Preferences",
    description: "Your musical style and role",
  },
  { id: 3, title: "Instruments", description: "What do you play?" },
];

export function ProfileSetupWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ProfileSetupData>>({
    name: "",
    bio: "",
    location: "",
    experience: "beginner",
    genres: [],
    primary_role: "guitarist",
    instruments: [],
  });

  const updateFormData = (stepData: Partial<ProfileSetupData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
    setError(null);
  };

  const validateCurrentStep = () => {
    const validation = validateProfileSetupStep(currentStep, formData);
    if (!validation.isValid) {
      setError(validation.errors[0]?.message || "Please fix the errors above");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Validate and sanitize the complete profile
      const { sanitizedProfile, validation } = validateAndSanitizeProfile({
        name: formData.name!,
        bio: formData.bio,
        primary_role: formData.primary_role!,
        instruments: formData.instruments!,
        genres: formData.genres!,
        experience: formData.experience!,
        location: formData.location,
      });

      if (!validation.isValid) {
        setError(validation.errors[0]?.message || "Please fix the errors");
        return;
      }

      // Mock profile save for demo
      console.log("Profile saved:", sanitizedProfile);

      // Show success message
      alert("Profile completed successfully! Redirecting to dashboard...");

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Profile setup error:", err);
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            data={{
              name: formData.name || "",
              bio: formData.bio || "",
              location: formData.location || "",
              experience: formData.experience || "beginner",
            }}
            onUpdate={updateFormData}
          />
        );
      case 2:
        return (
          <MusicalPreferencesStep
            data={{
              genres: formData.genres || [],
              primary_role: formData.primary_role || "guitarist",
            }}
            onUpdate={updateFormData}
          />
        );
      case 3:
        return (
          <InstrumentsStep
            data={{
              instruments: formData.instruments || [],
            }}
            onUpdate={updateFormData}
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = currentStep === STEPS.length;
  const isFirstStep = currentStep === 1;

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/90 backdrop-blur-sm border-border shadow-xl">
      <CardHeader className="pb-4 sm:pb-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <CardTitle className="text-lg sm:text-xl text-foreground">
            Step {currentStep} of {STEPS.length}
          </CardTitle>
          <div className="text-xs sm:text-sm text-muted-foreground">
            {Math.round((currentStep / STEPS.length) * 100)}% Complete
          </div>
        </div>

        {/* Progress indicator */}
        <div className="w-full bg-muted rounded-full h-2 mb-3 sm:mb-4">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="text-center">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            {STEPS[currentStep - 1].title}
          </h2>
          <p className="text-muted-foreground text-sm">
            {STEPS[currentStep - 1].description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        {error && (
          <Alert
            variant="destructive"
            className="border-destructive/50 bg-destructive/10"
          >
            <AlertDescription className="text-sm text-destructive">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {renderStep()}

        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-4 sm:pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep || isSubmitting}
            className="order-2 sm:order-1 w-full sm:w-auto border-border text-foreground hover:bg-accent"
          >
            Previous
          </Button>

          {isLastStep ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="order-1 sm:order-2 bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
            >
              {isSubmitting ? "Completing..." : "Complete Profile"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="order-1 sm:order-2 bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
            >
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
