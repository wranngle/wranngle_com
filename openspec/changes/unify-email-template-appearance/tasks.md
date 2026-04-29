# Tasks: Unify Email Template Appearance

## Task 1: Fix lead-intake.html button padding
- **File:** `email-templates/templates/lead-intake.html`
- **Change:** Update "Reply to Lead" and "Call Lead" button padding from `12px 24px` to `14px 32px`
- **Verify:** Buttons match design system spec (14px font, 14px 32px padding, 8px radius, 2px border)

## Task 2: Fix sales-winback.html hardcoded feature
- **File:** `email-templates/templates/sales-winback.html`
- **Change:** Replace hardcoded "Improved Natural Language Understanding" on line 53 with `{{NEW_FEATURE_3}}` variable
- **Verify:** All three feature slots use template variables consistently

## Task 3: Update STYLE_GUIDE.md variable docs
- **File:** `email-templates/STYLE_GUIDE.md`
- **Change:** Add `NEW_FEATURE_3` to the winback template variable documentation if not already listed
- **Verify:** Variable table is complete

## Task 4: Run validation
- **Command:** `bun run email:test` and `bun run email:preview:all`
- **Verify:** No warnings or errors

## Dependencies
- Tasks 1-3 are parallelizable
- Task 4 depends on Tasks 1-3
