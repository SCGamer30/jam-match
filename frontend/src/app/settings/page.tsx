"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  User,
  ProfileData,
  MUSICAL_GENRES,
  INSTRUMENTS,
  ExperienceLevel,
  PrimaryRole,
} from "@/types/profile";
import {
  validateProfile,
  validateAndSanitizeProfile,
} from "@/lib/profileValidation";
import { userApi } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

export default function SettingsPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    bio: "",
    primary_role: "guitarist",
    instruments: [],
    genres: [],
    experience: "beginner",
    location: "",
  });

  // Original data for comparison
  const [originalData, setOriginalData] = useState<ProfileData | null>(null);

  // Load user profile on mount
  useEffect(() => {
    if (authLoading) return;

    if (!authUser) {
      router.push("/login");
      return;
    }

    loadUserProfile();
  }, [authUser, authLoading, router]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = await userApi.getProfile();
      setUser(userData);

      const profileData: ProfileData = {
        name: userData.name,
        bio: userData.bio || "",
        primary_role: userData.primary_role,
        instruments: userData.instruments,
        genres: userData.genres,
        experience: userData.experience,
        location: userData.location || "",
        avatar_url: userData.avatar_url,
      };

      setFormData(profileData);
      setOriginalData(profileData);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // Check if form has changes
  useEffect(() => {
    if (!originalData) return;

    const hasChanged =
      JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(hasChanged);
  }, [formData, originalData]);

  const updateFormData = (field: keyof ProfileData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const addGenre = (genre: string) => {
    if (!formData.genres.includes(genre) && formData.genres.length < 10) {
      updateFormData("genres", [...formData.genres, genre]);
    }
  };

  const removeGenre = (genre: string) => {
    updateFormData(
      "genres",
      formData.genres.filter((g) => g !== genre)
    );
  };

  const addInstrument = (instrument: string) => {
    if (
      !formData.instruments.includes(instrument) &&
      formData.instruments.length < 10
    ) {
      updateFormData("instruments", [...formData.instruments, instrument]);
    }
  };

  const removeInstrument = (instrument: string) => {
    updateFormData(
      "instruments",
      formData.instruments.filter((i) => i !== instrument)
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Validate and sanitize profile data
      const { sanitizedProfile, validation } =
        validateAndSanitizeProfile(formData);

      if (!validation.isValid) {
        setError(
          validation.errors[0]?.message || "Please fix the validation errors"
        );
        return;
      }

      // Optimistic update - update UI immediately
      const optimisticUser = user
        ? {
            ...user,
            ...sanitizedProfile,
            updated_at: new Date().toISOString(),
          }
        : null;

      if (optimisticUser) {
        setUser(optimisticUser);
        setOriginalData(sanitizedProfile);
        setSuccess("Profile updated successfully!");
      }

      try {
        // Update profile via API
        const response = await userApi.updateProfile(sanitizedProfile);

        // Update with actual server response
        setUser(response.user);
        setOriginalData(sanitizedProfile);
        setFormData(sanitizedProfile);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } catch (apiError) {
        // Revert optimistic update on error
        if (originalData) {
          setFormData(originalData);
          const revertedUser = user
            ? {
                ...user,
                ...originalData,
              }
            : null;
          if (revertedUser) {
            setUser(revertedUser);
          }
        }
        throw apiError; // Re-throw to be caught by outer catch
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalData) {
      setFormData(originalData);
      setError(null);
      setSuccess(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-300 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Failed to load profile</p>
              <Button onClick={loadUserProfile} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Profile Settings
            </CardTitle>
            <p className="text-gray-600">
              Update your profile information to improve your matching potential
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    placeholder="Your name"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateFormData("location", e.target.value)}
                    placeholder="City, State"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => updateFormData("bio", e.target.value)}
                  placeholder="Tell us about yourself and your musical journey..."
                  maxLength={500}
                  rows={4}
                />
                <p className="text-sm text-gray-500">
                  {formData.bio?.length || 0}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level *</Label>
                <Select
                  value={formData.experience}
                  onValueChange={(value: ExperienceLevel) =>
                    updateFormData("experience", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Musical Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Musical Preferences
              </h3>

              <div className="space-y-2">
                <Label htmlFor="primary_role">Primary Role *</Label>
                <Select
                  value={formData.primary_role}
                  onValueChange={(value: PrimaryRole) =>
                    updateFormData("primary_role", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guitarist">Guitarist</SelectItem>
                    <SelectItem value="bassist">Bassist</SelectItem>
                    <SelectItem value="drummer">Drummer</SelectItem>
                    <SelectItem value="singer">Singer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="genres-select">Musical Genres * (Max 10)</Label>
                <Select
                  onValueChange={addGenre}
                  disabled={formData.genres.length >= 10}
                >
                  <SelectTrigger id="genres-select" aria-label="Add a genre">
                    <SelectValue
                      placeholder={
                        formData.genres.length >= 10
                          ? "Maximum genres reached"
                          : "Add a genre..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {MUSICAL_GENRES.filter(
                      (genre) => !formData.genres.includes(genre)
                    ).map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.genres.map((genre) => (
                    <Badge
                      key={genre}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {genre}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeGenre(genre)}
                      />
                    </Badge>
                  ))}
                </div>
                {formData.genres.length === 0 && (
                  <p className="text-sm text-red-500">
                    At least one genre is required
                  </p>
                )}
              </div>
            </div>

            {/* Instruments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Instruments
              </h3>

              <div className="space-y-2">
                <Label htmlFor="instruments-select">
                  Instruments * (Max 10)
                </Label>
                <Select
                  onValueChange={addInstrument}
                  disabled={formData.instruments.length >= 10}
                >
                  <SelectTrigger
                    id="instruments-select"
                    aria-label="Add an instrument"
                  >
                    <SelectValue
                      placeholder={
                        formData.instruments.length >= 10
                          ? "Maximum instruments reached"
                          : "Add an instrument..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTRUMENTS.filter(
                      (instrument) => !formData.instruments.includes(instrument)
                    ).map((instrument) => (
                      <SelectItem key={instrument} value={instrument}>
                        {instrument}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.instruments.map((instrument) => (
                    <Badge
                      key={instrument}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {instrument}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeInstrument(instrument)}
                      />
                    </Badge>
                  ))}
                </div>
                {formData.instruments.length === 0 && (
                  <p className="text-sm text-red-500">
                    At least one instrument is required
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={!hasChanges || saving}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="bg-orange-300 hover:bg-orange-400 text-gray-900"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
