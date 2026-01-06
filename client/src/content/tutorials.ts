// Comprehensive Tutorial Content for BoyFanz Platform
// Includes mandatory creator training, feature tutorials, and best practices

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'interactive' | 'quiz';
  videoUrl?: string;
  interactiveElement?: {
    type: 'click' | 'form' | 'navigation' | 'highlight';
    target: string; // CSS selector or route
    instruction: string;
    validation?: string;
  };
  quiz?: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
  tips?: string[];
  warningNote?: string;
  duration: number; // seconds
}

export interface Tutorial {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  categorySlug: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // total minutes
  steps: TutorialStep[];
  prerequisites?: string[]; // tutorial IDs
  isMandatory?: boolean;
  mandatoryFor?: ('creator' | 'fan' | 'all')[];
  thumbnailUrl?: string;
  tags: string[];
  instructor: {
    name: string;
    avatar: string;
    title: string;
  };
  learningObjectives: string[];
  certification?: {
    name: string;
    badge: string;
    validFor: number; // days, 0 = permanent
  };
}

export interface TutorialCategory {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}

// Tutorial Categories
export const TUTORIAL_CATEGORIES: TutorialCategory[] = [
  {
    name: "Mandatory Creator Training",
    slug: "mandatory",
    description: "Required training for all content creators before publishing",
    icon: "shield",
    color: "red",
    order: 0
  },
  {
    name: "Getting Started",
    slug: "getting-started",
    description: "Essential tutorials for new users",
    icon: "rocket",
    color: "blue",
    order: 1
  },
  {
    name: "Content Creation",
    slug: "content-creation",
    description: "Creating and managing your content",
    icon: "camera",
    color: "purple",
    order: 2
  },
  {
    name: "Monetization",
    slug: "monetization",
    description: "Earning money and managing payments",
    icon: "dollar-sign",
    color: "green",
    order: 3
  },
  {
    name: "Fan Engagement",
    slug: "fan-engagement",
    description: "Building and engaging your audience",
    icon: "users",
    color: "pink",
    order: 4
  },
  {
    name: "Live Streaming",
    slug: "live-streaming",
    description: "Going live and hosting events",
    icon: "video",
    color: "orange",
    order: 5
  },
  {
    name: "Privacy & Security",
    slug: "privacy-security",
    description: "Protecting yourself and your content",
    icon: "lock",
    color: "gray",
    order: 6
  },
  {
    name: "Advanced Features",
    slug: "advanced",
    description: "Power user features and automation",
    icon: "zap",
    color: "yellow",
    order: 7
  }
];

// Default instructor
const defaultInstructor = {
  name: "BoyFanz Academy",
  avatar: "/avatars/academy.png",
  title: "Official Training Team"
};

// MANDATORY CREATOR TRAINING
export const MANDATORY_TUTORIALS: Tutorial[] = [
  {
    id: "mandatory-2257",
    title: "18 U.S.C. §2257 Compliance Training",
    slug: "2257-compliance-training",
    description: "MANDATORY: Learn about federal record-keeping requirements for adult content. This training must be completed before you can post any content.",
    category: "Mandatory Creator Training",
    categorySlug: "mandatory",
    difficulty: "beginner",
    duration: 25,
    isMandatory: true,
    mandatoryFor: ["creator"],
    tags: ["compliance", "2257", "legal", "mandatory", "records"],
    instructor: {
      name: "Legal Compliance Team",
      avatar: "/avatars/legal.png",
      title: "Compliance Officers"
    },
    learningObjectives: [
      "Understand what 18 U.S.C. §2257 requires",
      "Know what records you must keep",
      "Learn how to properly verify age",
      "Understand the consequences of non-compliance",
      "Complete your compliance documentation"
    ],
    certification: {
      name: "2257 Compliance Certified",
      badge: "2257-certified",
      validFor: 365
    },
    steps: [
      {
        id: "2257-intro",
        title: "What is 18 U.S.C. §2257?",
        type: "text",
        content: `# Understanding 2257 Compliance

**18 U.S.C. §2257** is a federal law that requires producers of sexually explicit content to maintain records proving that all performers are at least 18 years old.

## Why This Matters

As a content creator on BoyFanz, you are legally considered a "producer" of adult content. This means you must:

1. **Verify age** of everyone appearing in your content
2. **Maintain records** of that verification
3. **Make records available** for inspection if required
4. **Display required disclosures** on your content

## Penalties for Non-Compliance

Violations can result in:
- **Criminal prosecution**
- **Fines up to $250,000**
- **Up to 5 years in prison** for first offense
- **Permanent platform ban**

This is not optional. Let's learn how to stay compliant.`,
        duration: 180,
        warningNote: "This is a federal law. Non-compliance is a criminal offense."
      },
      {
        id: "2257-requirements",
        title: "What Records You Must Keep",
        type: "text",
        content: `# Required Record-Keeping

## For EVERY piece of content, you must have:

### 1. Government-Issued ID Copy
- Driver's license, passport, or state ID
- Must show **name**, **date of birth**, and **photo**
- Must be **current and not expired** at time of content creation

### 2. Cross-Reference Information
- Legal name matching the ID
- Any stage names or aliases used
- Date content was produced
- Your name as the producer

### 3. Consent Documentation
- Signed model release form
- Acknowledgment of being 18+
- Permission to use content commercially

## How Long to Keep Records

- **Minimum 7 years** after last content publication
- Must be accessible within 24 hours if requested
- Must be organized and indexed

## BoyFanz Makes This Easy

We provide built-in tools to:
- Store ID verifications securely
- Generate compliant release forms
- Track all required documentation
- Export records if needed`,
        duration: 240,
        tips: [
          "Always verify BEFORE creating content, not after",
          "Keep digital and physical backup copies",
          "Update records if IDs are renewed"
        ]
      },
      {
        id: "2257-verification",
        title: "Age Verification Process",
        type: "interactive",
        content: `# How to Verify Age Properly

## Step-by-Step Verification

### Step 1: Request Valid ID
Ask for a **current, government-issued photo ID** showing:
- Full legal name
- Date of birth (must be 18+ at content creation)
- Clear photo matching the person

### Step 2: Verify Authenticity
Check that the ID:
- Isn't expired
- Matches the person in front of you
- Shows no signs of tampering
- Has valid security features

### Step 3: Document the Verification
- Take a clear photo/scan of the ID
- Have the person sign a consent form
- Record the date of verification
- Store securely

### Step 4: Cross-Reference
Create a cross-reference record linking:
- The performer's legal name
- Any stage names used
- The specific content created
- Date of production

**Now let's practice uploading verification documents.**`,
        interactiveElement: {
          type: "navigation",
          target: "/compliance",
          instruction: "Click the button below to visit the Compliance page and see where to upload your 2257 documents"
        },
        duration: 300
      },
      {
        id: "2257-quiz",
        title: "Knowledge Check: 2257 Basics",
        type: "quiz",
        content: "Let's test your understanding of 2257 requirements.",
        quiz: {
          question: "How long must you keep 2257 records after your last content publication?",
          options: [
            "1 year",
            "3 years",
            "7 years",
            "Forever"
          ],
          correctAnswer: 2,
          explanation: "Federal law requires records be maintained for a minimum of 7 years after the last content featuring that performer is published."
        },
        duration: 60
      },
      {
        id: "2257-platform-tools",
        title: "Using BoyFanz Compliance Tools",
        type: "interactive",
        content: `# BoyFanz Compliance Dashboard

We've built tools to make compliance easy:

## Compliance Page Features

### 1. ID Verification Upload
- Securely upload ID scans
- Automatic data extraction
- Encrypted storage

### 2. Digital Consent Forms
- Pre-built legally compliant forms
- Electronic signature capture
- Automatic date/time stamping

### 3. Content-Performer Linking
- Associate content with verified performers
- Track who appears in what
- Generate compliance reports

### 4. Record Export
- Download all records anytime
- Compliance-ready format
- Audit trail included

## Let's Set Up Your First Verification`,
        interactiveElement: {
          type: "click",
          target: "[data-testid='upload-documents-button']",
          instruction: "Click 'Complete 2257 Verification' to start your first verification"
        },
        duration: 180
      },
      {
        id: "2257-solo-content",
        title: "Special Case: Solo Content",
        type: "text",
        content: `# 2257 for Solo Creators

## You Still Need Records - Even for Solo Content!

If you're the **only person** in your content, you still need:

### 1. Your Own Verified ID
- Upload your government-issued ID
- Must be on file before posting content

### 2. Self-Certification
- Confirm you are 18+
- Acknowledge you're the sole performer
- Sign digital consent form

### 3. Per-Content Records
- Each post links to your verification
- BoyFanz handles this automatically
- Records maintained on your behalf

## Why Solo Content Still Needs Records

- The law doesn't distinguish between solo and partnered content
- All sexually explicit content requires producer records
- The producer (you) must verify the performer (also you)

**BoyFanz simplifies this**: Once your ID is verified through our KYC process, your solo content is automatically linked to your verification records.`,
        duration: 120,
        tips: [
          "Complete your KYC verification once, and solo content is covered",
          "For content with others, you need THEIR verification too",
          "Keep your profile verification current"
        ]
      },
      {
        id: "2257-others",
        title: "Content Featuring Other People",
        type: "text",
        content: `# When Others Appear in Your Content

## CRITICAL: Additional Requirements

If **anyone else** appears in your sexually explicit content, you MUST:

### Before Creating Content:

1. **Verify Their Age**
   - Obtain copy of their government ID
   - Confirm they are 18+
   - Document the verification

2. **Get Written Consent**
   - Have them sign a model release
   - Include content description
   - Both parties keep copies

3. **Record Their Information**
   - Legal name
   - Stage name (if different)
   - ID document details
   - Consent form reference

### After Creating Content:

4. **Link Records to Content**
   - Tag which content they appear in
   - Note production date
   - Store in compliance system

## Using BoyFanz CoStar Feature

Our **CoStar verification** system:
- Allows collaborators to verify themselves
- Links their verification to your content
- Maintains proper 2257 records
- Protects both parties legally

**Never create content with unverified individuals.**`,
        duration: 180,
        warningNote: "Creating content with unverified individuals is a federal crime, even if they claim to be 18+."
      },
      {
        id: "2257-final-quiz",
        title: "Final Certification Quiz",
        type: "quiz",
        content: "Complete this quiz to earn your 2257 Compliance Certification.",
        quiz: {
          question: "Which of the following is TRUE about 2257 compliance?",
          options: [
            "You only need records if someone reports you",
            "Solo content creators don't need to keep records",
            "You must verify age and maintain records for all sexually explicit content",
            "Verbal confirmation of age is sufficient"
          ],
          correctAnswer: 2,
          explanation: "All producers of sexually explicit content must verify the age of all performers (including themselves for solo content) and maintain proper records. This is a strict requirement with no exceptions."
        },
        duration: 60
      },
      {
        id: "2257-complete",
        title: "Completing Your 2257 Setup",
        type: "interactive",
        content: `# You're Almost Certified!

## Final Steps to Complete:

### 1. Upload Your ID Verification
If you haven't already, complete your identity verification through VerifyMy.

### 2. Complete 2257 Forms
Fill out your 2257 compliance documentation on the Compliance page.

### 3. Acknowledge Understanding
By completing this training, you acknowledge:
- You understand 2257 requirements
- You will maintain proper records
- You will only create content with verified individuals
- Non-compliance may result in legal action and platform ban

## You're Now 2257 Certified!

Your certification badge will appear on your profile, showing fans and collaborators that you take compliance seriously.

**Remember**: This certification is valid for 1 year. You'll need to renew annually.`,
        interactiveElement: {
          type: "navigation",
          target: "/compliance",
          instruction: "Go to your Compliance page to complete your 2257 documentation"
        },
        duration: 120
      }
    ]
  },
  {
    id: "mandatory-costar",
    title: "CoStar Verification Training",
    slug: "costar-verification-training",
    description: "MANDATORY: Learn how to properly verify and document collaborators in your content. Required before creating content with other people.",
    category: "Mandatory Creator Training",
    categorySlug: "mandatory",
    difficulty: "beginner",
    duration: 20,
    isMandatory: true,
    mandatoryFor: ["creator"],
    prerequisites: ["mandatory-2257"],
    tags: ["costar", "collaboration", "verification", "mandatory"],
    instructor: defaultInstructor,
    learningObjectives: [
      "Understand the CoStar verification system",
      "Learn how to invite collaborators for verification",
      "Know what documentation is required",
      "Properly tag co-performers in content",
      "Handle verification issues"
    ],
    certification: {
      name: "CoStar Verified Creator",
      badge: "costar-certified",
      validFor: 365
    },
    steps: [
      {
        id: "costar-intro",
        title: "What is CoStar Verification?",
        type: "text",
        content: `# CoStar Verification System

## Protecting You and Your Collaborators

**CoStar** is BoyFanz's system for verifying and documenting people who appear in your content.

### Why CoStar Exists

1. **Legal Compliance** - Ensures 2257 compliance for multi-person content
2. **Consent Documentation** - Creates verified consent records
3. **Revenue Sharing** - Enables automatic payment splits
4. **Content Protection** - Prevents unauthorized use claims
5. **Dispute Resolution** - Provides clear documentation

### How It Works

1. **Invite** your collaborator via email or username
2. **They verify** their identity through our system
3. **Both sign** digital consent forms
4. **Content links** to both verifications automatically
5. **Records maintained** in compliance with law

### Benefits for Collaborators

- Their own verified profile
- Automatic content crediting
- Revenue share when applicable
- Protection of their rights
- Verification badge on profile`,
        duration: 180
      },
      {
        id: "costar-invite",
        title: "Inviting a CoStar",
        type: "interactive",
        content: `# How to Invite Collaborators

## Step-by-Step Process

### Step 1: Access CoStar Page
Navigate to the CoStar verification page from your dashboard or content creation screen.

### Step 2: Send Invitation
You can invite someone by:
- **BoyFanz Username** - If they already have an account
- **Email Address** - For new users (they'll create account)
- **QR Code** - In-person verification

### Step 3: They Complete Verification
Your CoStar needs to:
- Verify their identity (if not already done)
- Review the collaboration terms
- Sign the digital consent form
- Accept the content agreement

### Step 4: Verification Confirmed
Once complete:
- Green checkmark appears on their profile
- You can create content together
- All records are automatically linked
- Both profiles show the collaboration

**Let's see the CoStar invite process:**`,
        interactiveElement: {
          type: "navigation",
          target: "/costar/verify",
          instruction: "Click to view the CoStar verification page"
        },
        duration: 240
      },
      {
        id: "costar-consent",
        title: "Consent Documentation",
        type: "text",
        content: `# Understanding Consent Forms

## What the Consent Form Covers

### Both Parties Agree To:

1. **Identity Confirmation**
   - Legal name and age verified
   - Willing participation confirmed
   - No coercion or pressure

2. **Content Rights**
   - Permission to create content
   - How content can be used
   - Duration of rights granted
   - Territorial permissions

3. **Compensation Agreement**
   - Any payment arrangements
   - Revenue sharing terms
   - Payment timing

4. **Revocation Rights**
   - How to revoke consent
   - What happens to existing content
   - Notice requirements

### The Digital Process

- Forms are pre-filled with verified info
- Both parties sign electronically
- Timestamp and IP recorded
- Copy sent to both emails
- Stored in compliance system

### Important Notes

- **Never skip this step** - even for partners/friends
- **Keep your own copies** - download PDFs
- **Review before signing** - understand what you're agreeing to
- **Content-specific** - new form for each production session`,
        duration: 180,
        tips: [
          "Always complete consent BEFORE creating content",
          "Save copies of all signed forms",
          "Be specific about what content is being created"
        ],
        warningNote: "Creating content without proper consent documentation is a violation of platform rules and potentially the law."
      },
      {
        id: "costar-tagging",
        title: "Tagging CoStars in Content",
        type: "interactive",
        content: `# Linking Content to Verified CoStars

## When Uploading Content

### Required Tagging

When uploading content featuring other people, you MUST:

1. **Tag Each CoStar**
   - Select from your verified CoStars list
   - Cannot upload without proper tags
   - System checks verification status

2. **Confirm Content Match**
   - Verify the content matches consent form
   - Confirm all visible performers are tagged
   - Acknowledge compliance requirements

3. **Set Revenue Split** (if applicable)
   - Agree on percentage splits
   - CoStar confirms their share
   - Automatic payment distribution

### What If Someone Isn't Verified?

**You cannot upload the content** until:
- They complete CoStar verification
- Their consent form is signed
- Their identity is confirmed

### After Upload

- Content links to all CoStar records
- 2257 compliance automatically documented
- CoStars can see their tagged content
- Revenue sharing begins (if set up)`,
        interactiveElement: {
          type: "highlight",
          target: "[data-testid='costar-tag-input']",
          instruction: "When uploading content, you'll use this field to tag your verified CoStars"
        },
        duration: 180
      },
      {
        id: "costar-quiz",
        title: "CoStar Certification Quiz",
        type: "quiz",
        content: "Test your understanding of the CoStar system.",
        quiz: {
          question: "When must CoStar verification be completed?",
          options: [
            "Within 30 days of content upload",
            "Before any content featuring them is created",
            "Only if they want revenue sharing",
            "Only for professional collaborations"
          ],
          correctAnswer: 1,
          explanation: "CoStar verification MUST be completed BEFORE creating any content featuring that person. This ensures proper legal compliance and consent documentation."
        },
        duration: 60
      },
      {
        id: "costar-complete",
        title: "You're CoStar Certified!",
        type: "text",
        content: `# Congratulations!

## You've Completed CoStar Training

You now understand:
- ✅ How to invite collaborators
- ✅ The consent documentation process
- ✅ How to properly tag content
- ✅ Revenue sharing basics
- ✅ Your legal obligations

## Your Certification

Your **CoStar Verified Creator** badge:
- Shows on your profile
- Indicates you're trained on collaboration compliance
- Valid for 1 year
- Required for multi-person content

## Next Steps

1. If you plan to collaborate, invite your CoStars now
2. Review the full consent form template
3. Set up revenue sharing preferences
4. Start creating compliant content!

**Remember**: Every person in your content must be verified. No exceptions.`,
        duration: 120
      }
    ]
  },
  {
    id: "mandatory-best-practices",
    title: "Creator Best Practices & Platform Rules",
    slug: "creator-best-practices",
    description: "MANDATORY: Essential guidelines for success and safety on BoyFanz. Learn the do's and don'ts before you start creating.",
    category: "Mandatory Creator Training",
    categorySlug: "mandatory",
    difficulty: "beginner",
    duration: 30,
    isMandatory: true,
    mandatoryFor: ["creator"],
    tags: ["best-practices", "rules", "safety", "mandatory"],
    instructor: defaultInstructor,
    learningObjectives: [
      "Understand community guidelines",
      "Learn content best practices",
      "Know prohibited content types",
      "Master safety and privacy tips",
      "Build a sustainable creator business"
    ],
    steps: [
      {
        id: "bp-welcome",
        title: "Welcome to Creating on BoyFanz",
        type: "text",
        content: `# Welcome, Creator!

## Setting You Up for Success

This training covers everything you need to know to:
- Stay safe and protected
- Follow platform rules
- Build a thriving fan base
- Maximize your earnings
- Avoid common mistakes

### The BoyFanz Creator Promise

We're committed to:
1. **Your Safety** - Tools and support to protect yourself
2. **Fair Compensation** - Industry-leading payout rates
3. **Creative Freedom** - Express yourself within guidelines
4. **Community Support** - Resources and assistance
5. **Growth Opportunities** - Features to expand your reach

### What We Ask in Return

- Follow community guidelines
- Maintain legal compliance
- Treat fans and other creators with respect
- Report violations you encounter
- Stay engaged with your audience

Let's dive into the specifics!`,
        duration: 120
      },
      {
        id: "bp-prohibited",
        title: "Prohibited Content",
        type: "text",
        content: `# Content That Is NEVER Allowed

## Zero Tolerance - Immediate Ban

### 1. Minor-Related Content
- ❌ Anyone under 18 in any content
- ❌ Age roleplay depicting minors
- ❌ Animated/drawn minor content
- ❌ "Barely legal" framing
**Action**: Immediate ban, report to authorities

### 2. Non-Consensual Content
- ❌ Revenge porn
- ❌ Hidden camera recordings
- ❌ Deepfakes without consent
- ❌ Content of sleeping/unconscious persons
**Action**: Immediate ban, potential legal action

### 3. Illegal Activities
- ❌ Bestiality
- ❌ Necrophilia
- ❌ Incest (real, not roleplay)
- ❌ Drug use or sales
- ❌ Violence or harm
**Action**: Immediate ban, report to authorities

### 4. Hate & Harassment
- ❌ Hate speech based on identity
- ❌ Doxxing or personal info exposure
- ❌ Threats of violence
- ❌ Targeted harassment campaigns
**Action**: Ban and potential legal referral

### 5. Fraud & Deception
- ❌ Impersonating others
- ❌ Selling stolen content
- ❌ Scams or financial fraud
- ❌ Misleading subscription offers
**Action**: Ban and chargebacks to you`,
        duration: 180,
        warningNote: "Violations of zero-tolerance policies result in immediate permanent bans. There are no appeals for these violations."
      },
      {
        id: "bp-allowed",
        title: "What IS Allowed",
        type: "text",
        content: `# Allowed Content (With Proper Tagging)

## You CAN Create:

### ✅ Adult Content
- Nudity and sexual content (18+ only)
- Solo and partnered content (with consent)
- Fetish content (with appropriate warnings)
- Consensual BDSM/kink content
- Fantasy roleplay (adults only, no minor themes)

### ✅ LGBTQ+ Content
- All sexual orientations welcome
- Gender expression celebrated
- Pride-positive community
- Inclusive of all adult identities

### ✅ Creative Expression
- Artistic nude photography
- Sex-positive education
- Relationship/intimacy content
- Body positive content
- Lifestyle and behind-the-scenes

## Tagging Requirements

All content must be properly tagged:
- **Category tags** (solo, partnered, etc.)
- **Content warnings** (intense, fetish, etc.)
- **CoStar tags** (if others appear)
- **Accessibility info** (when possible)

Proper tagging:
- Helps fans find what they want
- Protects fans from unwanted content
- Keeps you in compliance
- Improves your discoverability`,
        duration: 150,
        tips: [
          "When in doubt, add a content warning",
          "More specific tags = better discoverability",
          "Update tags if content is edited"
        ]
      },
      {
        id: "bp-safety",
        title: "Personal Safety & Privacy",
        type: "text",
        content: `# Protecting Yourself

## Digital Safety

### 1. Protect Your Identity
- Use a stage name if desired
- Don't share personal address
- Be careful with location metadata
- Consider a separate email for creator work

### 2. Secure Your Account
- Strong, unique password
- Enable two-factor authentication
- Don't share login credentials
- Log out on shared devices

### 3. Protect Your Content
- Enable screenshot protection (Settings)
- Watermark your content
- Monitor for unauthorized sharing
- Use our DMCA takedown tools

## Financial Safety

### 1. Payment Security
- Use secure banking details
- Verify payout information
- Monitor for suspicious activity
- Keep financial records

### 2. Tax Compliance
- You're responsible for taxes
- Keep income records
- Consider quarterly payments
- Consult a tax professional

## Emotional Safety

### 1. Set Boundaries
- Define what you will/won't do
- Communicate limits clearly
- It's okay to say no
- Block harassers immediately

### 2. Take Breaks
- Content creation can be demanding
- Schedule time off
- Separate work from personal life
- Reach out for support when needed`,
        duration: 240,
        tips: [
          "Set up 2FA immediately after this training",
          "Use a password manager for security",
          "Review your privacy settings regularly"
        ]
      },
      {
        id: "bp-engagement",
        title: "Fan Engagement Best Practices",
        type: "text",
        content: `# Building a Loyal Fan Base

## Communication Best Practices

### DO:
- ✅ Respond to messages professionally
- ✅ Set expectations for response times
- ✅ Thank fans for their support
- ✅ Ask for feedback and suggestions
- ✅ Announce schedule and content plans
- ✅ Be authentic and genuine

### DON'T:
- ❌ Make promises you can't keep
- ❌ Ignore paying subscribers
- ❌ Share fan personal information
- ❌ Engage in harassment or bullying
- ❌ Spam or mass-message excessively
- ❌ Be hostile to criticism

## Content Strategy

### Posting Frequency
- **Minimum**: 2-3 posts per week
- **Optimal**: 5-7 posts per week
- **Consistency** matters more than volume

### Content Mix
- **Free content**: Attracts new fans
- **Paid content**: Rewards subscribers
- **PPV content**: Bonus revenue
- **Live streams**: Real-time engagement
- **Stories**: Daily connection

### Pricing Strategy
- Research similar creators
- Start moderate, adjust based on demand
- Offer bundle deals
- Reward long-term subscribers`,
        duration: 200
      },
      {
        id: "bp-monetization",
        title: "Maximizing Your Earnings",
        type: "text",
        content: `# Revenue Strategies

## Multiple Income Streams

### 1. Subscriptions (Core Revenue)
- Monthly recurring income
- Build a subscriber base
- Offer tiered pricing
- Provide consistent value

### 2. Pay-Per-View (PPV)
- Premium exclusive content
- Higher pricing for special content
- Limited availability creates urgency
- Direct messages for personalization

### 3. Tips
- Enable tip buttons
- Create tip menus
- Thank tippers publicly (if they consent)
- Offer tip-based rewards

### 4. Custom Content
- Personalized requests
- Premium pricing
- Clear terms and timeline
- Require upfront payment

### 5. Live Streaming
- Tips during streams
- Paid private shows
- Ticket-based events
- Interactive engagement

## Payout Information

- **Platform fee**: Industry-competitive rates
- **Payout frequency**: Weekly/monthly options
- **Minimum payout**: Check your settings
- **Tax forms**: Required for US creators

## Revenue Tracking

- Dashboard shows all earnings
- Track by content type
- Analyze what performs best
- Adjust strategy based on data`,
        duration: 180
      },
      {
        id: "bp-quiz",
        title: "Best Practices Quiz",
        type: "quiz",
        content: "Test your knowledge of creator best practices.",
        quiz: {
          question: "Which of the following is a BEST PRACTICE for creator safety?",
          options: [
            "Share your personal address with top subscribers",
            "Use the same password everywhere for convenience",
            "Enable two-factor authentication on your account",
            "Respond to all messages within 5 minutes"
          ],
          correctAnswer: 2,
          explanation: "Enabling two-factor authentication (2FA) is a crucial security best practice that protects your account from unauthorized access, even if your password is compromised."
        },
        duration: 60
      },
      {
        id: "bp-complete",
        title: "You're Ready to Create!",
        type: "text",
        content: `# Congratulations, Creator!

## You've Completed Mandatory Training

### Your Certifications:
- ✅ 2257 Compliance Certified
- ✅ CoStar Verification Trained
- ✅ Best Practices Certified

### What's Next?

1. **Complete Your Profile**
   - Add photos and bio
   - Set your pricing
   - Configure notifications

2. **Finish Compliance Setup**
   - Upload ID verification
   - Complete 2257 forms
   - Set up CoStars (if applicable)

3. **Start Creating**
   - Post your first content
   - Engage with fans
   - Go live when ready

4. **Keep Learning**
   - Explore advanced tutorials
   - Join creator community
   - Stay updated on features

## Resources Available

- 📚 Full tutorial library
- 💬 Creator support chat
- 📧 Email: support@fanzunlimited.com
- 🌐 Creator community forums

**Welcome to BoyFanz. Let's build something amazing together!**`,
        duration: 120
      }
    ]
  }
];

// GETTING STARTED TUTORIALS
export const GETTING_STARTED_TUTORIALS: Tutorial[] = [
  {
    id: "gs-account-setup",
    title: "Setting Up Your Creator Account",
    slug: "account-setup",
    description: "Complete guide to setting up your BoyFanz creator profile for success.",
    category: "Getting Started",
    categorySlug: "getting-started",
    difficulty: "beginner",
    duration: 15,
    tags: ["setup", "profile", "getting-started"],
    instructor: defaultInstructor,
    learningObjectives: [
      "Complete your profile setup",
      "Configure your settings",
      "Understand the dashboard",
      "Set up payment information"
    ],
    steps: [
      {
        id: "account-profile",
        title: "Creating Your Profile",
        type: "interactive",
        content: `# Your Creator Profile

Your profile is your storefront. Let's make it stand out!

## Profile Elements

### 1. Profile Photo
- High-quality, clear image
- Shows your face (if comfortable)
- Or a branded logo/avatar
- Minimum 400x400 pixels

### 2. Cover Image
- Eye-catching banner
- Represents your brand
- 1500x500 pixels recommended
- Can include text/branding

### 3. Display Name
- Your creator name/brand
- Easy to remember
- Professional presentation

### 4. Bio
- Who you are
- What content you create
- Why fans should subscribe
- Keep it engaging!

### 5. Links
- Social media profiles
- Personal website
- Other platforms

**Let's go set up your profile!**`,
        interactiveElement: {
          type: "navigation",
          target: "/settings",
          instruction: "Click to go to your Settings page and update your profile"
        },
        duration: 300
      },
      {
        id: "account-dashboard",
        title: "Understanding Your Dashboard",
        type: "interactive",
        content: `# The Creator Dashboard

## Your Command Center

The dashboard shows you everything at a glance:

### Key Metrics
- **Subscribers**: Current subscriber count
- **Earnings**: Today/week/month
- **Views**: Content performance
- **Engagement**: Likes, comments, tips

### Quick Actions
- Create new post
- Go live
- View messages
- Check notifications

### Navigation
- Sidebar: Main menu
- Header: Quick access & search
- Content area: Main features

**Let's explore the dashboard together!**`,
        interactiveElement: {
          type: "navigation",
          target: "/dashboard",
          instruction: "Click to visit your Dashboard and explore the features"
        },
        duration: 180
      },
      {
        id: "account-payment",
        title: "Setting Up Payments",
        type: "interactive",
        content: `# Getting Paid

## Payment Setup

### Step 1: Add Bank Information
- Bank account for payouts
- Or payment service (if available)
- Verify your details

### Step 2: Tax Information
- Required for payouts over $600/year (US)
- W-9 or W-8BEN form
- International creators: check requirements

### Step 3: Payout Preferences
- Frequency: weekly or monthly
- Minimum amount threshold
- Preferred method

### Step 4: Pricing
- Set subscription price
- Configure PPV pricing
- Tip amounts

**Complete your payment setup now:**`,
        interactiveElement: {
          type: "navigation",
          target: "/payouts",
          instruction: "Go to Payouts to set up your payment information"
        },
        duration: 240
      }
    ]
  },
  {
    id: "gs-first-post",
    title: "Creating Your First Post",
    slug: "first-post",
    description: "Step-by-step guide to creating and publishing your first content on BoyFanz.",
    category: "Getting Started",
    categorySlug: "getting-started",
    difficulty: "beginner",
    duration: 10,
    tags: ["posting", "content", "getting-started"],
    instructor: defaultInstructor,
    learningObjectives: [
      "Create different types of posts",
      "Add media to your posts",
      "Set pricing for content",
      "Schedule content"
    ],
    steps: [
      {
        id: "first-post-types",
        title: "Types of Posts",
        type: "text",
        content: `# Content Types on BoyFanz

## Post Types

### 1. Free Posts
- Visible to everyone
- Attracts new subscribers
- Teasers and previews
- Announcements

### 2. Subscriber-Only Posts
- Visible to paying subscribers
- Your main content
- Photos, videos, text
- Included in subscription

### 3. PPV (Pay-Per-View)
- Extra payment required
- Premium exclusive content
- Higher pricing
- Can be locked or unlocked

### 4. Polls
- Engage your audience
- Get feedback
- Interactive content
- Multiple choice options

### 5. Stories
- Temporary content (24h)
- Behind the scenes
- Quick updates
- Casual engagement`,
        duration: 120
      },
      {
        id: "first-post-create",
        title: "Creating Your First Post",
        type: "interactive",
        content: `# Let's Create a Post!

## Step-by-Step

### 1. Go to Feed or Dashboard
Click the "Create Post" button

### 2. Add Your Content
- Write your caption
- Upload photos/videos
- Add tags and categories

### 3. Set Visibility
- Free for everyone
- Subscribers only
- PPV (set price)

### 4. Add Extras (Optional)
- Location tag
- Schedule for later
- Add poll

### 5. Publish!
Review and hit "Post"

**Try creating a post now:**`,
        interactiveElement: {
          type: "navigation",
          target: "/social",
          instruction: "Go to your feed to create your first post"
        },
        duration: 180
      }
    ]
  }
];

// CONTENT CREATION TUTORIALS
export const CONTENT_CREATION_TUTORIALS: Tutorial[] = [
  {
    id: "cc-photo-tips",
    title: "Taking Great Photos",
    slug: "photo-tips",
    description: "Professional tips for capturing high-quality photos that attract and retain subscribers.",
    category: "Content Creation",
    categorySlug: "content-creation",
    difficulty: "beginner",
    duration: 20,
    tags: ["photography", "tips", "quality"],
    instructor: defaultInstructor,
    learningObjectives: [
      "Understand lighting basics",
      "Master composition techniques",
      "Edit photos effectively",
      "Optimize for different devices"
    ],
    steps: [
      {
        id: "photo-lighting",
        title: "Lighting Fundamentals",
        type: "text",
        content: `# Lighting Makes Everything

## The #1 Factor in Photo Quality

### Natural Light
- **Best times**: Golden hour (sunrise/sunset)
- **Position**: Face the window, not away
- **Avoid**: Direct midday sun (harsh shadows)
- **Diffuse**: Sheer curtains soften light

### Artificial Light
- **Ring lights**: Even, flattering light
- **Softboxes**: Professional look
- **LED panels**: Adjustable color temperature
- **Avoid**: Overhead ceiling lights alone

### Tips
- Light should hit your face/body evenly
- Avoid mixed light sources (warm + cool)
- Test different setups
- Consistency is key for branding`,
        duration: 180
      },
      {
        id: "photo-composition",
        title: "Composition & Posing",
        type: "text",
        content: `# Composition Rules

## Rule of Thirds
- Divide frame into 3x3 grid
- Place subjects on grid lines
- Creates visual interest

## Angles
- **High angle**: Slimming effect
- **Low angle**: Powerful, dominant
- **Eye level**: Natural, approachable
- **Side angle**: Shows depth

## Posing Tips
- Elongate your body
- Create angles with limbs
- Engage with camera
- Relax your face
- Practice makes perfect

## Background
- Clean, uncluttered
- Complements your content
- Consistent for branding
- Check for distractions`,
        duration: 180,
        tips: [
          "Take many shots, pick the best",
          "Use a tripod or phone mount",
          "Self-timer + remote is your friend"
        ]
      }
    ]
  },
  {
    id: "cc-video-basics",
    title: "Video Content Fundamentals",
    slug: "video-basics",
    description: "Essential techniques for creating engaging video content.",
    category: "Content Creation",
    categorySlug: "content-creation",
    difficulty: "intermediate",
    duration: 25,
    tags: ["video", "editing", "production"],
    instructor: defaultInstructor,
    learningObjectives: [
      "Set up for video recording",
      "Capture quality audio",
      "Basic editing techniques",
      "Export for optimal quality"
    ],
    steps: [
      {
        id: "video-setup",
        title: "Video Setup",
        type: "text",
        content: `# Setting Up for Video

## Equipment Basics

### Camera Options
- **Smartphone**: Modern phones are great
- **Webcam**: HD webcams work well
- **DSLR/Mirrorless**: Best quality
- **Start simple**, upgrade as you earn

### Stabilization
- **Tripod**: Essential investment
- **Phone mount**: For smartphone use
- **Gimbal**: For movement shots
- **DIY options**: Books, stands work!

### Audio
- **Quiet environment** is most important
- **External mic** improves quality dramatically
- **Lavalier mic**: Great for speaking
- **USB mic**: Good for stationary content

### Settings
- **Resolution**: 1080p minimum, 4K if possible
- **Frame rate**: 30fps standard, 60fps for smoothness
- **Orientation**: Landscape for videos, portrait for Stories`,
        duration: 200
      }
    ]
  }
];

// MONETIZATION TUTORIALS
export const MONETIZATION_TUTORIALS: Tutorial[] = [
  {
    id: "mon-pricing",
    title: "Pricing Your Content",
    slug: "pricing-strategy",
    description: "Learn how to price your subscriptions and content for maximum earnings.",
    category: "Monetization",
    categorySlug: "monetization",
    difficulty: "intermediate",
    duration: 15,
    tags: ["pricing", "subscriptions", "ppv", "strategy"],
    instructor: defaultInstructor,
    learningObjectives: [
      "Research competitor pricing",
      "Set subscription tiers",
      "Price PPV content effectively",
      "Optimize for conversions"
    ],
    steps: [
      {
        id: "pricing-research",
        title: "Researching the Market",
        type: "text",
        content: `# Know Your Market

## Research Competitors

### Find Similar Creators
- Same niche/category
- Similar content style
- Comparable following size

### What to Note
- Subscription prices
- PPV pricing ranges
- Posting frequency
- Engagement levels

### Price Ranges (General)
- **New creators**: $5-15/month
- **Established**: $15-30/month
- **Top creators**: $30-50+/month

### PPV Pricing
- **Photos**: $5-25
- **Short videos**: $10-50
- **Long/premium**: $25-100+
- **Custom content**: $50-500+

## Your Value Proposition

What makes YOUR content worth paying for?
- Unique content style
- Personal connection
- Exclusive access
- Quality and consistency`,
        duration: 180
      }
    ]
  },
  {
    id: "mon-tips-custom",
    title: "Tips & Custom Requests",
    slug: "tips-custom-requests",
    description: "Maximize earnings through tips and custom content.",
    category: "Monetization",
    categorySlug: "monetization",
    difficulty: "intermediate",
    duration: 20,
    tags: ["tips", "custom", "earnings"],
    instructor: defaultInstructor,
    learningObjectives: [
      "Set up tip menus",
      "Handle custom requests",
      "Price custom work",
      "Manage expectations"
    ],
    steps: [
      {
        id: "tips-setup",
        title: "Creating a Tip Menu",
        type: "interactive",
        content: `# Tip Menus Drive Revenue

## What is a Tip Menu?

A tip menu is a list of things fans can request or unlock by tipping specific amounts.

### Example Tip Menu:
- $5 - Personal thank you message
- $10 - Reaction video to your message
- $25 - Photo of your choice
- $50 - 5-minute custom video
- $100 - 30-minute video call

### Creating Your Menu

1. List what you're willing to offer
2. Price based on effort/time
3. Be specific about what's included
4. Post as a pinned message or bio

### Best Practices
- Keep it simple (5-10 items)
- Range of price points
- Clear descriptions
- Update regularly

**Set up your custom requests:**`,
        interactiveElement: {
          type: "navigation",
          target: "/custom-requests",
          instruction: "Go to Custom Requests to set up your offerings"
        },
        duration: 200
      }
    ]
  }
];

// LIVE STREAMING TUTORIALS
export const LIVE_STREAMING_TUTORIALS: Tutorial[] = [
  {
    id: "live-basics",
    title: "Going Live: The Complete Guide",
    slug: "going-live-guide",
    description: "Everything you need to know about live streaming on BoyFanz.",
    category: "Live Streaming",
    categorySlug: "live-streaming",
    difficulty: "intermediate",
    duration: 25,
    tags: ["live", "streaming", "broadcast"],
    instructor: defaultInstructor,
    learningObjectives: [
      "Set up for live streaming",
      "Engage viewers in real-time",
      "Handle tips and requests",
      "Moderate your chat"
    ],
    steps: [
      {
        id: "live-setup",
        title: "Technical Setup",
        type: "interactive",
        content: `# Preparing to Go Live

## Before You Start

### Equipment Check
- ✅ Camera working
- ✅ Microphone tested
- ✅ Good lighting
- ✅ Stable internet (upload speed matters!)
- ✅ Background appropriate

### Internet Requirements
- **Minimum**: 5 Mbps upload
- **Recommended**: 10+ Mbps upload
- **Test your speed** before going live
- **Wired connection** beats WiFi

### Room Preparation
- Clean, appropriate background
- Good lighting on your face
- Minimize background noise
- Phone on silent

### Account Ready
- Profile complete
- Stream title prepared
- Tags selected
- Tip menu ready

**Go to Stream Creation:**`,
        interactiveElement: {
          type: "navigation",
          target: "/streams/create",
          instruction: "Visit Stream Creation to set up your first live stream"
        },
        duration: 200
      }
    ]
  }
];

// PRIVACY & SECURITY TUTORIALS
export const PRIVACY_SECURITY_TUTORIALS: Tutorial[] = [
  {
    id: "sec-account",
    title: "Securing Your Account",
    slug: "account-security",
    description: "Protect your account from unauthorized access and threats.",
    category: "Privacy & Security",
    categorySlug: "privacy-security",
    difficulty: "beginner",
    duration: 15,
    tags: ["security", "password", "2fa"],
    instructor: defaultInstructor,
    learningObjectives: [
      "Create strong passwords",
      "Enable two-factor authentication",
      "Recognize phishing attempts",
      "Monitor account activity"
    ],
    steps: [
      {
        id: "sec-2fa",
        title: "Enable Two-Factor Authentication",
        type: "interactive",
        content: `# Two-Factor Authentication (2FA)

## Why 2FA is Essential

Even if someone gets your password, they can't access your account without the second factor.

### Types of 2FA
- **Authenticator app** (recommended)
- **SMS codes** (less secure but better than nothing)
- **Email codes**

### How to Enable

1. Go to Settings → Security
2. Click "Enable 2FA"
3. Scan QR code with authenticator app
4. Enter verification code
5. Save backup codes!

### Backup Codes
- Store in a safe place
- Use if you lose your phone
- Generate new ones periodically

**Enable 2FA now:**`,
        interactiveElement: {
          type: "navigation",
          target: "/settings/password",
          instruction: "Go to Security Settings to enable 2FA"
        },
        duration: 180
      }
    ]
  },
  {
    id: "sec-privacy",
    title: "Privacy Settings Deep Dive",
    slug: "privacy-settings",
    description: "Configure all privacy options to protect your identity and content.",
    category: "Privacy & Security",
    categorySlug: "privacy-security",
    difficulty: "intermediate",
    duration: 20,
    tags: ["privacy", "settings", "protection"],
    instructor: defaultInstructor,
    learningObjectives: [
      "Configure visibility settings",
      "Block and restrict users",
      "Manage location privacy",
      "Control content access"
    ],
    steps: [
      {
        id: "privacy-settings",
        title: "Privacy Configuration",
        type: "interactive",
        content: `# Privacy Settings

## Profile Privacy

### Visibility Options
- **Public**: Anyone can see profile
- **Subscribers only**: Just for paying fans
- **Private**: Hidden from search

### Block by Location
- Block specific countries/regions
- Useful if you have privacy concerns
- Can also block specific states

### User Blocking
- Block specific users
- They can't see your content
- They can't message you
- They don't know they're blocked

**Configure your privacy:**`,
        interactiveElement: {
          type: "navigation",
          target: "/settings/privacy",
          instruction: "Go to Privacy Settings to configure your options"
        },
        duration: 200
      }
    ]
  }
];

// FAN ENGAGEMENT TUTORIALS
export const FAN_ENGAGEMENT_TUTORIALS: Tutorial[] = [
  {
    id: "fan-building-audience",
    title: "Building Your Audience",
    slug: "building-audience",
    description: "Learn proven strategies to grow your fanbase and keep subscribers engaged.",
    category: "Fan Engagement",
    categorySlug: "fan-engagement",
    difficulty: "intermediate",
    duration: 25,
    tags: ["audience", "growth", "engagement", "retention"],
    instructor: defaultInstructor,
    learningObjectives: [
      "Develop a content strategy that attracts subscribers",
      "Master fan communication techniques",
      "Increase subscriber retention rates",
      "Use analytics to optimize your approach"
    ],
    steps: [
      {
        id: "audience-strategy",
        title: "Understanding Your Audience",
        type: "text",
        content: `# Know Your Fans

## Who Are Your Subscribers?

Understanding your audience is the first step to growing it.

### Key Questions to Ask:
- What type of content do they engage with most?
- When are they most active?
- What keeps them subscribed?
- What would make them leave?

### Finding Your Niche

**The riches are in the niches:**
- General content has more competition
- Specific niches attract dedicated fans
- Find what makes YOU unique
- Double down on what works

### Audience Personas

Create mental profiles of your ideal fans:
- **The Lurker**: Views but rarely interacts
- **The Engager**: Likes, comments, tips regularly
- **The Superfan**: Buys everything, always supportive
- **The Casual**: Comes and goes, price-sensitive

### Your Value Proposition

Answer: "Why should someone subscribe to ME?"
- Unique content style?
- Personal connection?
- Quality and consistency?
- Exclusive access?
- Personality and entertainment?`,
        duration: 180,
        tips: [
          "Survey your existing fans to learn what they want",
          "Look at your analytics for patterns",
          "Don't try to please everyone - focus on your ideal fan"
        ]
      },
      {
        id: "audience-content-strategy",
        title: "Content Strategy for Growth",
        type: "text",
        content: `# Content That Converts

## The Content Funnel

### Free Content (Attracts New Fans)
- Post teasers on your feed
- Use hashtags strategically
- Share on other platforms
- Engage in community spaces

### Subscriber Content (Converts & Retains)
- Consistent quality and frequency
- Mix of content types
- Personal and authentic
- Rewards loyalty

### Premium/PPV (Monetizes Superfans)
- Exclusive experiences
- Higher production value
- Limited availability
- Special requests

## Posting Schedule

### Consistency is King
- **Daily**: Stories, quick updates
- **3-5x/week**: Main posts
- **Weekly**: Live streams
- **Monthly**: Premium drops

### Best Times to Post
- Test and learn YOUR audience
- Generally: evenings and weekends
- Announce schedules so fans know when to expect content

## Content Mix

**The 70-20-10 Rule:**
- 70% your core content type
- 20% experimental/variety
- 10% personal/behind-the-scenes`,
        duration: 200,
        tips: [
          "Create a content calendar to stay organized",
          "Batch create content to maintain consistency",
          "Repurpose content across different formats"
        ]
      },
      {
        id: "audience-communication",
        title: "Mastering Fan Communication",
        type: "text",
        content: `# Building Relationships

## Message Best Practices

### Responding to Messages
- **Speed matters**: Reply within 24 hours
- **Personal touch**: Use their name
- **Be genuine**: Don't copy-paste everything
- **Set boundaries**: It's okay to have limits

### Mass Messages vs. Personal

**Mass Messages:**
- Announcements
- New content alerts
- Promotions and offers
- Keep them engaging, not spammy

**Personal Messages:**
- Thank new subscribers
- Respond to questions
- Build relationships
- Upsell thoughtfully

## Engagement Tactics

### Show Appreciation
- Thank tippers publicly (if they consent)
- Recognize loyal subscribers
- Birthday/anniversary messages
- Exclusive perks for long-term fans

### Create Community
- Reply to comments
- Ask questions in posts
- Run polls for feedback
- Make fans feel heard

### Handle Negativity
- Don't engage with trolls
- Block when necessary
- Take breaks if needed
- Focus on positive fans`,
        duration: 180
      },
      {
        id: "audience-retention",
        title: "Subscriber Retention Strategies",
        type: "text",
        content: `# Keeping Fans Subscribed

## Why Subscribers Leave

### Common Reasons:
1. **Content inconsistency** - Not posting enough
2. **Value mismatch** - Not what they expected
3. **No connection** - Feel like just a number
4. **Price concerns** - Can't afford or don't see value
5. **Found alternatives** - Competitor content

### Prevention Strategies

## Onboarding New Subscribers

**First 7 Days Are Critical:**
- Welcome message within 24 hours
- Highlight your best content
- Explain what to expect
- Invite them to engage

## Regular Value Delivery

**Exceed Expectations:**
- Post more than promised
- Surprise bonus content
- Exclusive subscriber perks
- Early access to new content

## Re-engagement Campaigns

**Win Back Lapsing Subscribers:**
- Notice when engagement drops
- Send personalized messages
- Offer incentives to stay
- Ask for feedback

## Loyalty Rewards

**Reward Long-Term Fans:**
- Subscriber milestones
- Exclusive content for 3+ month subs
- Discounts for annual subscriptions
- VIP access and recognition`,
        duration: 180,
        tips: [
          "Track your churn rate and work to reduce it",
          "The cost of keeping a fan is less than acquiring a new one",
          "Ask departing subscribers why they're leaving"
        ]
      },
      {
        id: "audience-analytics",
        title: "Using Analytics for Growth",
        type: "interactive",
        content: `# Data-Driven Growth

## Key Metrics to Track

### Subscriber Metrics
- **Total subscribers**: Your core audience
- **New subscribers**: Growth rate
- **Churned subscribers**: Retention issues
- **Subscriber lifetime**: How long they stay

### Content Metrics
- **Views**: Who's seeing your content
- **Likes**: What resonates
- **Comments**: What sparks conversation
- **Shares**: What's worth spreading

### Revenue Metrics
- **Total earnings**: The big picture
- **Per-subscriber revenue**: Average value
- **Top content**: What makes money
- **Revenue sources**: Subs vs tips vs PPV

## Analyzing Your Data

### What to Look For:
- **Trends**: Going up or down?
- **Patterns**: What day/time works best?
- **Outliers**: What performed unusually well/poorly?
- **Correlations**: What actions drive results?

### Taking Action

**Data → Insights → Action:**
1. Review weekly/monthly
2. Identify what's working
3. Do more of that
4. Test new approaches
5. Measure and repeat

**Check your analytics:**`,
        interactiveElement: {
          type: "navigation",
          target: "/analytics",
          instruction: "Go to your Analytics dashboard to review your metrics"
        },
        duration: 200
      },
      {
        id: "audience-growth-tactics",
        title: "Growth Tactics & Promotion",
        type: "text",
        content: `# Accelerating Your Growth

## Cross-Promotion Strategies

### Social Media
- **Twitter/X**: Great for adult creators
- **Instagram**: Teasers (keep it SFW)
- **TikTok**: Personality and trends
- **Reddit**: Niche communities

### Cross-Promotion Tips:
- Link to your BoyFanz in bio
- Tease content, don't give it all away
- Follow platform rules (SFW content on SFW platforms)
- Engage authentically in communities

## Collaborations

### Working with Other Creators
- Cross-promote to each other's audiences
- Create content together
- Shoutout exchanges
- Joint live streams

### Finding Collab Partners
- Similar audience size
- Complementary content style
- Professional and reliable
- Use CoStar for verification!

## Promotions & Incentives

### Limited-Time Offers
- Discount subscription periods
- Free trials (use carefully)
- Bundle deals
- Holiday specials

### Referral Programs
- Reward fans who bring new subscribers
- Unique referral links
- Track conversions
- Thank referrers publicly

## Building Your Brand

### Consistency Across Platforms
- Same username/handle
- Recognizable visual style
- Consistent personality
- Clear value proposition

### Professional Growth
- Treat it like a business
- Reinvest in quality
- Learn from top creators
- Network and collaborate`,
        duration: 200,
        tips: [
          "Don't spread yourself too thin - master one platform at a time",
          "Quality over quantity in promotion",
          "Building a brand takes time - be patient and consistent"
        ]
      },
      {
        id: "audience-quiz",
        title: "Fan Engagement Quiz",
        type: "quiz",
        content: "Test your understanding of fan engagement strategies.",
        quiz: {
          question: "What is the MOST important factor in subscriber retention?",
          options: [
            "Posting the most content possible",
            "Having the lowest subscription price",
            "Consistent value delivery and personal connection",
            "Only responding to top tippers"
          ],
          correctAnswer: 2,
          explanation: "While quantity and price matter, consistent value delivery combined with genuine personal connections is what keeps subscribers long-term. Fans stay when they feel valued and consistently receive content worth their investment."
        },
        duration: 60
      },
      {
        id: "audience-complete",
        title: "You're Ready to Grow!",
        type: "text",
        content: `# Congratulations!

## You've Completed Fan Engagement Training

### Key Takeaways:

✅ **Know your audience** - Understand who your fans are and what they want

✅ **Content strategy** - Plan your content for consistency and variety

✅ **Communication** - Build real relationships with your subscribers

✅ **Retention first** - Keeping fans is cheaper than getting new ones

✅ **Use data** - Let analytics guide your decisions

✅ **Promote smartly** - Grow through collaboration and cross-promotion

## Your Next Steps:

1. **Review your analytics** - Understand where you are now
2. **Create a content calendar** - Plan your next month
3. **Set up welcome messages** - Onboard new subscribers well
4. **Identify collaboration opportunities** - Reach out to other creators
5. **Track your progress** - Measure and improve

## Remember:

Growing an audience takes time. Be patient, be consistent, and focus on providing real value to your fans. The creators who succeed long-term are those who genuinely care about their community.

**Now go build your empire!**`,
        duration: 120
      }
    ]
  },
  {
    id: "fan-messaging-mastery",
    title: "Messaging & DM Mastery",
    slug: "messaging-mastery",
    description: "Master the art of fan communication through direct messages.",
    category: "Fan Engagement",
    categorySlug: "fan-engagement",
    difficulty: "intermediate",
    duration: 20,
    tags: ["messaging", "dm", "communication", "sales"],
    instructor: defaultInstructor,
    learningObjectives: [
      "Write engaging opening messages",
      "Convert conversations to sales",
      "Handle difficult conversations",
      "Use mass messaging effectively"
    ],
    steps: [
      {
        id: "messaging-basics",
        title: "DM Fundamentals",
        type: "text",
        content: `# The Power of Direct Messages

## Why DMs Matter

Direct messages are where relationships and sales happen:
- Personal connection with fans
- Custom content requests
- Tips and additional sales
- Building superfan loyalty

### Message Types

**Welcome Messages:**
- Greet new subscribers
- Set expectations
- Highlight content
- Invite engagement

**Promotional Messages:**
- New content announcements
- Sales and discounts
- PPV offerings
- Mass message campaigns

**Personal Messages:**
- Responding to fans
- Custom requests
- Relationship building
- Problem solving

## Writing Effective Messages

### Be Personal
- Use their username/name
- Reference specific interactions
- Show you remember them
- Make them feel special

### Be Clear
- State your purpose
- Include calls-to-action
- Make it easy to respond
- Don't be too lengthy

### Be Genuine
- Don't sound robotic
- Show your personality
- Match their energy
- Be yourself`,
        duration: 180
      },
      {
        id: "messaging-sales",
        title: "Converting Messages to Sales",
        type: "text",
        content: `# Selling Through Messages

## The Sales Conversation

### Building Interest
1. **Open warmly** - Genuine greeting
2. **Provide value** - Share something free
3. **Build curiosity** - Tease exclusive content
4. **Present offer** - Clear value proposition
5. **Call to action** - Easy purchase path

### PPV Messaging Strategy

**Effective PPV Messages:**
- Eye-catching preview (SFW teaser)
- Clear description of content
- Reasonable pricing
- Easy unlock process

**Example:**
"Hey [name]! Just dropped something special I think you'll love 🔥 It's a 10-min [description]. Unlock to see the full thing! 💕"

### Handling Objections

**"Too expensive"**
- Explain the value
- Offer alternatives
- Suggest bundles
- Move on gracefully

**"Not interested"**
- Thank them
- Ask what they'd prefer
- No pressure
- Stay friendly

### Timing Matters
- Don't spam
- Space out promotional messages
- Mix with genuine engagement
- Read the room`,
        duration: 180
      },
      {
        id: "messaging-mass",
        title: "Mass Messaging Best Practices",
        type: "interactive",
        content: `# Mass Messages That Work

## When to Use Mass Messages

### Good Uses:
- New content announcements
- Limited-time offers
- Important updates
- Appreciation messages
- Special events

### Avoid:
- Daily promotions (spam)
- Low-value messages
- Repeated sends
- Irrelevant content

## Crafting Mass Messages

### Elements of a Great Mass Message:

1. **Hook**: Grab attention immediately
2. **Value**: What's in it for them
3. **Scarcity**: Limited time/availability
4. **CTA**: Clear next step

### Personalization at Scale
- Use name tokens when available
- Segment your audience
- A/B test messages
- Track performance

### Frequency Guidelines
- **Maximum**: 1-2 per day
- **Optimal**: 3-5 per week
- **Minimum**: Weekly updates

**Set up mass messaging:**`,
        interactiveElement: {
          type: "navigation",
          target: "/mass-messaging",
          instruction: "Go to Mass Messaging to create your first campaign"
        },
        duration: 180
      }
    ]
  }
];

// Export all tutorials
export const ALL_TUTORIALS: Tutorial[] = [
  ...MANDATORY_TUTORIALS,
  ...GETTING_STARTED_TUTORIALS,
  ...CONTENT_CREATION_TUTORIALS,
  ...MONETIZATION_TUTORIALS,
  ...FAN_ENGAGEMENT_TUTORIALS,
  ...LIVE_STREAMING_TUTORIALS,
  ...PRIVACY_SECURITY_TUTORIALS
];

// Helper to get tutorial by slug
export function getTutorialBySlug(slug: string): Tutorial | undefined {
  return ALL_TUTORIALS.find(t => t.slug === slug);
}

// Helper to get tutorials by category
export function getTutorialsByCategory(categorySlug: string): Tutorial[] {
  return ALL_TUTORIALS.filter(t => t.categorySlug === categorySlug);
}

// Helper to get mandatory tutorials
export function getMandatoryTutorials(userType: 'creator' | 'fan'): Tutorial[] {
  return ALL_TUTORIALS.filter(t =>
    t.isMandatory && t.mandatoryFor?.includes(userType)
  );
}

// Calculate total duration of tutorials
export function getTotalDuration(tutorials: Tutorial[]): number {
  return tutorials.reduce((sum, t) => sum + t.duration, 0);
}
