
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SpecialtiesSectionProps {
  specialties: string[];
  onSpecialtyToggle: (specialty: string, checked: boolean) => void;
  onAddCustomSpecialty: (specialty: string) => void;
}

const predefinedSpecialties = [
  "Gel Polish", "Nail Art", "Extension", "Manicure", "Pedicure", 
  "Basic Care", "Design", "Acrylic", "Dip Powder"
];

export function SpecialtiesSection({ specialties, onSpecialtyToggle, onAddCustomSpecialty }: SpecialtiesSectionProps) {
  const [customSpecialty, setCustomSpecialty] = useState("");

  const handleAddCustomSpecialty = () => {
    if (customSpecialty.trim() && !specialties.includes(customSpecialty.trim())) {
      onAddCustomSpecialty(customSpecialty.trim());
      setCustomSpecialty("");
    }
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-gray-800">Chuyên môn</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {predefinedSpecialties.map((specialty) => (
            <div key={specialty} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Checkbox
                id={`specialty-${specialty}`}
                checked={specialties.includes(specialty)}
                onCheckedChange={(checked) => onSpecialtyToggle(specialty, checked as boolean)}
                className="data-[state=checked]:bg-pink-600 data-[state=checked]:border-pink-600"
              />
              <label htmlFor={`specialty-${specialty}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                {specialty}
              </label>
            </div>
          ))}
        </div>
        
        <div className="flex gap-3 pt-2">
          <Input
            placeholder="Thêm chuyên môn khác..."
            value={customSpecialty}
            onChange={(e) => setCustomSpecialty(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomSpecialty())}
            className="focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200"
          />
          <Button type="button" onClick={handleAddCustomSpecialty} variant="outline" className="shrink-0 border-pink-200 text-pink-600 hover:bg-pink-50 hover:border-pink-300">
            Thêm
          </Button>
        </div>
        
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {specialties.map((specialty, index) => (
              <span
                key={index}
                className="inline-flex items-center bg-pink-100 text-pink-700 text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-pink-200 transition-colors"
                onClick={() => onSpecialtyToggle(specialty, false)}
              >
                {specialty} 
                <span className="ml-1 text-pink-500 hover:text-pink-700">✕</span>
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
