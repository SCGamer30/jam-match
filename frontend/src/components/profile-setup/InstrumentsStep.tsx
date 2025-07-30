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
import { INSTRUMENTS } from "@/types/profile";

interface InstrumentsStepProps {
  data: {
    instruments: string[];
  };
  onUpdate: (data: Partial<InstrumentsStepProps["data"]>) => void;
}

export function InstrumentsStep({ data, onUpdate }: InstrumentsStepProps) {
  const [selectedInstrument, setSelectedInstrument] = useState<string>("");

  const addInstrument = () => {
    if (selectedInstrument && !data.instruments.includes(selectedInstrument)) {
      onUpdate({ instruments: [...data.instruments, selectedInstrument] });
      setSelectedInstrument("");
    }
  };

  const removeInstrument = (instrumentToRemove: string) => {
    onUpdate({
      instruments: data.instruments.filter(
        (instrument) => instrument !== instrumentToRemove
      ),
    });
  };

  const handleInstrumentSelect = (value: string) => {
    setSelectedInstrument(value);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Instruments *</Label>
        <p className="text-xs text-gray-500">
          Select all instruments you can play (maximum 10)
        </p>
      </div>

      <div className="flex gap-2">
        <Select
          value={selectedInstrument}
          onValueChange={handleInstrumentSelect}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Choose an instrument to add" />
          </SelectTrigger>
          <SelectContent>
            {INSTRUMENTS.filter(
              (instrument) => !data.instruments.includes(instrument)
            ).map((instrument) => (
              <SelectItem key={instrument} value={instrument}>
                {instrument}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          onClick={addInstrument}
          disabled={!selectedInstrument || data.instruments.length >= 10}
          variant="outline"
          className="px-4"
        >
          Add
        </Button>
      </div>

      {data.instruments.length > 0 && (
        <div className="space-y-4">
          <Label className="text-sm font-medium">Your Instruments:</Label>
          <div className="flex flex-wrap gap-2">
            {data.instruments.map((instrument) => (
              <Badge
                key={instrument}
                variant="secondary"
                className="bg-orange-100 text-orange-800 hover:bg-orange-200 cursor-pointer text-sm py-2 px-3"
                onClick={() => removeInstrument(instrument)}
              >
                {instrument} ×
              </Badge>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Click on an instrument to remove it ({data.instruments.length}/10)
          </p>
        </div>
      )}

      {data.instruments.length === 0 && (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="space-y-2">
            <div className="text-4xl">🎵</div>
            <p className="text-sm font-medium">No instruments selected yet</p>
            <p className="text-xs">Add at least one instrument to continue</p>
          </div>
        </div>
      )}

      <div className="bg-orange-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-orange-800 mb-2">💡 Pro Tip</h3>
        <p className="text-xs text-orange-700">
          Include all instruments you're comfortable playing in a band setting.
          This helps us find the best matches and gives you more opportunities
          to connect with other musicians.
        </p>
      </div>
    </div>
  );
}
