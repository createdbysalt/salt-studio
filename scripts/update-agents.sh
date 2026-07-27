#!/bin/bash
#
# Updates all agent files with new project context footer
# Run from project root: bash scripts/update-agents.sh
#

cd "$(dirname "$0")/.." || exit 1

# Files to update
FILES=(
  ".claude/agents/animation-extractor.md"
  ".claude/agents/apify-researcher.md"
  ".claude/agents/architect.md"
  ".claude/agents/brand-identity-steward.md"
  ".claude/agents/client-discovery.md"
  ".claude/agents/code-reviewer.md"
  ".claude/agents/component-replicator.md"
  ".claude/agents/conversion-reviewer.md"
  ".claude/agents/creative-director.md"
  ".claude/agents/design-system-guardian.md"
  ".claude/agents/design-translator.md"
  ".claude/agents/gemini-researcher.md"
  ".claude/agents/icp-analyst.md"
  ".claude/agents/marketing-copywriter.md"
  ".claude/agents/mdx-content-writer.md"
  ".claude/agents/search-optimizer.md"
  ".claude/agents/security-audit.md"
  ".claude/agents/social-orchestrator.md"
  ".claude/agents/strategic-ideator.md"
  ".claude/agents/style-extractor.md"
  ".claude/agents/ux-analyst.md"
  ".claude/agents/ux-optimizer.md"
  ".claude/agents/ux-pattern-scout.md"
  ".claude/agents/ux-strategist.md"
  ".claude/agents/visual-validator.md"
)

for file in "${FILES[@]}"; do
  if [[ -f "$file" ]]; then
    if grep -q "## Project context (required reading)" "$file"; then
      # Remove everything from "## Project context" to end of file
      sed -i '' '/^## Project context (required reading)/,$d' "$file"
      echo "Cleaned: $file"
    else
      echo "No footer to clean: $file"
    fi
  else
    echo "Not found: $file"
  fi
done

echo ""
echo "Footer sections removed. Now run Claude to add new footers."
