"use client";

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
import { ExperienceLevel } from "@/types/profile";

interface BasicInfoStepProps {
  data: {
    name: string;
    bio: string;
    location: string;
    experience: ExperienceLevel;
  };
  onUpdate: (data: Partial<BasicInfoStepProps["data"]>) => void;
}

export function BasicInfoStep({ data, onUpdate }: BasicInfoStepProps) {
  const handleInputChange =
    (field: keyof BasicInfoStepProps["data"]) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onUpdate({ [field]: e.target.value });
    };

  const handleExperienceChange = (value: ExperienceLevel) => {
    onUpdate({ experience: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Full Name *
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your full name"
          value={data.name}
          onChange={handleInputChange("name")}
          className="w-full"
          required
        />
        <p className="text-xs text-gray-500">
          This is how other musicians will see your name
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="text-sm font-medium">
          Bio
        </Label>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself, your musical journey, and what you're looking for in a band..."
          value={data.bio}
          onChange={handleInputChange("bio")}
          className="w-full min-h-[100px] resize-none"
          maxLength={500}
        />
        <p className="text-xs text-gray-500">
          {data.bio.length}/500 characters (optional)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm font-medium">
          Location
        </Label>
        <Input
          id="location"
          type="text"
          placeholder="City, State (e.g., New York, NY)"
          value={data.location}
          onChange={handleInputChange("location")}
          className="w-full"
        />
        <p className="text-xs text-gray-500">
          Help us find musicians near you (optional)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience" className="text-sm font-medium">
          Experience Level *
        </Label>
        <Select value={data.experience} onValueChange={handleExperienceChange}>
          <SelectTrigger className="w-full" id="experience">
            <SelectValue placeholder="Select your experience level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">
              <div className="flex flex-col items-start">
                <span className="font-medium">Beginner</span>
                <span className="text-xs text-gray-500">
                  Just starting out, learning basics
                </span>
              </div>
            </SelectItem>
            <SelectItem value="intermediate">
              <div className="flex flex-col items-start">
                <span className="font-medium">Intermediate</span>
                <span className="text-xs text-gray-500">
                  Comfortable with fundamentals, some experience
                </span>
              </div>
            </SelectItem>
            <SelectItem value="advanced">
              <div className="flex flex-col items-start">
                <span className="font-medium">Advanced</span>
                <span className="text-xs text-gray-500">
                  Skilled player, extensive experience
                </span>
              </div>
            </SelectItem>
            <SelectItem value="professional">
              <div className="flex flex-col items-start">
                <span className="font-medium">Professional</span>
                <span className="text-xs text-gray-500">
                  Professional musician, industry experience
                </span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          This helps us match you with musicians at a similar level
        </p>
      </div>
    </div>
  );
}
