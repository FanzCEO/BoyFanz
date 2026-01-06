import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Mail,
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  Send,
  HelpCircle,
  Shield,
  Zap,
  Users,
  Heart,
  PawPrint,
  ExternalLink
} from 'lucide-react';

const ContactMethod = ({
  icon: Icon,
  title,
  description,
  action,
  available = true,
  href,
  onClick
}: {
  icon: any;
  title: string;
  description: string;
  action: string;
  available?: boolean;
  href?: string;
  onClick?: () => void;
}) => {
  const content = (
    <Card className={`hover:shadow-lg transition-all duration-200 ${available ? 'cursor-pointer hover:border-primary/20' : 'opacity-60'}`}>
      <CardContent className="p-6 text-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
          available ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        }`}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-medium">{action}</span>
          {available && <Badge variant="outline" className="text-xs">Available</Badge>}
          {!available && <Badge variant="secondary" className="text-xs">Coming Soon</Badge>}
        </div>
      </CardContent>
    </Card>
  );

  if (href && available) {
    return <a href={href} className="block">{content}</a>;
  }
  if (onClick && available) {
    return <div onClick={onClick}>{content}</div>;
  }
  return content;
};

const FAQ = () => {
  const faqs = [
    {
      question: "How do I start earning as a creator?",
      answer: "Sign up as a creator, complete your profile, set your subscription price, and start uploading content. You can earn through subscriptions, tips, premium posts, and live streaming."
    },
    {
      question: "What are the platform fees?",
      answer: "BoyFanz operates on a 100% creator earnings program - we take 0% platform fees. You only pay standard payment processing fees (around 2.9%)."
    },
    {
      question: "How do payouts work?",
      answer: "You can request payouts anytime once you reach the minimum threshold. Payments are processed within 3-5 business days to your linked bank account, Paxum, or crypto wallet."
    },
    {
      question: "Is my content protected?",
      answer: "Yes, all content is protected with digital watermarking, screenshot detection, and strict DMCA policies. We take content protection seriously."
    },
    {
      question: "How do I verify my account?",
      answer: "Upload a government-issued ID through our secure KYC process. Verified creators get a badge and access to additional features."
    }
  ];

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-start gap-2">
              <HelpCircle className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
              {faq.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground pl-6">{faq.answer}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        category: 'general'
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8" data-testid="contact-page">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions? Need help? We're here to support creators and fans every step of the way.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <ContactMethod
            icon={MessageCircle}
            title="Live Chat"
            description="Chat with our support team in real-time"
            action="Start Chat"
            available={true}
            href="/help/chat"
          />
          <ContactMethod
            icon={Mail}
            title="Email Support"
            description="Get detailed help via email"
            action="Support@FanzUnlimited.com"
            available={true}
            href="mailto:Support@FanzUnlimited.com"
          />
          <ContactMethod
            icon={Phone}
            title="Phone Support"
            description="Speak directly with Emily, our AI Sales Rep"
            action="+1 (650) 899-7864"
            available={true}
            href="tel:+16508997864"
          />
          <ContactMethod
            icon={Users}
            title="Community"
            description="Join our creator community forum"
            action="Visit Forum"
            available={true}
            href="/forums"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Your name"
                        required
                        data-testid="contact-name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your@email.com"
                        required
                        data-testid="contact-email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <select 
                      className="w-full p-2 border border-border rounded-md bg-background"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      data-testid="contact-category"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="creator">Creator Support</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing & Payments</option>
                      <option value="content">Content & Moderation</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Brief description of your inquiry"
                      required
                      data-testid="contact-subject"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Tell us how we can help you..."
                      className="min-h-[120px]"
                      required
                      data-testid="contact-message"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                    data-testid="contact-submit"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Support Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Support Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Monday - Friday</span>
                  <span className="text-sm font-medium">9 AM - 8 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Saturday</span>
                  <span className="text-sm font-medium">10 AM - 6 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Sunday</span>
                  <span className="text-sm font-medium">12 PM - 5 PM EST</span>
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-green-400 font-medium">Currently Online</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="bg-red-500/5 border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Shield className="h-5 w-5" />
                  Emergency Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  For urgent security issues or content violations
                </p>
                <Button variant="outline" size="sm" className="w-full border-red-500/20 hover:bg-red-500/10">
                  <Zap className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </CardContent>
            </Card>

            {/* Office Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5" />
                  Our Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm font-medium">Fanz Unlimited Network LLC</p>
                <p className="text-sm text-muted-foreground">
                  30 N Gould Street<br />
                  Sheridan, WY 82801<br />
                  United States
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  A subsidiary of FANZ Group Holdings L.L.C.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto">
            <FAQ />
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Help Center</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Browse our comprehensive help articles
              </p>
              <Link href="/help">
                <Button variant="outline" size="sm">Visit Help Center</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Creator Resources</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tools and guides for content creators
              </p>
              <Link href="/help/tutorials">
                <Button variant="outline" size="sm">View Resources</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Safety Center</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Learn about our safety and security measures
              </p>
              <Link href="/safety">
                <Button variant="outline" size="sm">Learn More</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* The Wittle Bear Foundation */}
        <Card className="mt-12 border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-amber-500/5">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 text-center">
                <div className="inline-flex items-center justify-center gap-2 mb-3">
                  <PawPrint className="h-8 w-8 text-pink-400" />
                  <Heart className="h-6 w-6 text-pink-500 fill-pink-500 animate-pulse" />
                  <PawPrint className="h-8 w-8 text-pink-400 transform scale-x-[-1]" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-pink-400 via-pink-500 to-amber-400 bg-clip-text text-transparent">
                  The Wittle Bear Foundation
                </h3>
                <p className="text-sm text-pink-200/60 italic">In loving memory of Wittle Bear</p>
              </div>

              <div className="flex-1 text-center md:text-left">
                <p className="text-muted-foreground mb-4">
                  BoyFanz proudly supports The Wittle Bear Foundation, which provides shelter and resources to
                  homeless LGBTQ+ youth and helps animals in shelters find loving homes.
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4 text-pink-400" />
                    <span className="text-pink-300">LGBTQ+ Youth Support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <PawPrint className="h-4 w-4 text-amber-400" />
                    <span className="text-amber-300">Animal Rescue</span>
                  </div>
                </div>
                <p className="text-sm text-pink-300/60 mt-4 flex items-center gap-1 justify-center md:justify-start">
                  <Heart className="h-3 w-3 text-pink-500 fill-pink-500" />
                  A large portion of our profits supports this foundation
                </p>
                <div className="mt-4 flex justify-center md:justify-start">
                  <Link href="/wittle-bear-foundation">
                    <Button variant="outline" className="border-pink-500/30 hover:bg-pink-500/10 text-pink-300">
                      <Heart className="h-4 w-4 mr-2 fill-pink-500 text-pink-500" />
                      Learn More About Our Mission
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}