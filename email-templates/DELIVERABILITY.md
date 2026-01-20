# Email Deliverability Best Practices

This document outlines the deliverability optimizations built into the Wranngle email template system and provides guidance for maximizing inbox placement.

## Built-in Deliverability Features

### 1. **Authentication & Headers**

#### SPF (Sender Policy Framework)
```dns
v=spf1 include:_spf.google.com include:sendgrid.net ~all
```
- Add all legitimate sending IPs to your SPF record
- Keep lookups under 10 to avoid DNS errors
- Use `~all` (soft fail) for testing, `-all` (hard fail) for production

#### DKIM (DomainKeys Identified Mail)
- Generate DKIM keys through your ESP (SendGrid, Mailgun, etc.)
- Add DKIM TXT records to DNS
- Test with: `dig TXT selector._domainkey.yourdomain.com`

#### DMARC (Domain-based Message Authentication)
```dns
_dmarc.yourdomain.com TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
```
- Start with `p=none` to monitor
- Move to `p=quarantine` then `p=reject` as confidence grows
- Set up aggregate reports (`rua`) to track authentication

### 2. **HTML/CSS Optimizations**

✅ **What We Do:**
- **Inline CSS** - Critical styles are inlined for maximum compatibility
- **Table-based Layout** - Uses `<table>` instead of modern layout (flexbox/grid)
- **Web-safe Fonts** - Fallback fonts for clients that block custom fonts
- **Maximum Width: 600px** - Optimal for most email clients
- **Minimal External Resources** - Reduces loading time and spam score
- **No JavaScript** - Email clients strip JS, we avoid it entirely

✅ **Mobile Responsive:**
- Media queries for mobile optimization
- Touch-friendly button sizes (44x44px minimum)
- Readable font sizes (16px minimum)

### 3. **Content Best Practices**

#### Text-to-Image Ratio
- **Target: 60% text, 40% images or less**
- Our templates are text-heavy by design
- Images are optional and have `alt` text

#### Word Choice
❌ **Avoid spam trigger words:**
- "FREE", "URGENT", "ACT NOW", "LIMITED TIME"
- All caps subject lines
- Excessive exclamation marks!!!

✅ **Use professional language:**
- Clear, concise messaging
- Proper grammar and spelling
- Branded, consistent tone

#### Links
- Use HTTPS for all links
- Use descriptive anchor text (not "click here")
- Limit total links to ~3-5 per email
- Include unsubscribe link (legal requirement)

### 4. **Technical Optimizations**

#### Preheader Text
```html
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
  {{PREHEADER_TEXT}}
</div>
```
- 50-100 characters
- Complements subject line
- Visible in inbox preview

#### Alt Text for Images
```html
<img src="logo.png" alt="Wranngle Systems" />
```
- Descriptive alt text for all images
- Maintains context if images are blocked

#### Email Size
- **Target: Under 100KB**
- Our templates: ~40-60KB
- Larger emails may be clipped (Gmail clips at 102KB)

### 5. **List Management**

#### Permission-based Sending
- ✅ Only send to opted-in subscribers
- ✅ Include clear opt-in confirmation
- ✅ Double opt-in recommended for cold audiences

#### Bounce Handling
- **Hard Bounces:** Remove immediately (invalid email)
- **Soft Bounces:** Retry 3-5 times, then remove
- **Bounce Rate Target:** < 2%

#### Complaint Handling
- **Complaint Rate Target:** < 0.1%
- Monitor feedback loops (FBLs) from ISPs
- Remove complainers immediately

#### Engagement-based Segmentation
- Re-engage inactive subscribers (90+ days)
- Sunset policy: Remove non-engagers after 180 days
- Prioritize engaged users for better reputation

### 6. **Sending Infrastructure**

#### Warm-up Schedule
For new sending domains/IPs:

| Day | Volume | Notes |
|-----|--------|-------|
| 1-2 | 50-100 | Start slow |
| 3-5 | 500-1,000 | Monitor bounce/complaint rates |
| 6-10 | 5,000 | Gradually increase |
| 11-15 | 20,000 | Near full volume |
| 16+ | Full volume | Maintain consistent sending |

#### Sending Frequency
- **Consistency matters more than volume**
- Don't send only when you need something
- Regular cadence builds sender reputation

#### Time-of-Day Optimization
Best sending times (B2B):
- Tuesday-Thursday, 10 AM - 2 PM local time
- Avoid Mondays (inbox overload) and Fridays (low engagement)

### 7. **Testing & Monitoring**

#### Pre-send Testing
- **Mail-Tester:** https://www.mail-tester.com (spam score)
- **Litmus:** Test across 90+ email clients
- **Email on Acid:** Spam filter testing
- **GlockApps:** Inbox placement monitoring

#### Test Checklist
- [ ] SPF/DKIM/DMARC authentication passes
- [ ] Spam score < 3/10
- [ ] All links work (no 404s)
- [ ] Unsubscribe link works
- [ ] Mobile rendering looks good
- [ ] Images load (or alt text displays)
- [ ] No broken HTML/CSS
- [ ] Personalization tokens populated

#### Monitoring Metrics
**Delivery Metrics:**
- Delivery Rate: > 98%
- Bounce Rate: < 2%
- Complaint Rate: < 0.1%

**Engagement Metrics:**
- Open Rate: 15-25% (B2B)
- Click Rate: 2-5% (B2B)
- Unsubscribe Rate: < 0.5%

### 8. **Email Service Provider (ESP) Configuration**

#### Recommended ESPs
1. **SendGrid** - Reliable, great APIs, good deliverability
2. **Mailgun** - Developer-friendly, powerful routing
3. **Amazon SES** - Cost-effective, requires warm-up
4. **Postmark** - Best for transactional emails

#### ESP Setup Checklist
- [ ] Domain authentication (SPF, DKIM, DMARC)
- [ ] Dedicated sending domain (e.g., `mail.wranngle.com`)
- [ ] IP warm-up plan (if using dedicated IP)
- [ ] Bounce/complaint webhooks configured
- [ ] Feedback loops enabled
- [ ] Unsubscribe handling automated

### 9. **Template-Specific Optimizations**

#### Welcome Emails
- Send immediately after signup
- High engagement rate helps reputation
- Include clear value proposition

#### Transactional Emails (Invoices, Receipts)
- Highest deliverability (expected by user)
- Keep branding minimal, content focused
- Send from dedicated transactional subdomain

#### Notifications
- Allow users to control frequency
- Batch non-urgent notifications
- Use clear, actionable subject lines

#### Password Resets
- Send immediately (time-sensitive)
- Short expiry time (1 hour recommended)
- Include security info for trust

### 10. **Compliance & Legal**

#### CAN-SPAM Act (US)
- [ ] Physical mailing address in footer
- [ ] Clear "From" name and email
- [ ] Honest subject line
- [ ] Unsubscribe link (process within 10 days)

#### GDPR (EU)
- [ ] Explicit consent for marketing emails
- [ ] Easy way to withdraw consent
- [ ] Privacy policy link
- [ ] Data processing agreement with ESP

#### CASL (Canada)
- [ ] Express or implied consent
- [ ] Identification of sender
- [ ] Unsubscribe mechanism

---

## Quick Deliverability Checklist

Before sending any email campaign:

- [ ] Authentication configured (SPF, DKIM, DMARC)
- [ ] Template tested in multiple clients
- [ ] Spam score checked (< 3/10)
- [ ] Unsubscribe link works
- [ ] All links use HTTPS
- [ ] Images have alt text
- [ ] Preheader text is set
- [ ] Subject line is clear and honest
- [ ] Content is valuable (not just promotional)
- [ ] Sending to engaged, opted-in list only

---

## Deliverability Resources

- [Google Postmaster Tools](https://postmaster.google.com/) - Monitor Gmail reputation
- [Microsoft SNDS](https://sendersupport.olc.protection.outlook.com/snds/) - Outlook reputation
- [MXToolbox](https://mxtoolbox.com/) - DNS/blacklist checking
- [Mail-Tester](https://www.mail-tester.com/) - Spam score testing
- [Return Path](https://returnpath.com/) - Enterprise deliverability platform

---

## Support

For deliverability questions or issues:
- Email: deliverability@wranngle.com
- Documentation: https://docs.wranngle.com/emails
