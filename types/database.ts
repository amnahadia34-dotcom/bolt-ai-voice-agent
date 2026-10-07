export type BusinessType =
  | 'Restaurant'
  | 'Insurance'
  | 'Real Estate'
  | 'Clinic'
  | 'School'
  | 'E-commerce'
  | 'Service Business'
  | 'Other';

export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  organization_id: string;
  full_name: string;
  created_at: string;
}

export interface AIAgent {
  id: string;
  organization_id: string;
  name: string;
  business_type: string;
  description: string | null;
  system_prompt: string | null;
  greeting: string | null;
  voice: string;
  language: string;
  vapi_assistant_id: string | null;
  status: string;
  created_at: string;
}

export const BUSINESS_TYPES: { label: string; value: BusinessType }[] = [
  { label: 'Restaurant', value: 'Restaurant' },
  { label: 'Insurance', value: 'Insurance' },
  { label: 'Real Estate', value: 'Real Estate' },
  { label: 'Clinic', value: 'Clinic' },
  { label: 'School', value: 'School' },
  { label: 'E-commerce', value: 'E-commerce' },
  { label: 'Service Business', value: 'Service Business' },
  { label: 'Other', value: 'Other' },
];

export const VOICE_OPTIONS = [
  'Ellie',
  'Sarah',
  'Brian',
  'Michael',
  'Nicole',
  'Rachel',
  'Mark',
  'Daniel',
];

export const LANGUAGE_OPTIONS = [
  { label: 'English (US)', value: 'en-US' },
  { label: 'English (UK)', value: 'en-GB' },
  { label: 'Spanish', value: 'es-ES' },
  { label: 'French', value: 'fr-FR' },
  { label: 'German', value: 'de-DE' },
  { label: 'Portuguese', value: 'pt-BR' },
];
