# ⚠️ SUPERSEDED

This proposal has been **SUPERSEDED** by [`implement-rcs-messaging-n8n`](../implement-rcs-messaging-n8n/proposal.md).

**Date:** 2026-01-27

## Reason

The initial implementation revealed critical issues:
1. **Escaping bugs**: `\$500` instead of `$500` due to shell command escaping
2. **SMS only**: No RCS support (user explicitly wanted RCS)
3. **Not through n8n**: Direct API calls instead of workflow routing
4. **No visual verification**: Didn't confirm messages appeared correctly

## Migration Path

All valuable work has been migrated to the new implementation:

| Component | Status | New Location |
|-----------|--------|--------------|
| 5 sales email templates | ✅ Kept as-is | `email-templates/templates/` |
| Message template logic | ✅ Migrated | `shared/message-templates.ts` |
| n8n workflow | ✅ Rebuilt | Workflow `CBoXlSNiDOHA5YmA` |
| Schema updates | ✅ Kept | `shared/schema.ts` |
| Testing | ✅ Enhanced | `tests/` with Vitest (44 tests) |

## What's New in Replacement

The new implementation adds:
- **RCS messaging** with branded sender and suggested actions
- **n8n Universal Message Sender** workflow
- **Twilio Content API** templates (10/10 created)
- **Messaging Service** with automatic SMS fallback
- **Comprehensive testing** (unit, integration, E2E)
- **RCS guidelines** in STYLE_GUIDE.md

## References

- **New Proposal**: [implement-rcs-messaging-n8n/proposal.md](../implement-rcs-messaging-n8n/proposal.md)
- **Current Status**: [implement-rcs-messaging-n8n/tasks.md](../implement-rcs-messaging-n8n/tasks.md)
- **Design**: [implement-rcs-messaging-n8n/design.md](../implement-rcs-messaging-n8n/design.md)
