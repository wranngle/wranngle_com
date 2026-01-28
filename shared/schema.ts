import {type} from 'arktype';

export const insertUserSchema = type({
  username: 'string',
  'isAdmin?': 'boolean',
});

export const userSchema = type({
  id: 'number',
  username: 'string',
  'isAdmin?': 'boolean',
});

export const insertLeadSchema = type({
  businessName: 'string',
  industry: 'string',
  ownerName: 'string',
  phone: 'string',
  email: 'string.email',
  package: 'string',
  'agentName?': 'string',
  'status?': 'string',
  'notes?': 'string',
  // SMS consent fields for multi-channel messaging
  'smsConsent?': 'boolean',
  'smsConsentTimestamp?': 'string',
  'preferredChannel?': '"email" | "sms" | "both"',
});

export const leadSchema = type({
  id: 'number',
  businessName: 'string',
  industry: 'string',
  ownerName: 'string',
  phone: 'string',
  email: 'string.email',
  package: 'string',
  'agentName?': 'string',
  'status?': 'string',
  'notes?': 'string',
  // SMS consent fields for multi-channel messaging
  'smsConsent?': 'boolean',
  'smsConsentTimestamp?': 'string',
  'preferredChannel?': '"email" | "sms" | "both"',
});

export type InsertUser = typeof insertUserSchema.infer;
export type User = typeof userSchema.infer;
export type InsertLead = typeof insertLeadSchema.infer;
export type Lead = typeof leadSchema.infer;
