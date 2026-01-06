# BoyFanz Deployment Policy

## CRITICAL DEPLOYMENT LAW

**ALL new development MUST first hit BoyFanzUnleashed production environment before deploying to the real BoyFanz production.**

## Deployment Flow

```
Development → BoyFanzUnleashed Production → BoyFanz Production
   (Local)         (boyfanzunleashed           (boyfanz.fanz.website
                    .fanz.website)               or boyzapp.com)
```

## Requirements

1. **Testing Environment**: boyfanzunleashed.fanz.website
   - Platform Code: `boy_fanz_unleashed`
   - Slug: `boyfanzunleashed`
   - Purpose: Production testing before real production deployment

2. **Mandatory Testing Period**:
   - All features MUST be tested on BoyFanzUnleashed
   - All bug fixes MUST be verified on BoyFanzUnleashed
   - All database migrations MUST run on BoyFanzUnleashed first

3. **Approval Process**:
   - Test on BoyFanzUnleashed
   - Verify functionality
   - Get sign-off
   - Deploy to BoyFanz production

## NO EXCEPTIONS

This policy applies to:
- New features
- Bug fixes
- Database schema changes
- Configuration updates
- Dependency updates
- ANY code changes

## Platform Locations

**Testing (BoyFanzUnleashed)**:
- Directory: `/Users/wyattcole/The Correct Platforms/boyfanzunleashed`
- Domain: `boyfanzunleashed.fanz.website`
- Database: `boy_fanz_unleashed_` schema

**Production (BoyFanz)**:
- Directory: `/Users/wyattcole/The Correct Platforms/boyfanz`
- Domain: `boyfanz.fanz.website` or `boyzapp.com`
- Database: `boy_fanz_` schema

---

**Created**: 2026-01-04
**Enforced By**: Claude Code, Development Team
**Violations**: Not permitted
