# Proposal: Unify Email Template Appearance

**Change ID:** `unify-email-template-appearance`
**GitHub Issue:** #24
**Status:** Draft
**Milestone:** v1.1 - Polish (due 2026-02-14)

## Summary

Fix the remaining visual inconsistencies across all 10 email templates to ensure 100% compliance with the master template design system and STYLE_GUIDE.md.

## Problem

Audit of all templates against the master template and style guide revealed two concrete deviations:

1. **lead-intake.html** — Button padding is `12px 24px` instead of the standard `14px 32px`
2. **sales-winback.html** — Line 53 has a hardcoded feature string ("Improved Natural Language Understanding") instead of a `{{NEW_FEATURE_3}}` template variable

All other templates (8/10) are fully compliant with design system colors, button specs, and master template structure. No deprecated colors (#0ea5e9), no unreplaced `{{CONTENT_BLOCK}}` placeholders, and all templates correctly delegate header/footer/preheader to the master template.

## Scope

- Fix 2 template files (lead-intake.html, sales-winback.html)
- Update STYLE_GUIDE.md to document the `NEW_FEATURE_3` variable
- Run validation to confirm compliance

## Out of Scope

- Master template changes (already correct)
- Footer/preheader changes (correctly handled by master template architecture)
- New template creation
- Build system changes
