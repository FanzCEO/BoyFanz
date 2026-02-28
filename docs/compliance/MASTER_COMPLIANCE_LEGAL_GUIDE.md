# FANZ MASTER COMPLIANCE & LEGAL GUIDE

**Created:** 2026-02-04
**Last Updated:** 2026-02-04
**Version:** 1.0
**Classification:** INTERNAL - LEGAL REFERENCE

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Recent Industry Litigation](#recent-industry-litigation)
3. [U.S. Federal Laws](#us-federal-laws)
4. [U.S. State Laws](#us-state-laws)
5. [International Regulations](#international-regulations)
6. [Payment Processor Requirements](#payment-processor-requirements)
7. [Content Moderation Requirements](#content-moderation-requirements)
8. [Privacy & Data Protection](#privacy--data-protection)
9. [Intellectual Property](#intellectual-property)
10. [Tax & Financial Compliance](#tax--financial-compliance)
11. [FANZ Compliance Checklist](#fanz-compliance-checklist)
12. [Implementation Priority Matrix](#implementation-priority-matrix)

---

## EXECUTIVE SUMMARY

This document provides a comprehensive overview of all legal and compliance requirements affecting adult content creator platforms. FANZ must implement policies and technical controls to address each area to minimize legal liability and protect creators and subscribers.

### Critical Risk Areas (Immediate Action Required)

| Risk Area | Severity | Status |
|-----------|----------|--------|
| Age Verification (State Laws) | CRITICAL | Implement |
| Paywall Transparency | HIGH | Implemented ✓ |
| 2257 Record Keeping | CRITICAL | Review |
| NCMEC Reporting | CRITICAL | Implement |
| Content Consent Verification | HIGH | Implement |
| Payment Processor Compliance | HIGH | Review |

---

## RECENT INDUSTRY LITIGATION

### OnlyFans Class Action Lawsuits (2024-2025)

#### 1. "Bait-and-Switch" Lawsuit (January 2025)
**Case:** Gardner v. Fenix Internet LLC (California)
**Allegations:**
- Platform misled subscribers by promising "full access" while placing content behind additional paywalls
- Millions of subscribers bought subscriptions only to find exclusive content inaccessible
- Subscribers met with teaser posts and repeated prompts to pay extra

**Legal Claims:**
- Violations of California's Consumers' Legal Remedies Act
- Section 5 of the Federal Trade Commission Act (deceptive practices)

**FANZ Action:** ✅ Paywall Compliance System implemented to prevent similar issues

Sources: [Hagens Berman](https://www.hbsslaw.com/cases/onlyfans-chatters), [Complex](https://www.complex.com/life/a/bernadette-giacomazzo/onlyfans-class-action-bait-and-switch)

#### 2. "Chatters" Impersonation Lawsuit (August 2024)
**Allegations:**
- Subscribers unknowingly communicate with paid chatters, not actual creators
- Platform allegedly knew this violated its own rules but failed to enforce

**FANZ Action Required:** Implement strict anti-chatter policies, require creator verification for messages

Source: [ClassAction.org](https://www.classaction.org/news/onlyfans-lawsuit-alleges-subscribers-unknowingly-talk-with-paid-chatters-not-actual-content-creators)

#### 3. Auto-Renewal Lawsuit (June 2025)
**Allegations:**
- Platform obscures automatic renewal terms
- Subscribers charged without knowledge or consent

**FANZ Action Required:** Clear auto-renewal disclosures, easy cancellation process

Source: [TopClassActions](https://topclassactions.com/lawsuit-settlements/lawsuit-news/onlyfans-class-action-claims-company-fails-to-disclose-automatic-renewal-terms/)

### Pornhub/MindGeek/Aylo Litigation (2023-2025)

#### FTC Settlement (September 2025)
- Operators charged with doing little to block tens of thousands of CSAM videos
- Audit revealed "tens of thousands of CSAM and NCM videos and photos"
- Settlement with FTC and State of Utah

#### GirlsDoPorn Settlement (December 2023)
- Aylo paid $1.845 million criminal fine
- DOJ assigned monitor for 3-year compliance period
- 70% of audited uploaders failed to provide proof of consent

**Key Findings:**
- Employees admitted content moderation protocols not taken "seriously"
- Banned users could create new accounts with different credentials
- Section 230 immunity rejected as defense

**FANZ Action Required:**
- Robust content moderation
- Consent verification for all uploaded content
- No re-registration after bans
- Regular compliance audits

Sources: [FTC](https://www.ftc.gov/legal-library/browse/cases-proceedings/pornhubmindgeekaylo), [Variety](https://variety.com/2023/digital/news/pornhub-aylo-profit-sex-trafficking-fine-1235849412/)

---

## U.S. FEDERAL LAWS

### 1. 18 U.S.C. § 2257 - Record Keeping Requirements

**Purpose:** Protect children from sexual exploitation

**Requirements:**
- Verify age and identity of all performers (18+ required)
- Maintain records of government-issued ID for all depicted individuals
- Retain records for 7 years (5 years after business closure)
- Index and cross-reference records by performer name
- Display 2257 compliance statement on every page with explicit content
- Allow inspection by Attorney General without advance notice

**Statement Format:**
```
18 U.S.C. 2257 Record-Keeping Requirements Compliance Statement
Records required to be maintained pursuant to 18 U.S.C. 2257 are kept by the custodian of records at:
[Business Name]
[Address]
```

**Penalties:** Criminal charges, fines, imprisonment

Source: [Cornell Law](https://www.law.cornell.edu/uscode/text/18/2257), [DOJ](https://www.justice.gov/criminal/criminal-ceos/18-usc-2257-2257a-certifications)

### 2. 18 U.S.C. § 2258A - NCMEC Reporting Requirements (REPORT Act 2024)

**Requirements:**
- Report to CyberTipline when aware of:
  - Child sexual abuse material (CSAM)
  - Online enticement of children
  - Child sex trafficking
- Retain data for 1 year (extended from 90 days)
- Cooperate with law enforcement

**Penalties:** Up to $1 million per violation for failure to report

**Implementation:**
- Integrate PhotoDNA or similar hash-matching technology
- Establish 24/7 reporting capability
- Train staff on identification and reporting

Sources: [Cornell Law](https://www.law.cornell.edu/uscode/text/18/2258A), [NCMEC](https://www.missingkids.org/gethelpnow/cybertipline/cybertiplinedata)

### 3. FOSTA-SESTA (2018)

**Impact:** Removes Section 230 immunity for sex trafficking

**Requirements:**
- Cannot knowingly facilitate prostitution or sex trafficking
- Must actively moderate content
- Must cooperate with law enforcement

**Penalties:** Up to 10 years imprisonment, substantial fines

**FANZ Action:**
- Implement robust content moderation
- Clear Terms of Service prohibiting illegal activity
- Rapid response to law enforcement requests

Sources: [Wikipedia](https://en.wikipedia.org/wiki/FOSTA-SESTA), [Columbia HRL](https://hrlr.law.columbia.edu/files/2021/04/1084_Albert.pdf)

### 4. TAKE IT DOWN Act (May 2025)

**Requirements:**
- Federal crime to knowingly publish non-consensual intimate images
- Includes AI-generated deepfakes ("digital forgeries")
- Platforms must remove content within 48 hours of victim request
- Must make efforts to delete copies

**Implementation Deadline:** May 2026 for notice-and-removal systems

**FANZ Action:**
- Implement 48-hour takedown process for NCII
- Create victim reporting portal
- Track and remove copies/reposts

Sources: [Congress.gov](https://www.congress.gov/crs-product/LSB11314), [Wikipedia](https://en.wikipedia.org/wiki/TAKE_IT_DOWN_Act)

### 5. COPPA (Children's Online Privacy Protection Act)

**Requirements:**
- Applies to collection of data from children under 13
- Must have neutral age gate
- Cannot collect personal information from children without parental consent
- Cannot target advertising to children

**2025 Updates:**
- Stricter biometric data rules
- Enhanced third-party disclosure requirements
- Penalties up to $50,120+ per violation

**FANZ Action:** Age gates must be 18+ and neutral (no default age)

Sources: [FTC](https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa)

### 6. DMCA (Digital Millennium Copyright Act)

**Safe Harbor Requirements:**
- Designate DMCA agent and register with Copyright Office
- Implement notice-and-takedown process
- Remove infringing content upon valid notice
- Provide counter-notice process (10-14 day waiting period)

**FANZ Implementation:**
- DMCA agent designation: admin@fanzunlimited.com
- Takedown request form on each platform
- Counter-notice process documented

Source: [Copyright.gov](https://www.copyright.gov/dmca/)

---

## U.S. STATE LAWS

### Age Verification Laws (19+ States as of January 2025)

| State | Law | Threshold | Penalty |
|-------|-----|-----------|---------|
| Texas | HB 1181 | 33% adult content | $10,000/day |
| Louisiana | HB 142 | Any adult content | Civil liability |
| Utah | SB 287 | 33% adult content | Civil liability |
| Virginia | HB 1181 | 33% adult content | $50,000 |
| Arkansas | Act 227 | Any adult content | Civil liability |
| Tennessee | SB 1792 | Substantial content | Class C felony |
| Florida | HB 3 | Substantial content | Civil liability |
| + 12 more states | Various | Various | Various |

**Verification Methods Accepted:**
- Government-issued ID submission
- Third-party age verification services
- Biometric verification (where legal)

**FANZ Action:**
- Implement robust age verification for all U.S. users
- Consider state-specific gating
- Partner with compliant age verification provider

Sources: [AVPA](https://avpassociation.com/4271-2/), [Ondato](https://ondato.com/blog/adult-content-age-verification-laws/)

### BIPA (Illinois Biometric Information Privacy Act)

**Requirements:**
- Written notice before collecting biometric data
- Written consent required
- Cannot sell or disclose biometric data
- Must have retention/destruction policy

**Covered Data:** Fingerprints, retina scans, facial geometry, voiceprints

**Penalties:** $1,000 per negligent violation, $5,000 per intentional violation

**FANZ Action:** If using facial recognition for age verification, ensure BIPA compliance

Source: [ACLU Illinois](https://www.aclu-il.org/en/campaigns/biometric-information-privacy-act-bipa)

### CCPA/CPRA (California)

**Requirements:**
- Privacy policy disclosing data practices
- Right to know, delete, correct, and opt-out
- Cannot sell data without consent
- Special protections for sensitive personal information

**Penalties:** Up to $7,500 per violation

**2026 Updates:** New regulations effective January 1, 2026

Source: [CA DOJ](https://oag.ca.gov/privacy/ccpa)

### Revenge Porn / NCII Laws (48 States)

**Most states require:**
- Criminal penalties for distribution without consent
- Civil remedies for victims
- Platform cooperation with takedown requests

**Federal Civil Cause of Action:** VAWA 2022 created federal civil claim

Source: [C.A. Goldberg Law](https://www.cagoldberglaw.com/resources/states-with-revenge-porn-laws/)

---

## INTERNATIONAL REGULATIONS

### United Kingdom - Online Safety Act 2023

**Age Verification Deadline:** July 25, 2025

**Requirements:**
- "Highly effective" age checks required
- Tick-box self-certification no longer acceptable
- Applies to all sites accessible in UK with adult content

**Approved Methods:**
- Photo ID matching
- Facial age estimation
- Credit card verification
- Open banking checks

**Penalties:** Up to £18 million or 10% of global turnover

**Enforcement:** First fine issued December 2025 (£1 million to AVS Group Ltd)

Sources: [GOV.UK](https://www.gov.uk/government/collections/online-safety-act), [CMS Law](https://cms-lawnow.com/en/ealerts/2025/12/2025-uk-online-safety-act-round-up)

### European Union - Digital Services Act (DSA)

**Applies to:** All platforms accessible in EU

**Requirements:**
- Content moderation policies
- Transparency reports (annual)
- Age assurance for adult content
- Rapid removal of illegal content
- Designated point of contact

**VLOPs (Very Large Online Platforms):**
- Pornhub, Stripchat, XVideos, XNXX designated 2023-2024
- Additional risk assessment requirements
- Annual audits

**Penalties:** Up to 6% of global annual turnover

Sources: [EU Digital Strategy](https://digital-strategy.ec.europa.eu/en/policies/digital-services-act)

### European Union - GDPR

**Key Requirements:**
- Lawful basis for processing
- Data minimization
- User rights (access, deletion, portability)
- Data breach notification (72 hours)
- Data Protection Officer for large-scale processing

**Special Considerations for Adult Sites:**
- Explicit consent required for sensitive data
- Age verification data must be protected
- International transfers require safeguards

**Penalties:** Up to €20 million or 4% of global turnover

Source: [Token of Trust](https://tokenoftrust.com/blog/adult-website-compliance-and-risk-management/)

### Australia - eSafety Regulations

**Social Media Minimum Age:**
- Under-16 ban effective December 10, 2025
- Applies to major platforms

**Age-Restricted Material Codes:**
- Effective December 27, 2025 (hosting, search engines, ISPs)
- March 2026 (app stores, social media, other services)
- Requires age assurance measures

**Penalties:** Up to A$49.5 million per breach

Sources: [eSafety Commissioner](https://www.esafety.gov.au/industry/codes)

### Canada - PIPEDA

- Privacy requirements similar to GDPR
- 2024 investigation into Aylo found PIPEDA violations
- Consent required for all data collection

### France - SREN Law (2024)

- Strict age verification standards
- Arcom guidelines effective January 2025
- Penalties up to €150,000 or 2% of global turnover

---

## PAYMENT PROCESSOR REQUIREMENTS

### Visa - VIRP (Visa Integrity Risk Program)

**2025 Requirements:**
- Enhanced age/KYC verification
- High-risk merchant registration
- Strict content policies
- Transaction monitoring

**Non-Compliance Consequences:**
- Account termination
- Fines
- MATCH list placement (industry-wide ban)

Source: [Signature Payments](https://signaturepayments.com/visa-virp-compliance-adult-payment-processing/)

### Mastercard Content Standards

**Requirements:**
- Written consent verification for all depicted individuals
- Identity and age verification for content creators
- Content review before publication
- Real-time monitoring for live streams
- Content removal process for depicted individuals

**Prohibited Content:**
- CSAM
- Non-consensual content
- Deepfake pornography
- Content depicting minors

**2024 BRAM Updates:**
- Bans on deepfake porn
- TLS 1.2+ required for payment pages
- PCI DSS v4.0 compliance by Q1 2025

Sources: [Austreme](https://www.austreme.com/en/mastercards-new-rules-for-adult-content-and-services-will-this-affect-you/), [Corepay](https://corepay.net/articles/mastercard-adult-content-revisions/)

### AML (Anti-Money Laundering) Requirements

**For Adult Platforms:**
- Enhanced Due Diligence (EDD) for high-risk accounts
- Transaction monitoring for suspicious activity
- Record retention (5+ years per FATF)
- Suspicious Activity Reporting (SAR)
- Source of funds verification

**Compliance Program Elements:**
- Written AML policy
- Designated compliance officer
- Employee training
- Independent audit

Source: [Medium/TheFinRate](https://thefinrate.medium.com/navigating-compliance-kyc-aml-and-content-policies-in-adult-payment-processing-97bbb246681b)

---

## CONTENT MODERATION REQUIREMENTS

### Consent Verification

**All platforms must verify:**
- Age of all depicted individuals (18+)
- Consent from all depicted individuals
- Right to distribute content

**Documentation Required:**
- Government-issued ID
- Signed model release/consent form
- Verification that consent is ongoing

### Prohibited Content (Universal)

| Category | Description | Action |
|----------|-------------|--------|
| CSAM | Any sexual content depicting minors | Immediate removal, NCMEC report |
| Non-consensual | Content shared without consent | Remove within 48 hours |
| Trafficking | Content related to sex trafficking | Remove, report to law enforcement |
| Deepfakes | Non-consensual AI-generated content | Remove within 48 hours |
| Bestiality | Content depicting animal abuse | Immediate removal |
| Extreme violence | Content depicting real violence | Remove, potential law enforcement |

### Moderation Best Practices

1. **Pre-publication review** for new creators
2. **Hash-matching** against known illegal content (PhotoDNA)
3. **AI-assisted** content scanning
4. **Human review** for flagged content
5. **24/7 moderation** capability for live content
6. **Clear escalation** procedures
7. **Regular audits** of moderation effectiveness

---

## PRIVACY & DATA PROTECTION

### Required Privacy Disclosures

Every platform must have:
- Privacy Policy (clear, accessible)
- Cookie Policy
- Data retention policy
- User rights information
- Contact information for privacy requests

### User Rights (Combined GDPR/CCPA/etc.)

| Right | Description | Response Time |
|-------|-------------|---------------|
| Access | View all collected data | 30-45 days |
| Deletion | Request data erasure | 30-45 days |
| Correction | Fix inaccurate data | 30 days |
| Portability | Export data | 30-45 days |
| Opt-out | Stop data sales/sharing | Immediate |
| Non-discrimination | Equal service regardless of rights exercise | N/A |

### Data Breach Response

1. **Detection:** Within 24 hours
2. **Assessment:** Within 48 hours
3. **Notification:**
   - GDPR: 72 hours to regulators
   - CCPA: "Expedient" to consumers
   - State laws: Varies (24-72 hours)
4. **Documentation:** Full incident report

---

## INTELLECTUAL PROPERTY

### DMCA Compliance Checklist

- [ ] Designated DMCA agent registered with Copyright Office
- [ ] Agent contact info on website
- [ ] Takedown request process documented
- [ ] Counter-notice process documented
- [ ] Response within 24-48 hours
- [ ] Repeat infringer policy
- [ ] Content fingerprinting for known violations

### Creator IP Protection

- Clear Terms of Service on content ownership
- Copyright registration assistance
- DMCA takedown support for creators
- Content protection monitoring services

---

## TAX & FINANCIAL COMPLIANCE

### Platform Obligations

**Form 1099 Reporting:**
- 1099-NEC: Payments ≥$600 to creators
- 1099-K: Third-party payment processor reporting
- 2026: Threshold increases to $2,000

**Required Information from Creators:**
- Legal name
- Address
- Tax ID (SSN or EIN)
- W-9 form

### Creator Tax Guidance

Provide educational materials on:
- Self-employment tax (15.3%)
- Quarterly estimated payments
- Deductible business expenses
- Business entity options

---

## FANZ COMPLIANCE CHECKLIST

### Immediate Priority (0-30 Days)

- [ ] Age verification system for all U.S. users
- [ ] 2257 record keeping system audit
- [ ] NCMEC CyberTipline integration
- [ ] DMCA agent registration verification
- [ ] Content consent verification process
- [ ] 48-hour NCII takedown process

### High Priority (30-90 Days)

- [ ] UK Online Safety Act age verification
- [ ] EU DSA compliance assessment
- [ ] Payment processor compliance audit
- [ ] Privacy policy updates (all jurisdictions)
- [ ] AML program documentation
- [ ] Creator onboarding compliance

### Ongoing Compliance

- [ ] Daily content moderation audits
- [ ] Monthly compliance metrics review
- [ ] Quarterly creator compliance checks
- [ ] Annual transparency reports
- [ ] Regular legal landscape monitoring

---

## IMPLEMENTATION PRIORITY MATRIX

| Requirement | Risk Level | Effort | Priority |
|-------------|------------|--------|----------|
| Age Verification (US States) | CRITICAL | High | 1 |
| NCMEC Reporting | CRITICAL | Medium | 1 |
| 2257 Record Keeping | CRITICAL | Medium | 1 |
| UK Age Verification | HIGH | High | 2 |
| Consent Verification | HIGH | Medium | 2 |
| Paywall Transparency | HIGH | Low | ✅ Done |
| DMCA Process | MEDIUM | Low | 3 |
| Privacy Policy Updates | MEDIUM | Low | 3 |
| AML Documentation | MEDIUM | Medium | 3 |
| EU DSA Compliance | MEDIUM | High | 4 |
| Australia eSafety | MEDIUM | High | 4 |

---

## LEGAL CONTACTS

**General Legal:** admin@fanzunlimited.com
**Privacy Requests:** privacy@fanzunlimited.com
**DMCA Agent:** dmca@fanzunlimited.com
**Law Enforcement:** legal@fanzunlimited.com
**Compliance Questions:** compliance@fanzunlimited.com

---

## DOCUMENT HISTORY

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-04 | Initial comprehensive guide | System |

---

## DISCLAIMER

This document is for informational purposes only and does not constitute legal advice. FANZ should consult with qualified legal counsel for specific compliance guidance. Laws and regulations change frequently; this document should be reviewed and updated regularly.

---

**Next Review Date:** 2026-05-04
**Document Owner:** FANZ Legal & Compliance Team
