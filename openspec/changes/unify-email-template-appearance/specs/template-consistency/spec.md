# Spec: Template Consistency

**Capability:** Unified email template appearance
**Parent Change:** `unify-email-template-appearance`

## MODIFIED Requirements

### REQ-TC-1: All buttons must use design system standard padding

All email template buttons (btn-primary, btn-secondary, btn-warning, btn-danger) must use `padding: 14px 32px` as defined in the master template and STYLE_GUIDE.md.

#### Scenario: lead-intake buttons match design system
- **Given** the lead-intake.html template
- **When** inspecting the "Reply to Lead" and "Call Lead" button styles
- **Then** both buttons have `padding: 14px 32px` inline

### REQ-TC-2: All template content must use variables, not hardcoded strings

Repeating content slots within a template must use `{{VARIABLE}}` syntax for substitution. No hardcoded strings in positions where other slots use variables.

#### Scenario: sales-winback features all use variables
- **Given** the sales-winback.html template
- **When** inspecting the three feature list items
- **Then** all three use template variables: `{{NEW_FEATURE_1}}`, `{{NEW_FEATURE_2}}`, `{{NEW_FEATURE_3}}`

### REQ-TC-3: STYLE_GUIDE.md documents all template variables

Every template variable used across all templates must be documented in STYLE_GUIDE.md.

#### Scenario: winback variables are documented
- **Given** the STYLE_GUIDE.md
- **When** searching for sales-winback variable documentation
- **Then** `NEW_FEATURE_1`, `NEW_FEATURE_2`, and `NEW_FEATURE_3` are listed
