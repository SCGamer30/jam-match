"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Music, Bell, Shield, MapPin, Plus, X } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    email: "alex@example.com",
    bio: "Passionate guitarist and songwriter looking to create meaningful music with like-minded artists.",
    location: "San Francisco, CA",
    experience: "intermediate",
  });

  const [preferences, setPreferences] = useState({
    genres: ["Rock", "Indie", "Alternative"],
    instruments: ["Guitar", "Piano"],
    primaryRole: "guitarist",
  });

  const [notifications, setNotifications] = useState({
    newMatches: true,
    messages: true,
    bandInvites: true,
    emailUpdates: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showLocation: true,
    allowMessages: true,
  });

  const [newGenre, setNewGenre] = useState("");
  const [newInstrument, setNewInstrument] = useState("");

  const addGenre = () => {
    if (newGenre && !preferences.genres.includes(newGenre)) {
      setPreferences((prev) => ({
        ...prev,
        genres: [...prev.genres, newGenre],
      }));
      setNewGenre("");
    }
  };

  const removeGenre = (genre: string) => {
    setPreferences((prev) => ({
      ...prev,
      genres: prev.genres.filter((g) => g !== genre),
    }));
  };

  const addInstrument = () => {
    if (newInstrument && !preferences.instruments.includes(newInstrument)) {
      setPreferences((prev) => ({
        ...prev,
        instruments: [...prev.instruments, newInstrument],
      }));
      setNewInstrument("");
    }
  };

  const removeInstrument = (instrument: string) => {
    setPreferences((prev) => ({
      ...prev,
      instruments: prev.instruments.filter((i) => i !== instrument),
    }));
  };

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-secondary p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-chart-2/10 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2 animate-gradient">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Customize your JamMatch experience
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card/80 backdrop-blur-md border border-border shadow-lg">
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 smooth-transition data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="music"
              className="flex items-center gap-2 smooth-transition data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Music className="h-4 w-4" />
              Music
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2 smooth-transition data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="flex items-center gap-2 smooth-transition data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-card/90 backdrop-blur-sm border-border shadow-lg card-hover relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <User className="h-5 w-5 text-primary animate-pulse" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-foreground">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    className="bg-background border-border min-h-[100px]"
                    placeholder="Tell other musicians about yourself..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="location"
                      className="text-foreground flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-foreground">
                      Experience Level
                    </Label>
                    <Select
                      value={profile.experience}
                      onValueChange={(value) =>
                        setProfile((prev) => ({ ...prev, experience: value }))
                      }
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="professional">
                          Professional
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Music Preferences */}
          <TabsContent value="music" className="space-y-6">
            <Card className="bg-card/90 backdrop-blur-sm border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Music className="h-5 w-5 text-primary" />
                  Musical Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Genres */}
                <div className="space-y-3">
                  <Label className="text-foreground">Genres</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {preferences.genres.map((genre) => (
                      <Badge
                        key={genre}
                        variant="secondary"
                        className="bg-primary/10 text-primary border-primary/20"
                      >
                        {genre}
                        <button
                          onClick={() => removeGenre(genre)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      placeholder="Add a genre..."
                      className="bg-background border-border"
                      onKeyPress={(e) => e.key === "Enter" && addGenre()}
                    />
                    <Button
                      onClick={addGenre}
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Instruments */}
                <div className="space-y-3">
                  <Label className="text-foreground">Instruments</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {preferences.instruments.map((instrument) => (
                      <Badge
                        key={instrument}
                        variant="secondary"
                        className="bg-chart-2/10 text-chart-2 border-chart-2/20"
                      >
                        {instrument}
                        <button
                          onClick={() => removeInstrument(instrument)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newInstrument}
                      onChange={(e) => setNewInstrument(e.target.value)}
                      placeholder="Add an instrument..."
                      className="bg-background border-border"
                      onKeyPress={(e) => e.key === "Enter" && addInstrument()}
                    />
                    <Button
                      onClick={addInstrument}
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Primary Role */}
                <div className="space-y-2">
                  <Label htmlFor="primaryRole" className="text-foreground">
                    Primary Role
                  </Label>
                  <Select
                    value={preferences.primaryRole}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({
                        ...prev,
                        primaryRole: value,
                      }))
                    }
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guitarist">Guitarist</SelectItem>
                      <SelectItem value="vocalist">Vocalist</SelectItem>
                      <SelectItem value="drummer">Drummer</SelectItem>
                      <SelectItem value="bassist">Bassist</SelectItem>
                      <SelectItem value="keyboardist">Keyboardist</SelectItem>
                      <SelectItem value="producer">Producer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-card/90 backdrop-blur-sm border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">New Matches</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you have new compatible musicians
                    </p>
                  </div>
                  <Switch
                    checked={notifications.newMatches}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        newMatches: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you receive new messages
                    </p>
                  </div>
                  <Switch
                    checked={notifications.messages}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        messages: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Band Invites</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you&apos;re invited to join a band
                    </p>
                  </div>
                  <Switch
                    checked={notifications.bandInvites}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        bandInvites: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Email Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly summaries and updates via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailUpdates}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({
                        ...prev,
                        emailUpdates: checked,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-card/90 backdrop-blur-sm border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">
                      Profile Visibility
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Make your profile visible to other musicians
                    </p>
                  </div>
                  <Switch
                    checked={privacy.profileVisible}
                    onCheckedChange={(checked) =>
                      setPrivacy((prev) => ({
                        ...prev,
                        profileVisible: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Show Location</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your location to help find local musicians
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showLocation}
                    onCheckedChange={(checked) =>
                      setPrivacy((prev) => ({ ...prev, showLocation: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-foreground">Allow Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Let other musicians send you direct messages
                    </p>
                  </div>
                  <Switch
                    checked={privacy.allowMessages}
                    onCheckedChange={(checked) =>
                      setPrivacy((prev) => ({
                        ...prev,
                        allowMessages: checked,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
