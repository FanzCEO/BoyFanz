import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Globe, Search, Shield } from "lucide-react";
import { useState } from "react";

const countries = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "IN", name: "India" },
  { code: "RU", name: "Russia" },
  { code: "CN", name: "China" },
];

export default function Countries() {
  const [search, setSearch] = useState("");
  const [blockedCountries, setBlockedCountries] = useState<string[]>([]);

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCountry = (code: string) => {
    setBlockedCountries(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <Globe className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Block Countries</h1>
          <p className="text-muted-foreground">Restrict access from specific countries</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Geo-Blocking
          </CardTitle>
          <CardDescription>
            Users from blocked countries won't be able to view your profile or content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search countries..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredCountries.map(country => (
              <div
                key={country.code}
                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => toggleCountry(country.code)}
              >
                <Checkbox
                  checked={blockedCountries.includes(country.code)}
                  onCheckedChange={() => toggleCountry(country.code)}
                />
                <Label className="flex-1 cursor-pointer">{country.name}</Label>
                <span className="text-xs text-muted-foreground">{country.code}</span>
              </div>
            ))}
          </div>

          {blockedCountries.length > 0 && (
            <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
              <p className="text-sm font-medium text-destructive">
                {blockedCountries.length} countries blocked
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Users from these countries cannot access your content
              </p>
            </div>
          )}

          <Button className="w-full mt-4">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
