import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Filter, RotateCcw } from 'lucide-react';

interface FilterState {
  gender: string;
  minAge: number | null;
  maxAge: number | null;
  sexualOrientation: string[];
  relationshipStatus: string[];
  styleAttitude: string[];
}

interface CreatorFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

const GENDER_OPTIONS = [
  { value: 'all', label: 'All genders' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
];

const ORIENTATION_OPTIONS = [
  { value: 'gay', label: 'Gay' },
  { value: 'lesbian', label: 'Lesbian' },
  { value: 'bisexual', label: 'Bisexual' },
  { value: 'transgender', label: 'Transgender' },
  { value: 'metrosexual', label: 'Metrosexual' },
];

const RELATIONSHIP_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'couple', label: 'Couple' },
  { value: 'open', label: 'Open' },
  { value: 'married', label: 'Married' },
  { value: 'monogamous', label: 'Monogamous' },
  { value: 'poly', label: 'Poly' },
];

const STYLE_ATTITUDE_OPTIONS = [
  'Badass With A Good Ass',
  'Big Dick Energy',
  'Down To Earth',
  'Southern',
  'Masculine',
  'Girl Bye',
  "Can't Touch Dis",
  'Cunty',
  'Lover',
  'Fighter',
  'Horny Boy',
  'Bad Boy',
  'Good Boy',
  'Sex Demon',
  'Sex God',
  'Chill',
  'Over The Damn Top',
  'High Maintenance',
  'Just Suck My Dick',
  'Shove It In Me',
  'Bossy',
  'Sub',
  'Dom',
  'Better Than',
  "Just A Good Ol' Boy Never Meanin' No Harm",
];

const defaultFilters: FilterState = {
  gender: 'all',
  minAge: null,
  maxAge: null,
  sexualOrientation: [],
  relationshipStatus: [],
  styleAttitude: [],
};

export function CreatorFilterModal({ open, onOpenChange, onApply, initialFilters }: CreatorFilterModalProps) {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    ...initialFilters,
  });

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  const handleApply = () => {
    onApply(filters);
    onOpenChange(false);
  };

  const toggleArrayValue = (key: keyof FilterState, value: string) => {
    const current = filters[key] as string[];
    if (current.includes(value)) {
      setFilters({ ...filters, [key]: current.filter(v => v !== value) });
    } else {
      setFilters({ ...filters, [key]: [...current, value] });
    }
  };

  const activeFilterCount = [
    filters.gender !== 'all' ? 1 : 0,
    filters.minAge !== null ? 1 : 0,
    filters.maxAge !== null ? 1 : 0,
    filters.sexualOrientation.length,
    filters.relationshipStatus.length,
    filters.styleAttitude.length,
  ].reduce((a, b) => a + b, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-zinc-900 border-zinc-800 text-white max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Filter className="w-5 h-5" />
            Filter Creators
            {activeFilterCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 rounded-full text-xs">
                {activeFilterCount}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-6 py-4">
            {/* Gender */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-zinc-300">Gender</Label>
              <RadioGroup
                value={filters.gender}
                onValueChange={(value) => setFilters({ ...filters, gender: value })}
                className="flex flex-wrap gap-2"
              >
                {GENDER_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <RadioGroupItem
                      value={option.value}
                      id={`gender-${option.value}`}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={`gender-${option.value}`}
                      className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                        filters.gender === option.value
                          ? 'bg-red-500 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Age Range */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-zinc-300">Age Range</Label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Min age"
                    min={18}
                    max={99}
                    value={filters.minAge ?? ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      minAge: e.target.value ? parseInt(e.target.value) : null
                    })}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
                <span className="text-zinc-500">to</span>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Max age"
                    min={18}
                    max={99}
                    value={filters.maxAge ?? ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      maxAge: e.target.value ? parseInt(e.target.value) : null
                    })}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                </div>
              </div>
            </div>

            {/* Sexual Orientation */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-zinc-300">Sexual Orientation</Label>
              <div className="flex flex-wrap gap-2">
                {ORIENTATION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleArrayValue('sexualOrientation', option.value)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      filters.sexualOrientation.includes(option.value)
                        ? 'bg-red-500 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Relationship Status */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-zinc-300">Relationship Status</Label>
              <div className="flex flex-wrap gap-2">
                {RELATIONSHIP_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleArrayValue('relationshipStatus', option.value)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      filters.relationshipStatus.includes(option.value)
                        ? 'bg-red-500 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Style & Attitude */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-zinc-300">Style & Attitude</Label>
              <div className="flex flex-wrap gap-2">
                {STYLE_ATTITUDE_OPTIONS.map((style) => (
                  <button
                    key={style}
                    onClick={() => toggleArrayValue('styleAttitude', style)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      filters.styleAttitude.includes(style)
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-shrink-0 flex gap-2 pt-4 border-t border-zinc-800">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 bg-transparent border-zinc-700 text-zinc-400 hover:bg-zinc-800"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
          >
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { FilterState };
