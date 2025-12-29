import { useState } from 'react';
import { Link } from 'wouter';
import {
  Scale,
  FileText,
  Shield,
  Eye,
  AlertTriangle,
  BookOpen,
  Camera,
  CreditCard,
  Lock,
  Users,
  Globe,
  Clock,
  ChevronRight,
  ArrowLeft,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface LegalDocument {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  category: 'legal' | 'compliance' | 'guidelines';
  lastUpdated: string;
  required: boolean;
}

const legalDocuments: LegalDocument[] = [
  {
    id: 'terms',
    title: 'Terms of Service',
    description: 'The agreement between you and BoyFanz governing your use of our platform and services.',
    icon: FileText,
    path: '/legal/terms',
    category: 'legal',
    lastUpdated: '2024-12-01',
    required: true
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    description: 'How we collect, use, protect, and share your personal information.',
    icon: Lock,
    path: '/legal/privacy',
    category: 'legal',
    lastUpdated: '2024-12-01',
    required: true
  },
  {
    id: 'dmca',
    title: 'DMCA Policy',
    description: 'Our policy for handling copyright infringement claims and takedown requests.',
    icon: Shield,
    path: '/legal/dmca',
    category: 'legal',
    lastUpdated: '2024-11-15',
    required: false
  },
  {
    id: '2257',
    title: '18 U.S.C. 2257 Compliance',
    description: 'Record-keeping requirements for age verification and content documentation.',
    icon: Eye,
    path: '/legal/2257',
    category: 'compliance',
    lastUpdated: '2024-12-01',
    required: true
  },
  {
    id: 'content-guidelines',
    title: 'Content Guidelines',
    description: 'Rules and standards for content creation, posting, and community behavior.',
    icon: Camera,
    path: '/legal/content-guidelines',
    category: 'guidelines',
    lastUpdated: '2024-12-15',
    required: true
  },
  {
    id: 'community',
    title: 'Community Standards',
    description: 'Expected behavior and interaction guidelines for all platform users.',
    icon: Users,
    path: '/legal/community',
    category: 'guidelines',
    lastUpdated: '2024-11-01',
    required: false
  },
  {
    id: 'payments',
    title: 'Payment Terms',
    description: 'Billing, refunds, payouts, and financial transaction policies.',
    icon: CreditCard,
    path: '/legal/payments',
    category: 'legal',
    lastUpdated: '2024-10-15',
    required: false
  },
  {
    id: 'cookies',
    title: 'Cookie Policy',
    description: 'How we use cookies and tracking technologies on our platform.',
    icon: Globe,
    path: '/legal/cookies',
    category: 'compliance',
    lastUpdated: '2024-09-01',
    required: false
  }
];

const categoryInfo = {
  legal: {
    label: 'Legal Agreements',
    color: 'bg-red-500/10 text-red-400 border-red-500/20'
  },
  compliance: {
    label: 'Regulatory Compliance',
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  },
  guidelines: {
    label: 'Platform Guidelines',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  }
};

export function LegalLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredDocs = legalDocuments.filter(doc => {
    const matchesSearch = !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedDocs = filteredDocs.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, LegalDocument[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20" data-testid="legal-library-page">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-orange-500/10"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <Link href="/help" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Help Center
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-red-600 to-orange-500 rounded-full">
              <Scale className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Legal Library</h1>
              <p className="text-gray-400 text-lg mt-1">
                Terms, policies, and compliance documentation
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              placeholder="Search legal documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-12"
              data-testid="legal-search"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className={selectedCategory === null ? "bg-gradient-to-r from-red-600 to-orange-500" : "border-gray-700"}
          >
            All Documents
          </Button>
          {Object.entries(categoryInfo).map(([key, { label }]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              onClick={() => setSelectedCategory(key)}
              className={selectedCategory === key ? "bg-gradient-to-r from-red-600 to-orange-500" : "border-gray-700"}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Important Notice */}
        <Card className="bg-orange-500/10 border-orange-500/30 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Important Legal Information</h3>
                <p className="text-gray-300 text-sm">
                  By using BoyFanz, you agree to be bound by our Terms of Service and all applicable policies.
                  Please review these documents carefully. If you do not agree, please discontinue use of our services.
                  For questions, contact <span className="text-orange-400">legal@fanz.website</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents by Category */}
        {Object.entries(groupedDocs).map(([category, docs]) => (
          <div key={category} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-white">
                {categoryInfo[category as keyof typeof categoryInfo].label}
              </h2>
              <Badge className={categoryInfo[category as keyof typeof categoryInfo].color}>
                {docs.length} {docs.length === 1 ? 'document' : 'documents'}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {docs.map((doc) => (
                <Link key={doc.id} href={doc.path}>
                  <Card className="group bg-gray-900/50 border-gray-800 hover:border-red-500/50 transition-all duration-300 cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg group-hover:from-red-500/20 group-hover:to-orange-500/20 transition-colors">
                          <doc.icon className="h-6 w-6 text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors">
                              {doc.title}
                            </h3>
                            {doc.required && (
                              <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">
                                Required
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                            {doc.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              Updated {new Date(doc.lastUpdated).toLocaleDateString()}
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {filteredDocs.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No documents found</h3>
            <p className="text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}

        {/* Contact Section */}
        <Separator className="my-12 bg-gray-800" />

        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-8 text-center">
            <Scale className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-3">Questions About Our Policies?</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              If you have questions about our legal documents, need clarification on any policy,
              or require accommodation, our legal team is here to help.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600">
                <Link href="/contact">Contact Legal Team</Link>
              </Button>
              <Button variant="outline" className="border-gray-700" asChild>
                <a href="mailto:legal@fanz.website">legal@fanz.website</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Company Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="mb-2">
            <strong className="text-gray-400">Fanz Unlimited Network LLC</strong>
          </p>
          <p>A subsidiary of FANZ Group Holdings LLC</p>
          <p>30 N Gould Street, Sheridan, Wyoming 82801, United States</p>
        </div>
      </div>
    </div>
  );
}

export default LegalLibrary;
