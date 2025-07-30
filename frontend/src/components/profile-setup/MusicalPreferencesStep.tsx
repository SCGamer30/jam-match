"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrimaryRole, MUSICAL_GENRES } from "@/types/profile";

interface MusicalPreferencesStepProps {
  data: {
    genres: string[];
    primary_role: PrimaryRole;
  };
  onUpdate: (data: Partial<MusicalPreferencesStepProps["data"]>) => void;
}

export function MusicalPreferencesStep({
  data,
  onUpdate,
}: MusicalPreferencesStepProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>("");

  const handlePrimaryRoleChange = (value: PrimaryRole) => {
    onUpdate({ primary_role: value });
  };

  const addGenre = () => {
    if (selectedGenre && !data.genres.includes(selectedGenre)) {
      onUpdate({ genres: [...data.genres, selectedGenre] });
      setSelectedGenre("");
    }
  };

  const removeGenre = (genreToRemove: string) => {
    onUpdate({
      genres: data.genres.filter((genre) => genre !== genreToRemove),
    });
  };

  const handleGenreSelect = (value: string) => {
    setSelectedGenre(value);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="primary_role" className="text-sm font-medium">
          Primary Role *
        </Label>
        <Select
          value={data.primary_role}
          onValueChange={handlePrimaryRoleChange}
        >
          <SelectTrigger className="w-full" id="primary_role">
            <SelectValue placeholder="Select your primary role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="guitarist">
              <div className="flex flex-col items-start">
                <span className="font-medium">Guitarist</span>
                <span className="text-xs text-gray-500">
                  Lead, rhythm, or acoustic guitar
                </span>
              </div>
            </SelectItem>
            <SelectItem value="bassist">
              <div className="flex flex-col items-start">
                <span className="font-medium">Bassist</span>
                <span className="text-xs text-gray-500">
                  Electric or acoustic bass
                </span>
              </div>
            </SelectItem>
            <SelectItem value="drummer">
              <div className="flex flex-col items-start">
                <span className="font-medium">Drummer</span>
                <span className="text-xs text-gray-500">
                  Acoustic or electronic drums
                </span>
              </div>
            </SelectItem>
            <SelectItem value="singer">
              <div className="flex flex-col items-start">
                <span className="font-medium">Singer</span>
                <span className="text-xs text-gray-500">
                  Lead or backing vocals
                </span>
              </div>
            </SelectItem>
            <SelectItem value="other">
              <div className="flex flex-col items-start">
                <span className="font-medium">Other</span>
                <span className="text-xs text-gray-500">
                  Keyboard, saxophone, etc.
                </span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Your main role in a band (you can play multiple instruments)
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Musical Genres *</Label>
          <p className="text-xs text-gray-500">
            Select genres you enjoy playing (maximum 10)
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={selectedGenre} onValueChange={handleGenreSelect}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Choose a genre to add" />
            </SelectTrigger>
            <SelectContent>
              {MUSICAL_GENRES.filter(
                (genre) => !data.genres.includes(genre)
              ).map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            onClick={addGenre}
            disabled={!selectedGenre || data.genres.length >= 10}
            variant="outline"
            className="px-4"
          >
            Add
          </Button>
        </div>

        {data.genres.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Selected Genres:</Label>
            <div className="flex flex-wrap gap-2">
              {data.genres.map((genre) => (
                <Badge
                  key={genre}
                  variant="secondary"
                  className="bg-orange-100 text-orange-800 hover:bg-orange-200 cursor-pointer"
                  onClick={() => removeGenre(genre)}
                >
                  {genre} ×
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Click on a genre to remove it ({data.genres.length}/10)
            </p>
          </div>
        )}

        {data.genres.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No genres selected yet</p>
            <p className="text-xs">Add at least one genre to continue</p>
          </div>
        )}
      </div>
    </div>
  );
}
