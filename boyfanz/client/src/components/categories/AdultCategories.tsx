// @ts-nocheck
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Flame,
  Heart,
  Star,
  Users,
  Camera,
  Video,
  Sparkles,
  Crown,
  Zap,
  Moon,
  Sun,
  Music,
  Shirt,
  Dumbbell,
  Baby,
  PersonStanding,
  Footprints,
  Hand,
  Eye,
  Mic,
  MessageCircle,
  Lock,
  Unlock,
  Home,
  Building,
  TreeDeciduous,
  Car,
  Plane,
  Waves,
  Mountain
} from 'lucide-react';

// Comprehensive adult categories organized by type
export const ADULT_CATEGORIES = {
  // === ORIENTATION & GENDER TABS ===
  orientation: {
    label: 'Orientation',
    categories: [
      { id: 'gay', name: 'Gay', icon: '🏳️‍🌈', description: 'Men who love men' },
      { id: 'lesbian', name: 'Lesbian', icon: '👩‍❤️‍👩', description: 'Women who love women' },
      { id: 'bisexual', name: 'Bisexual', icon: '💜', description: 'Attracted to multiple genders' },
      { id: 'straight', name: 'Straight', icon: '💑', description: 'Heterosexual content' },
      { id: 'trans', name: 'Trans', icon: '🏳️‍⚧️', description: 'Transgender creators' },
      { id: 'nonbinary', name: 'Non-Binary', icon: '⚧️', description: 'Non-binary creators' },
      { id: 'queer', name: 'Queer', icon: '🌈', description: 'All queer identities' },
      { id: 'pansexual', name: 'Pansexual', icon: '💗', description: 'Attracted to all genders' },
    ]
  },

  // === BODY TYPES ===
  bodyTypes: {
    label: 'Body Types',
    categories: [
      { id: 'twink', name: 'Twink', icon: '🧑', description: 'Slim, youthful build' },
      { id: 'jock', name: 'Jock', icon: '🏋️', description: 'Athletic, muscular' },
      { id: 'bear', name: 'Bear', icon: '🐻', description: 'Larger, hairy men' },
      { id: 'otter', name: 'Otter', icon: '🦦', description: 'Slim and hairy' },
      { id: 'cub', name: 'Cub', icon: '🐻‍❄️', description: 'Younger bear type' },
      { id: 'daddy', name: 'Daddy', icon: '👨', description: 'Mature, dominant' },
      { id: 'muscle', name: 'Muscle', icon: '💪', description: 'Bodybuilder physique' },
      { id: 'chub', name: 'Chub', icon: '🍑', description: 'Plus size' },
      { id: 'femboy', name: 'Femboy', icon: '💅', description: 'Feminine presenting' },
      { id: 'thicc', name: 'Thicc', icon: '🍑', description: 'Curvy body type' },
      { id: 'milf', name: 'MILF', icon: '👩', description: 'Mature women' },
      { id: 'dilf', name: 'DILF', icon: '👨', description: 'Mature men' },
      { id: 'gilf', name: 'GILF', icon: '👴', description: 'Silver foxes' },
      { id: 'bbw', name: 'BBW', icon: '💋', description: 'Big beautiful women' },
      { id: 'petite', name: 'Petite', icon: '✨', description: 'Small and slender' },
      { id: 'amazon', name: 'Amazon', icon: '🦸‍♀️', description: 'Tall, strong women' },
    ]
  },

  // === KINKS & FETISHES ===
  kinks: {
    label: 'Kinks & Fetishes',
    categories: [
      // BDSM
      { id: 'bdsm', name: 'BDSM', icon: '⛓️', description: 'Bondage, discipline, dominance' },
      { id: 'bondage', name: 'Bondage', icon: '🔗', description: 'Rope, restraints, ties' },
      { id: 'domination', name: 'Domination', icon: '👑', description: 'Power exchange - dominant' },
      { id: 'submission', name: 'Submission', icon: '🧎', description: 'Power exchange - submissive' },
      { id: 'spanking', name: 'Spanking', icon: '🖐️', description: 'Impact play' },
      { id: 'flogging', name: 'Flogging', icon: '🏇', description: 'Whips and floggers' },
      { id: 'cbt', name: 'CBT', icon: '⚡', description: 'Cock and ball torture' },
      { id: 'chastity', name: 'Chastity', icon: '🔒', description: 'Denial and control' },
      { id: 'collaring', name: 'Collaring', icon: '📿', description: 'Collar and leash play' },
      { id: 'pet-play', name: 'Pet Play', icon: '🐕', description: 'Pup, kitten, pony' },
      { id: 'puppy-play', name: 'Puppy Play', icon: '🐶', description: 'Human pups' },
      { id: 'kitten-play', name: 'Kitten Play', icon: '🐱', description: 'Human kittens' },
      { id: 'pony-play', name: 'Pony Play', icon: '🐴', description: 'Human ponies' },

      // Leather & Rubber
      { id: 'leather', name: 'Leather', icon: '🧥', description: 'Leather gear fetish' },
      { id: 'rubber', name: 'Rubber/Latex', icon: '🖤', description: 'Latex and rubber gear' },
      { id: 'gear', name: 'Gear', icon: '🎭', description: 'Fetish gear and accessories' },
      { id: 'harness', name: 'Harness', icon: '🦺', description: 'Harness fetish' },
      { id: 'boots', name: 'Boots', icon: '👢', description: 'Boot worship' },
      { id: 'uniforms', name: 'Uniforms', icon: '👔', description: 'Military, police, etc.' },
      { id: 'jockstraps', name: 'Jockstraps', icon: '🩲', description: 'Jockstrap fetish' },
      { id: 'underwear', name: 'Underwear', icon: '🩳', description: 'Underwear fetish' },
      { id: 'socks', name: 'Socks', icon: '🧦', description: 'Sock fetish' },
      { id: 'sneakers', name: 'Sneakers', icon: '👟', description: 'Sneaker/trainer fetish' },

      // Body Parts
      { id: 'feet', name: 'Feet', icon: '🦶', description: 'Foot worship and play' },
      { id: 'armpits', name: 'Armpits', icon: '💪', description: 'Armpit fetish' },
      { id: 'ass', name: 'Ass Worship', icon: '🍑', description: 'Butt appreciation' },
      { id: 'muscle-worship', name: 'Muscle Worship', icon: '💪', description: 'Worshipping muscles' },
      { id: 'cock-worship', name: 'Cock Worship', icon: '🍆', description: 'Dick appreciation' },
      { id: 'oral-fixation', name: 'Oral Fixation', icon: '👄', description: 'Mouth play' },
      { id: 'nipple-play', name: 'Nipple Play', icon: '⭕', description: 'Nipple stimulation' },

      // Hair & Grooming
      { id: 'hairy', name: 'Hairy', icon: '🐻', description: 'Natural body hair' },
      { id: 'smooth', name: 'Smooth', icon: '✨', description: 'Shaved/hairless' },
      { id: 'beards', name: 'Beards', icon: '🧔', description: 'Facial hair lovers' },

      // Size Related
      { id: 'size-queen', name: 'Size Queen', icon: '📏', description: 'Bigger is better' },
      { id: 'big-cock', name: 'Big Cock', icon: '🍆', description: 'Well endowed' },
      { id: 'small-penis', name: 'SPH', icon: '🤏', description: 'Small penis humiliation' },
      { id: 'gaping', name: 'Gaping', icon: '⭕', description: 'Stretched holes' },
      { id: 'fisting', name: 'Fisting', icon: '✊', description: 'Extreme stretching' },

      // Fluids
      { id: 'cum', name: 'Cum', icon: '💦', description: 'Cum play and shots' },
      { id: 'creampie', name: 'Creampie', icon: '🥧', description: 'Internal cumshots' },
      { id: 'facial', name: 'Facials', icon: '😮', description: 'Facial cumshots' },
      { id: 'bukkake', name: 'Bukkake', icon: '💦', description: 'Multiple cumshots' },
      { id: 'watersports', name: 'Watersports', icon: '💧', description: 'Pee play' },
      { id: 'spit', name: 'Spit', icon: '💋', description: 'Spit play' },
      { id: 'sweat', name: 'Sweat', icon: '💧', description: 'Sweaty bodies' },

      // Humiliation & Degradation
      { id: 'humiliation', name: 'Humiliation', icon: '😳', description: 'Verbal degradation' },
      { id: 'cuckolding', name: 'Cuckolding', icon: '🦌', description: 'Watching partner' },
      { id: 'findom', name: 'Findom', icon: '💰', description: 'Financial domination' },
      { id: 'sissy', name: 'Sissy', icon: '👗', description: 'Feminization' },
      { id: 'slave', name: 'Slave Training', icon: '⛓️', description: 'Total power exchange' },

      // Exhibitionism & Voyeurism
      { id: 'exhibitionism', name: 'Exhibitionism', icon: '👀', description: 'Being watched' },
      { id: 'voyeurism', name: 'Voyeurism', icon: '🔭', description: 'Watching others' },
      { id: 'public', name: 'Public', icon: '🏙️', description: 'Public sex/nudity' },
      { id: 'caught', name: 'Caught', icon: '😱', description: 'Almost caught scenarios' },

      // Taboo
      { id: 'roleplay', name: 'Roleplay', icon: '🎭', description: 'Fantasy scenarios' },
      { id: 'age-play', name: 'Age Play', icon: '🍼', description: 'Adult baby/age regression' },
      { id: 'incest-fantasy', name: 'Fauxcest', icon: '🏠', description: 'Step-family roleplay' },
      { id: 'teacher-student', name: 'Teacher/Student', icon: '📚', description: 'Authority roleplay' },
      { id: 'boss-employee', name: 'Boss/Employee', icon: '💼', description: 'Office power play' },
      { id: 'stranger', name: 'Stranger', icon: '🎭', description: 'Anonymous encounters' },

      // Toys & Objects
      { id: 'toys', name: 'Sex Toys', icon: '🎮', description: 'Dildos, vibrators, etc.' },
      { id: 'butt-plugs', name: 'Butt Plugs', icon: '💎', description: 'Anal plugs' },
      { id: 'dildos', name: 'Dildos', icon: '🍆', description: 'Dildo play' },
      { id: 'machines', name: 'Fuck Machines', icon: '🤖', description: 'Mechanical toys' },
      { id: 'sounding', name: 'Sounding', icon: '📍', description: 'Urethral play' },
      { id: 'electro', name: 'Electro', icon: '⚡', description: 'Electrical stimulation' },

      // Food & Substances
      { id: 'food-play', name: 'Food Play', icon: '🍰', description: 'WAM and sploshing' },
      { id: 'smoking', name: 'Smoking', icon: '🚬', description: 'Smoking fetish' },
      { id: 'intox', name: 'Intoxication', icon: '🍻', description: 'Under the influence' },
    ]
  },

  // === SEXUAL ACTS ===
  acts: {
    label: 'Sexual Acts',
    categories: [
      { id: 'solo', name: 'Solo', icon: '🧍', description: 'Masturbation' },
      { id: 'oral', name: 'Oral', icon: '👄', description: 'Blowjobs & rimming' },
      { id: 'anal', name: 'Anal', icon: '🍑', description: 'Anal sex' },
      { id: 'vaginal', name: 'Vaginal', icon: '🌸', description: 'Vaginal sex' },
      { id: 'handjob', name: 'Handjob', icon: '✋', description: 'Hand stimulation' },
      { id: 'rimming', name: 'Rimming', icon: '👅', description: 'Ass eating' },
      { id: 'deepthroat', name: 'Deepthroat', icon: '😮', description: 'Deep oral' },
      { id: 'fingering', name: 'Fingering', icon: '☝️', description: 'Finger penetration' },
      { id: 'double-penetration', name: 'Double Penetration', icon: '✌️', description: 'DP action' },
      { id: 'gangbang', name: 'Gangbang', icon: '👥', description: 'Group on one' },
      { id: 'orgy', name: 'Orgy', icon: '🎉', description: 'Group sex' },
      { id: 'threesome', name: 'Threesome', icon: '3️⃣', description: 'Three-way action' },
      { id: 'foursome', name: 'Foursome', icon: '4️⃣', description: 'Four-way action' },
      { id: '69', name: '69', icon: '🔄', description: 'Mutual oral' },
      { id: 'edging', name: 'Edging', icon: '⏳', description: 'Orgasm control' },
      { id: 'ruined-orgasm', name: 'Ruined Orgasm', icon: '😩', description: 'Denied climax' },
      { id: 'prostate', name: 'Prostate Play', icon: '🎯', description: 'P-spot stimulation' },
      { id: 'breeding', name: 'Breeding', icon: '🍆💦', description: 'Cum inside' },
      { id: 'bareback', name: 'Bareback', icon: '🔓', description: 'No condom' },
    ]
  },

  // === CONTENT TYPES ===
  contentTypes: {
    label: 'Content Types',
    categories: [
      { id: 'photos', name: 'Photos', icon: '📸', description: 'Still images' },
      { id: 'videos', name: 'Videos', icon: '🎬', description: 'Video content' },
      { id: 'live', name: 'Live Streams', icon: '🔴', description: 'Live broadcasts' },
      { id: 'stories', name: 'Stories', icon: '📱', description: '24hr content' },
      { id: 'audio', name: 'Audio', icon: '🎧', description: 'Voice content' },
      { id: 'sexting', name: 'Sexting', icon: '💬', description: 'Text chat' },
      { id: 'phone-sex', name: 'Phone Sex', icon: '📞', description: 'Voice calls' },
      { id: 'video-call', name: 'Video Call', icon: '📹', description: 'Live video chat' },
      { id: 'customs', name: 'Custom Content', icon: '🎨', description: 'Made for you' },
      { id: 'gfe', name: 'GFE', icon: '💕', description: 'Girlfriend experience' },
      { id: 'bfe', name: 'BFE', icon: '💙', description: 'Boyfriend experience' },
      { id: 'ratings', name: 'Ratings', icon: '⭐', description: 'Dick/pussy ratings' },
      { id: 'tasks', name: 'Tasks/JOI', icon: '📋', description: 'Instructions & tasks' },
      { id: 'worship', name: 'Worship Content', icon: '🙏', description: 'Worship videos' },
    ]
  },

  // === LOCATIONS/SETTINGS ===
  locations: {
    label: 'Locations',
    categories: [
      { id: 'bedroom', name: 'Bedroom', icon: '🛏️', description: 'Home bedroom' },
      { id: 'bathroom', name: 'Bathroom', icon: '🚿', description: 'Shower/bath' },
      { id: 'outdoor', name: 'Outdoor', icon: '🌳', description: 'Nature/outside' },
      { id: 'car', name: 'Car', icon: '🚗', description: 'Vehicle play' },
      { id: 'office', name: 'Office', icon: '🏢', description: 'Workplace' },
      { id: 'hotel', name: 'Hotel', icon: '🏨', description: 'Hotels/motels' },
      { id: 'gym', name: 'Gym', icon: '🏋️', description: 'Locker room/gym' },
      { id: 'pool', name: 'Pool', icon: '🏊', description: 'Pool/hot tub' },
      { id: 'beach', name: 'Beach', icon: '🏖️', description: 'Beach/ocean' },
      { id: 'sauna', name: 'Sauna', icon: '🧖', description: 'Steam rooms' },
      { id: 'dungeon', name: 'Dungeon', icon: '⛓️', description: 'BDSM dungeon' },
      { id: 'glory-hole', name: 'Glory Hole', icon: '🕳️', description: 'Anonymous encounters' },
      { id: 'cruising', name: 'Cruising', icon: '🌙', description: 'Public cruising' },
    ]
  },

  // === ETHNICITY/RACE (user choice to show) ===
  ethnicity: {
    label: 'Ethnicity',
    categories: [
      { id: 'asian', name: 'Asian', icon: '🌏', description: 'Asian creators' },
      { id: 'black', name: 'Black/Ebony', icon: '🌍', description: 'Black creators' },
      { id: 'latino', name: 'Latino/Hispanic', icon: '🌎', description: 'Latino creators' },
      { id: 'white', name: 'White/Caucasian', icon: '🌐', description: 'White creators' },
      { id: 'middle-eastern', name: 'Middle Eastern', icon: '🕌', description: 'Middle Eastern creators' },
      { id: 'indian', name: 'Indian/Desi', icon: '🇮🇳', description: 'South Asian creators' },
      { id: 'mixed', name: 'Mixed Race', icon: '🌈', description: 'Mixed heritage' },
      { id: 'interracial', name: 'Interracial', icon: '🤝', description: 'Interracial content' },
    ]
  },

  // === AGE GROUPS (all 18+) ===
  ageGroups: {
    label: 'Age Groups',
    categories: [
      { id: 'young-adult', name: 'Young Adult (18-25)', icon: '🌟', description: '18-25 years' },
      { id: 'adult', name: 'Adult (26-35)', icon: '💫', description: '26-35 years' },
      { id: 'mature', name: 'Mature (36-50)', icon: '⭐', description: '36-50 years' },
      { id: 'silver', name: 'Silver (50+)', icon: '🦊', description: '50+ years' },
    ]
  },
};

// All categories flattened for search
export const ALL_CATEGORIES = Object.values(ADULT_CATEGORIES).flatMap(
  section => section.categories
);

interface AdultCategoriesProps {
  selectedCategories?: string[];
  onCategorySelect?: (categoryId: string) => void;
  mode?: 'browse' | 'select';
  maxSelections?: number;
}

export function AdultCategories({
  selectedCategories = [],
  onCategorySelect,
  mode = 'browse',
  maxSelections = 10
}: AdultCategoriesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('orientation');

  const filteredCategories = searchQuery
    ? ALL_CATEGORIES.filter(
        cat =>
          cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : ADULT_CATEGORIES[activeSection as keyof typeof ADULT_CATEGORIES]?.categories || [];

  const handleCategoryClick = (categoryId: string) => {
    if (mode === 'select' && onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  return (
    <Card className="bg-black/80 border-pink-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pink-400">
          <Flame className="h-5 w-5" />
          Browse Categories
        </CardTitle>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search kinks, fetishes, body types..."
            className="pl-10 bg-black/50 border-pink-500/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent>
        {/* Section Tabs */}
        {!searchQuery && (
          <ScrollArea className="w-full mb-4">
            <div className="flex gap-2 pb-2">
              {Object.entries(ADULT_CATEGORIES).map(([key, section]) => (
                <Button
                  key={key}
                  variant={activeSection === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveSection(key)}
                  className={activeSection === key ? 'bg-pink-500 hover:bg-pink-600' : 'border-pink-500/30'}
                >
                  {section.label}
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {filteredCategories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <Button
                key={category.id}
                variant={isSelected ? 'default' : 'outline'}
                className={`
                  h-auto py-3 px-4 flex flex-col items-start gap-1 whitespace-normal text-left
                  ${isSelected ? 'bg-pink-500 hover:bg-pink-600' : 'border-pink-500/20 hover:border-pink-500/50 hover:bg-pink-500/10'}
                `}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="text-xl">{category.icon}</span>
                  <span className="font-semibold text-sm">{category.name}</span>
                </div>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {category.description}
                </span>
              </Button>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No categories found for "{searchQuery}"</p>
          </div>
        )}

        {/* Selected Count */}
        {mode === 'select' && (
          <div className="mt-4 pt-4 border-t border-pink-500/20 flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {selectedCategories.length}/{maxSelections} selected
            </span>
            <div className="flex flex-wrap gap-1">
              {selectedCategories.slice(0, 5).map((catId) => {
                const cat = ALL_CATEGORIES.find(c => c.id === catId);
                return cat ? (
                  <Badge key={catId} className="bg-pink-500/20 text-pink-300 border-0">
                    {cat.icon} {cat.name}
                  </Badge>
                ) : null;
              })}
              {selectedCategories.length > 5 && (
                <Badge className="bg-pink-500/20 text-pink-300 border-0">
                  +{selectedCategories.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Quick category filter component for feeds
export function CategoryQuickFilter({
  selectedCategory,
  onSelect
}: {
  selectedCategory?: string;
  onSelect: (categoryId: string | undefined) => void;
}) {
  const popularCategories = [
    { id: 'all', name: 'All', icon: '🔥' },
    { id: 'gay', name: 'Gay', icon: '🏳️‍🌈' },
    { id: 'lesbian', name: 'Lesbian', icon: '👩‍❤️‍👩' },
    { id: 'trans', name: 'Trans', icon: '🏳️‍⚧️' },
    { id: 'twink', name: 'Twink', icon: '🧑' },
    { id: 'bear', name: 'Bear', icon: '🐻' },
    { id: 'daddy', name: 'Daddy', icon: '👨' },
    { id: 'muscle', name: 'Muscle', icon: '💪' },
    { id: 'bdsm', name: 'BDSM', icon: '⛓️' },
    { id: 'feet', name: 'Feet', icon: '🦶' },
    { id: 'leather', name: 'Leather', icon: '🧥' },
    { id: 'solo', name: 'Solo', icon: '🧍' },
    { id: 'couples', name: 'Couples', icon: '💑' },
    { id: 'group', name: 'Group', icon: '👥' },
  ];

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 pb-2">
        {popularCategories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id || (!selectedCategory && cat.id === 'all') ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelect(cat.id === 'all' ? undefined : cat.id)}
            className={
              selectedCategory === cat.id || (!selectedCategory && cat.id === 'all')
                ? 'bg-pink-500 hover:bg-pink-600'
                : 'border-pink-500/30'
            }
          >
            {cat.icon} {cat.name}
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}

export default AdultCategories;
