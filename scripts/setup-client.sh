#!/usr/bin/env bash
#
# SALT Studio Client Template — Client Setup Script
#
# This script initializes a new client project from the template.
# It creates the brand-identity folder structure, sets up SEO configuration,
# configures research tools, and optionally sets up the Sanity project via MCP.
#
# Usage: bash scripts/setup-client.sh
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     SALT Studio — Client Project Setup                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ==============================================================================
# Step 1: Client Information
# ==============================================================================
echo -e "${YELLOW}Step 1: Client Information${NC}"
echo ""
read -p "Client name (e.g., Acme Corp): " CLIENT_NAME
read -p "Project codename (lowercase, no spaces, e.g., acme): " CODENAME
read -p "One-line description of the business: " BUSINESS_DESCRIPTION
read -p "Client website URL (optional, for auto-discovery): " CLIENT_WEBSITE

# Validate codename
if [[ ! "$CODENAME" =~ ^[a-z0-9-]+$ ]]; then
    echo -e "${RED}Error: Codename must be lowercase letters, numbers, and hyphens only.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Client: $CLIENT_NAME${NC}"
echo -e "${GREEN}✓ Codename: $CODENAME${NC}"
echo -e "${GREEN}✓ Description: $BUSINESS_DESCRIPTION${NC}"
[[ -n "$CLIENT_WEBSITE" ]] && echo -e "${GREEN}✓ Website: $CLIENT_WEBSITE${NC}"
echo ""

# ==============================================================================
# Step 2: SEO & Domain Configuration
# ==============================================================================
echo -e "${YELLOW}Step 2: SEO & Domain Configuration${NC}"
echo ""
read -p "Production domain (e.g., https://acme.com): " SITE_URL
SITE_URL=${SITE_URL:-"http://localhost:4000"}

echo ""
echo "Business type (affects structured data):"
echo "  1. Organization (company, agency, startup)"
echo "  2. LocalBusiness (physical location, store)"
echo "  3. Person (individual, freelancer)"
echo ""
read -p "Select business type [1]: " BUSINESS_TYPE_CHOICE
case $BUSINESS_TYPE_CHOICE in
    2) BUSINESS_TYPE="LocalBusiness" ;;
    3) BUSINESS_TYPE="Person" ;;
    *) BUSINESS_TYPE="Organization" ;;
esac

echo ""
echo -e "${BLUE}Social media links (press Enter to skip):${NC}"
read -p "  Twitter/X URL: " TWITTER_URL
read -p "  LinkedIn URL: " LINKEDIN_URL
read -p "  Instagram URL: " INSTAGRAM_URL

echo ""
echo -e "${GREEN}✓ Site URL: $SITE_URL${NC}"
echo -e "${GREEN}✓ Business Type: $BUSINESS_TYPE${NC}"
echo ""

# ==============================================================================
# Step 3: Research & AI Tools Configuration
# ==============================================================================
echo -e "${YELLOW}Step 3: Research & AI Tools Configuration${NC}"
echo ""
echo -e "${CYAN}These tools power competitive analysis, user research, and website scraping.${NC}"
echo -e "${CYAN}All are optional but recommended for best onboarding results.${NC}"
echo ""

# Gemini API Key
echo -e "${BOLD}Gemini API (for competitive research):${NC}"
echo "  Get your key at: https://aistudio.google.com/app/apikey"
read -p "  Gemini API Key (or press Enter to skip): " GEMINI_API_KEY

if [[ -n "$GEMINI_API_KEY" ]]; then
    echo -e "${GREEN}  ✓ Gemini API configured — /research command enabled${NC}"
else
    echo -e "${YELLOW}  ⚠ Skipped — competitive research will be unavailable${NC}"
fi
echo ""

# Firecrawl API Key
echo -e "${BOLD}Firecrawl (for deep website scraping):${NC}"
echo "  Get your key at: https://firecrawl.dev"
read -p "  Firecrawl API Key (or press Enter to skip): " FIRECRAWL_API_KEY

if [[ -n "$FIRECRAWL_API_KEY" ]]; then
    echo -e "${GREEN}  ✓ Firecrawl configured — deep website analysis enabled${NC}"
else
    echo -e "${YELLOW}  ⚠ Skipped — will use Playwright for website analysis${NC}"
fi
echo ""

# Apify API Key
echo -e "${BOLD}Apify (for social media scraping):${NC}"
echo "  Get your key at: https://console.apify.com/account/integrations"
read -p "  Apify API Key (or press Enter to skip): " APIFY_API_KEY

if [[ -n "$APIFY_API_KEY" ]]; then
    echo -e "${GREEN}  ✓ Apify configured — social media scraping enabled${NC}"
else
    echo -e "${YELLOW}  ⚠ Skipped — social media will use Playwright or be skipped${NC}"
fi
echo ""

# Playwright confirmation
echo -e "${BOLD}Playwright (visual testing & fallback scraping):${NC}"
echo "  Playwright runs locally — no API key needed."
read -p "  Enable Playwright? (Y/n): " PLAYWRIGHT_CHOICE
if [[ "$PLAYWRIGHT_CHOICE" =~ ^[Nn]$ ]]; then
    PLAYWRIGHT_ENABLED="false"
    echo -e "${YELLOW}  ⚠ Playwright disabled${NC}"
else
    PLAYWRIGHT_ENABLED="true"
    echo -e "${GREEN}  ✓ Playwright enabled${NC}"
fi
echo ""

# Salt Studio GTM
echo -e "${BOLD}Salt Studio Analytics (GTM):${NC}"
echo "  This tracks project metrics for Salt Studio's internal analytics."
echo "  Client cannot see or modify this data."
read -p "  Salt GTM Container ID (e.g., GTM-XXXXXXX, or press Enter to skip): " SALT_GTM_ID
if [[ -n "$SALT_GTM_ID" ]]; then
    echo -e "${GREEN}  ✓ Salt GTM configured${NC}"
else
    echo -e "${YELLOW}  ⚠ Skipped — add NEXT_PUBLIC_GTM_ID to .env.local later${NC}"
fi
echo ""

# ==============================================================================
# Step 4: Create brand-identity folder structure
# ==============================================================================
echo -e "${YELLOW}Step 4: Creating brand-identity folder structure...${NC}"
echo ""

mkdir -p brand-identity/assets/{logo,fonts,images}
mkdir -p brand-identity/inputs
mkdir -p brand-identity/research/{icp-profiles,competitor-audits,market-insights,feature-research}

# Create discovery.json template
cat > brand-identity/discovery.json << 'DISCOVERY_EOF'
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "_meta": {
    "type": "discovery",
    "version": "1.0",
    "lastUpdated": null,
    "confidence": "pending"
  },
  "clientDNA": {
    "businessName": null,
    "industry": null,
    "founded": null,
    "location": null,
    "teamSize": null,
    "businessModel": null,
    "offerings": [],
    "uniqueValue": null,
    "competitors": [],
    "goals": {
      "primary": null,
      "secondary": [],
      "constraints": []
    }
  },
  "voiceProfile": {
    "dimensions": {
      "formal_casual": { "score": null, "evidence": [] },
      "serious_playful": { "score": null, "evidence": [] },
      "reserved_enthusiastic": { "score": null, "evidence": [] },
      "traditional_modern": { "score": null, "evidence": [] },
      "simple_sophisticated": { "score": null, "evidence": [] },
      "warm_distant": { "score": null, "evidence": [] }
    },
    "vocabulary": {
      "preferred": [],
      "avoided": []
    },
    "guidelines": {
      "dos": [],
      "donts": []
    }
  },
  "missingInfo": {
    "critical": [],
    "high": [],
    "medium": [],
    "low": []
  }
}
DISCOVERY_EOF

# Create audience.json template
cat > brand-identity/audience.json << 'AUDIENCE_EOF'
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "_meta": {
    "type": "audience",
    "version": "1.0",
    "lastUpdated": null,
    "confidence": "pending"
  },
  "icpProfiles": {
    "primary": {
      "name": null,
      "description": null,
      "demographics": {},
      "psychographics": {
        "values": [],
        "beliefs": [],
        "fears": []
      },
      "awarenessLevel": null,
      "painPoints": [],
      "desires": {
        "functional": [],
        "emotional": [],
        "identity": []
      },
      "objections": [],
      "buyingTriggers": [],
      "transformation": {
        "before": null,
        "after": null
      }
    },
    "secondary": null
  },
  "userJourney": {
    "stages": {
      "unaware": { "state": null, "needs": [], "content": [] },
      "problemAware": { "state": null, "needs": [], "content": [] },
      "solutionAware": { "state": null, "needs": [], "content": [] },
      "productAware": { "state": null, "needs": [], "content": [] },
      "mostAware": { "state": null, "needs": [], "content": [] }
    },
    "frictionPoints": [],
    "conversionTriggers": []
  },
  "researchGaps": []
}
AUDIENCE_EOF

# Create strategy.json template
cat > brand-identity/strategy.json << 'STRATEGY_EOF'
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "_meta": {
    "type": "strategy",
    "version": "1.0",
    "lastUpdated": null,
    "confidence": "pending"
  },
  "siteGoals": {
    "primary": null,
    "metric": null,
    "target": null,
    "secondary": []
  },
  "sitemap": {
    "pages": [],
    "navigation": {
      "primary": [],
      "footer": []
    },
    "urlStructure": null
  },
  "pageBriefs": {},
  "userFlows": {
    "primary": {
      "name": null,
      "steps": [],
      "frictionPoints": [],
      "mitigations": []
    },
    "secondary": []
  },
  "contentRequirements": {}
}
STRATEGY_EOF

# Create design.json template
cat > brand-identity/design.json << 'DESIGN_EOF'
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "_meta": {
    "type": "design",
    "version": "1.0",
    "lastUpdated": null,
    "confidence": "pending"
  },
  "direction": {
    "summary": null,
    "threeWords": [],
    "feeling": null,
    "rationale": null
  },
  "references": [],
  "visualSystem": {
    "typography": {
      "primary": { "family": null, "weights": [], "rationale": null },
      "secondary": null,
      "scale": {
        "display": null,
        "h1": null,
        "h2": null,
        "h3": null,
        "h4": null,
        "body": null,
        "small": null,
        "caption": null
      }
    },
    "colors": {
      "primary": { "value": null, "rationale": null },
      "primaryHover": null,
      "secondary": { "value": null, "rationale": null },
      "accent": { "value": null, "rationale": null },
      "background": null,
      "foreground": null,
      "muted": null,
      "border": null,
      "success": null,
      "warning": null,
      "error": null
    },
    "spacing": {
      "baseUnit": null,
      "scale": []
    },
    "borderRadius": {
      "default": null,
      "scale": {}
    },
    "shadows": [],
    "motion": {
      "duration": null,
      "easing": null
    }
  },
  "componentSpecs": {},
  "openQuestions": []
}
DESIGN_EOF

# Create README for inputs folder
cat > brand-identity/inputs/README.md << 'INPUTS_README'
# Client Inputs

Place client materials here for discovery:

- Intake questionnaires / discovery forms
- Existing brand guidelines
- Logo files
- Writing samples (for voice extraction)
- Competitor information
- Customer testimonials
- Any other relevant documents

These files are processed by `/discover` and `/onboard` commands.
INPUTS_README

echo -e "${GREEN}✓ Created brand-identity/discovery.json${NC}"
echo -e "${GREEN}✓ Created brand-identity/audience.json${NC}"
echo -e "${GREEN}✓ Created brand-identity/strategy.json${NC}"
echo -e "${GREEN}✓ Created brand-identity/design.json${NC}"
echo -e "${GREEN}✓ Created brand-identity/inputs/ (for client materials)${NC}"
echo -e "${GREEN}✓ Created brand-identity/research/ (for competitive analysis)${NC}"
echo -e "${GREEN}✓ Created brand-identity/assets/{logo,fonts,images}${NC}"
echo ""

# ==============================================================================
# Step 5: Update package.json
# ==============================================================================
echo -e "${YELLOW}Step 5: Updating package.json...${NC}"
echo ""

if command -v jq &> /dev/null; then
    # Use jq if available
    jq --arg name "$CODENAME" '.name = $name' package.json > package.json.tmp && mv package.json.tmp package.json
    echo -e "${GREEN}✓ Updated package name to: $CODENAME${NC}"
else
    # Fallback to sed
    sed -i '' "s/\"name\": \".*\"/\"name\": \"$CODENAME\"/" package.json
    echo -e "${GREEN}✓ Updated package name to: $CODENAME${NC}"
fi
echo ""

# ==============================================================================
# Step 6: Sanity Project Setup
# ==============================================================================
echo -e "${YELLOW}Step 6: Sanity Project Setup${NC}"
echo ""
echo "You have two options for setting up the Sanity project:"
echo ""
echo "  1. Use Sanity MCP (recommended) — Claude can create the project for you"
echo "  2. Manual setup — Create at manage.sanity.io and enter credentials"
echo ""
read -p "Use Sanity MCP for automatic setup? (y/n): " USE_MCP

if [[ "$USE_MCP" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}To set up Sanity MCP:${NC}"
    echo ""
    echo "  1. Run: npx sanity mcp setup"
    echo "  2. This will configure Claude Code to use Sanity's MCP server"
    echo "  3. Then ask Claude: 'Create a new Sanity project for $CLIENT_NAME'"
    echo ""

    # Create .env.local with placeholders
    SANITY_PROJECT_ID=""
    SANITY_DATASET="production"
    SANITY_READ_TOKEN=""
else
    echo ""
    echo -e "${BLUE}Manual Sanity Setup:${NC}"
    echo ""
    echo "  1. Go to https://manage.sanity.io"
    echo "  2. Create a new project named: $CLIENT_NAME"
    echo "  3. Create a dataset named: production"
    echo "  4. Generate a read token in the API tab"
    echo ""
    read -p "Enter NEXT_PUBLIC_SANITY_PROJECT_ID: " SANITY_PROJECT_ID
    read -p "Enter NEXT_PUBLIC_SANITY_DATASET (default: production): " SANITY_DATASET
    SANITY_DATASET=${SANITY_DATASET:-production}
    read -p "Enter SANITY_API_READ_TOKEN: " SANITY_READ_TOKEN
fi

# Create .env.local
cat > .env.local << ENV_EOF
# =============================================================================
# $CLIENT_NAME — Environment Configuration
# Generated by SALT Studio setup script
# =============================================================================

# --- Sanity CMS ---------------------------------------------------------------
NEXT_PUBLIC_SANITY_PROJECT_ID=$SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET=$SANITY_DATASET
SANITY_API_READ_TOKEN=$SANITY_READ_TOKEN
NEXT_PUBLIC_SANITY_API_VERSION=2025-02-27
NEXT_PUBLIC_SANITY_PROJECT_TITLE=$CLIENT_NAME

# --- SEO & Site Config --------------------------------------------------------
NEXT_PUBLIC_SITE_URL=$SITE_URL
NEXT_PUBLIC_SITE_NAME=$CLIENT_NAME
NEXT_PUBLIC_SITE_DESCRIPTION=$BUSINESS_DESCRIPTION
NEXT_PUBLIC_BUSINESS_TYPE=$BUSINESS_TYPE

# --- Social Links -------------------------------------------------------------
NEXT_PUBLIC_TWITTER_URL=$TWITTER_URL
NEXT_PUBLIC_LINKEDIN_URL=$LINKEDIN_URL
NEXT_PUBLIC_INSTAGRAM_URL=$INSTAGRAM_URL

# --- AI Research & Competitive Analysis ---------------------------------------
GEMINI_API_KEY=$GEMINI_API_KEY
GOOGLE_AI_API_KEY=$GEMINI_API_KEY

# --- Website Scraping ---------------------------------------------------------
FIRECRAWL_API_KEY=$FIRECRAWL_API_KEY

# --- Social Media Scraping ----------------------------------------------------
APIFY_API_KEY=$APIFY_API_KEY

# --- Playwright ---------------------------------------------------------------
PLAYWRIGHT_ENABLED=$PLAYWRIGHT_ENABLED
PLAYWRIGHT_BROWSER=chromium
PLAYWRIGHT_HEADLESS=true

# --- Salt Studio Analytics (internal tracking) --------------------------------
NEXT_PUBLIC_GTM_ID=$SALT_GTM_ID

# --- Staging/Preview (uncomment to block search engines) ----------------------
# ROBOTS_DISALLOW_ALL=true
ENV_EOF

echo ""
echo -e "${GREEN}✓ Created .env.local with all configuration${NC}"
echo ""

# ==============================================================================
# Step 7: Generate llms.txt for AI Search Engines
# ==============================================================================
echo -e "${YELLOW}Step 7: Generating llms.txt...${NC}"
echo ""

TODAY=$(date +%Y-%m-%d)
cat > public/llms.txt << LLMS_EOF
# $CLIENT_NAME

> $BUSINESS_DESCRIPTION

## About

$CLIENT_NAME is $BUSINESS_DESCRIPTION.

## What We Offer

- [Add your main offerings here]
- [Add another offering]
- [Add another offering]

## Who We Help

We work with [describe your ideal customers].

## Contact

- Website: $SITE_URL
- Email: [your email]

## Key Pages

- Home: $SITE_URL
- About: $SITE_URL/about
- Services: $SITE_URL/services
- Contact: $SITE_URL/contact

---

*This file helps AI assistants understand our website. Last updated: $TODAY*
LLMS_EOF

echo -e "${GREEN}✓ Generated public/llms.txt${NC}"
echo -e "${BLUE}→ Update this file with your actual offerings and contact info${NC}"
echo ""

# ==============================================================================
# Step 8: Customize Documentation
# ==============================================================================
echo -e "${YELLOW}Step 8: Customizing documentation...${NC}"
echo ""

# Update CLAUDE.md
if [[ -f "CLAUDE.md" ]]; then
    # Replace the header and intro
    sed -i '' "s/# Salt Client Template/# $CLIENT_NAME/" CLAUDE.md
    sed -i '' "s/A Next.js 16 + Sanity 5 starter template for building client websites. Salt Studio uses this as the foundation when spinning up new client projects./A Next.js 16 + Sanity 5 website for $CLIENT_NAME. $BUSINESS_DESCRIPTION/" CLAUDE.md

    # Replace "Starting a new client project" section
    sed -i '' 's/## Starting a new client project/## Project Status/' CLAUDE.md

    echo -e "${GREEN}✓ Updated CLAUDE.md with client name${NC}"
fi

# Update README.md
if [[ -f "README.md" ]]; then
    sed -i '' "s/# Salt Studio Client Template/# $CLIENT_NAME/" README.md
    sed -i '' "s/A Next.js 16 + Sanity 5 starter for client websites./A Next.js 16 + Sanity 5 website for $CLIENT_NAME./" README.md
    echo -e "${GREEN}✓ Updated README.md with client name${NC}"
fi

echo ""

# ==============================================================================
# Step 9: Template Cleanup
# ==============================================================================
echo -e "${YELLOW}Step 9: Template Cleanup${NC}"
echo ""
read -p "Remove the intro-template welcome card? (y/n): " REMOVE_INTRO

if [[ "$REMOVE_INTRO" =~ ^[Yy]$ ]]; then
    # Remove intro-template import and usage from layout
    if [[ -f "app/(personal)/layout.tsx" ]]; then
        sed -i '' '/intro-template/d' "app/(personal)/layout.tsx"
        echo -e "${GREEN}✓ Removed intro-template references from layout${NC}"
    fi

    # Remove the folder
    if [[ -d "intro-template" ]]; then
        rm -rf intro-template
        echo -e "${GREEN}✓ Removed intro-template folder${NC}"
    fi
else
    echo -e "${BLUE}ℹ Keeping intro-template — you can remove it later${NC}"
fi
echo ""

# Favicon reminder
echo -e "${BLUE}Favicon files to replace:${NC}"
echo "  • app/favicon.ico"
echo "  • app/apple-icon.png"
echo "  • public/og-image.png (social sharing image)"
echo ""

# ==============================================================================
# Step 10: Brand Token Reminder
# ==============================================================================
echo -e "${YELLOW}Step 10: Brand Token Reminder${NC}"
echo ""
echo -e "${BLUE}Don't forget to customize the brand tokens in app/globals.css:${NC}"
echo ""
echo "  --color-primary: var(--color-blue-600);    ← Change to client's primary"
echo "  --color-secondary: var(--color-gray-800);  ← Change to client's secondary"
echo "  --color-accent: var(--color-orange-500);   ← Change to client's accent"
echo ""
echo -e "${BLUE}Visit /brand to see all tokens visualized.${NC}"
echo ""

# ==============================================================================
# Step 11: Git Setup
# ==============================================================================
echo -e "${YELLOW}Step 11: Git Setup${NC}"
echo ""
read -p "Initialize fresh git history for this client? (y/n): " FRESH_GIT

if [[ "$FRESH_GIT" =~ ^[Yy]$ ]]; then
    rm -rf .git
    git init
    git add -A
    git commit -m "Initial commit: $CLIENT_NAME project setup

Created by SALT Studio setup script.

Co-Authored-By: Claude <noreply@anthropic.com>"
    echo ""
    echo -e "${GREEN}✓ Initialized fresh git repository${NC}"
else
    echo -e "${BLUE}ℹ Keeping existing git history${NC}"
fi
echo ""

# ==============================================================================
# Step 12: Install Dependencies
# ==============================================================================
echo -e "${YELLOW}Step 12: Install Dependencies${NC}"
echo ""
read -p "Run npm install now? (Y/n): " RUN_INSTALL

if [[ ! "$RUN_INSTALL" =~ ^[Nn]$ ]]; then
    echo ""
    echo -e "${BLUE}Installing dependencies...${NC}"
    npm install
    echo ""
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${BLUE}ℹ Skipped — run 'npm install' when ready${NC}"
fi
echo ""

# ==============================================================================
# Done!
# ==============================================================================
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Setup Complete!                                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Show capability summary
echo -e "${BOLD}Capabilities Configured:${NC}"
echo ""
if [[ -n "$SALT_GTM_ID" ]]; then
    echo -e "  ${GREEN}✓${NC} Salt Studio Analytics (GTM: $SALT_GTM_ID)"
else
    echo -e "  ${YELLOW}○${NC} Salt Studio Analytics (add NEXT_PUBLIC_GTM_ID to enable)"
fi
if [[ -n "$GEMINI_API_KEY" ]]; then
    echo -e "  ${GREEN}✓${NC} Competitive Research (/research command)"
else
    echo -e "  ${YELLOW}○${NC} Competitive Research (add GEMINI_API_KEY to enable)"
fi
if [[ -n "$FIRECRAWL_API_KEY" ]]; then
    echo -e "  ${GREEN}✓${NC} Deep Website Scraping (Firecrawl)"
else
    echo -e "  ${YELLOW}○${NC} Deep Website Scraping (add FIRECRAWL_API_KEY or use Playwright)"
fi
if [[ -n "$APIFY_API_KEY" ]]; then
    echo -e "  ${GREEN}✓${NC} Social Media Scraping (Apify)"
else
    echo -e "  ${YELLOW}○${NC} Social Media Scraping (add APIFY_API_KEY to enable)"
fi
if [[ "$PLAYWRIGHT_ENABLED" == "true" ]]; then
    echo -e "  ${GREEN}✓${NC} Visual Testing & Screenshots (Playwright)"
else
    echo -e "  ${YELLOW}○${NC} Playwright (set PLAYWRIGHT_ENABLED=true to enable)"
fi
echo ""

# Show next steps
echo -e "${BOLD}Next Steps:${NC}"
echo ""
if [[ "$RUN_INSTALL" =~ ^[Nn]$ ]]; then
    echo "  1. ${CYAN}npm install${NC}"
    echo "  2. ${CYAN}npm run dev${NC}"
else
    echo "  1. ${CYAN}npm run dev${NC}"
fi
echo ""
echo -e "${BOLD}Onboarding Workflow:${NC}"
echo ""
echo "  ${CYAN}/onboard \"$CLIENT_NAME\"${NC}"
echo "      ↳ Runs the complete workflow: discover → research → icp → strategy"
echo ""
echo "  Or run phases individually:"
echo "    ${CYAN}/discover${NC}  → Extract Client DNA and Voice Profile"
echo "    ${CYAN}/research${NC}  → Competitive analysis (requires GEMINI_API_KEY)"
echo "    ${CYAN}/icp${NC}       → Build Ideal Customer Profiles"
echo "    ${CYAN}/strategy${NC}  → Create sitemap and page briefs"
echo "    ${CYAN}/brief${NC}     → Design system (requires reference URLs)"
echo "    ${CYAN}/review${NC}    → Conversion audit before handoff"
echo ""
echo "  Track progress:"
echo "    ${CYAN}/project status $CODENAME${NC}"
echo ""

if [[ -n "$CLIENT_WEBSITE" ]]; then
    echo -e "${BOLD}Quick Start:${NC}"
    echo ""
    echo "  Client website provided! Run:"
    echo "    ${CYAN}/onboard \"$CLIENT_NAME\" --website $CLIENT_WEBSITE${NC}"
    echo ""
fi

echo -e "${BLUE}Happy building!${NC}"
echo ""
