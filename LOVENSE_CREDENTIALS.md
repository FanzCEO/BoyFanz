> **PROPRIETARY** - Owned by Joshua Stone (Wyatt Cole) and Licensed Usage to FANZ Group Holdings LLC.
> 30 N GOULD STREET SHERIDAN, WY 82801
> (tm) FANZ patent pending 2025

---

# Lovense API Credentials - CONFIDENTIAL

**Developer Portal:** https://developer.lovense.com/#introduction

## Configured Platforms

### BoyFanz
- **Callback URL:** `https://boy.fanz.website/api/lovense/callback`
- **Token:** `Is1M4URqkW9w_NN0KfwW7jMCuHQ7Ifhg5w1XQh88sSOqe-Dr4t7XOPy20SMGwlUk`
- **AES Key:** `148ae7a7910b37d3`
- **AES IV:** `599E5FA0D65DAC78`

### GirlFanz
- **Callback URL:** `https://girl.fanz.website/api/lovense/callback`
- **Token:** `Is1M4URqkW9w_NN0KfwW7jMCuHQ7Ifhg5w1XQh88sSOPbq8jmZLeFcekKPaPgdEO`
- **AES Key:** `b03a58b589cf374a`
- **AES IV:** `53CC0062D819E876`

### TransFanz
- **Callback URL:** `https://trans.fanz.website/api/lovense/callback`
- **Token:** `Is1M4URqkW9w_NN0KfwW7jMCuHQ7Ifhg5w1XQh88sSPctgAQCov_XzJV19tX50jK`
- **AES Key:** `34f52b5a9a630de1`
- **AES IV:** `56D4AA65AB6C35EA`

### CougarFanz
- **Callback URL:** `https://cougar.fanz.website/api/lovense/callback`
- **Token:** `Is1M4URqkW9w_NN0KfwW7jMCuHQ7Ifhg5w1XQh88sSPaKF1YImSA19IjTWPQC6o9`
- **AES Key:** `89b6fd0bfea26840`
- **AES IV:** `A982D23AD078935E`

### TabooFanz
- **Callback URL:** `https://taboo.fanz.website/api/lovense/callback`
- **Token:** `Is1M4URqkW9w_NN0KfwW7jMCuHQ7Ifhg5w1XQh88sSMW7VlnScjUaqGlLskmW18C`
- **AES Key:** `ee7cf34b161deba9`
- **AES IV:** `286850DBD22D2CC9`

## Remaining Platforms (Need Credentials)

- MilfFanz - `https://milf.fanz.website/api/lovense/callback`
- BearFanz - `https://bear.fanz.website/api/lovense/callback`
- DaddyFanz - `https://daddy.fanz.website/api/lovense/callback`
- PupFanz - `https://pup.fanz.website/api/lovense/callback`
- FanzUncut - `https://uncut.fanz.website/api/lovense/callback`
- FemmeFanz - `https://femme.fanz.website/api/lovense/callback`
- BroFanz - `https://bro.fanz.website/api/lovense/callback`
- SouthernFanz - `https://southern.fanz.website/api/lovense/callback`
- DLBroz - `https://dlbroz.fanz.website/api/lovense/callback`
- Guyz - `https://guyz.fanz.website/api/lovense/callback`

## Environment Variables Format

```env
LOVENSE_DEVELOPER_TOKEN=<token>
LOVENSE_AES_KEY=<key>
LOVENSE_AES_IV=<iv>
LOVENSE_CALLBACK_URL=https://<platform>.fanz.website/api/lovense/callback
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/lovense/qr` | GET | Generate QR code for toy pairing |
| `/api/lovense/callback` | POST | Lovense server callback |
| `/api/lovense/status` | GET | Check connection status |
| `/api/lovense/tip-actions` | GET/POST | Tip-to-vibration mappings |
| `/api/lovense/test` | POST | Test vibration |
| `/api/lovense/stop` | POST | Stop all toys |

## Default Tip Actions

| Amount | Intensity | Duration | Pattern | Description |
|--------|-----------|----------|---------|-------------|
| $1-4 | 5 | 3s | - | Light buzz |
| $5-9 | 10 | 8s | - | Medium vibration |
| $10-24 | 15 | 15s | - | Strong pulse |
| $25-49 | 18 | 25s | wave | Wave pattern |
| $50-99 | 20 | 45s | earthquake | Earthquake! |
| $100+ | 20 | 60s | fireworks | MAX POWER! |

---
*Last Updated: 2024-12-26*
*Server Location: `/var/www/knowledge-base/articles/lovense-credentials.json`*
