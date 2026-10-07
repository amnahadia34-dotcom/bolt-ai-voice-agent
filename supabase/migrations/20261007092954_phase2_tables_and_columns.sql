/*
# Phase 2: Add role/personality to ai_agents; create knowledge_base, phone_numbers, leads, calls, appointments, org_settings

## Modified Tables
### ai_agents — added role (text), personality (text)

## New Tables (in dependency order)
1. knowledge_base — per-org docs, FAQs, file uploads
2. phone_numbers — Vapi/Twilio phone resources
3. leads — CRM leads with statuses
4. calls — real call records (references leads + appointments)
5. appointments — booking/scheduling
6. org_settings — business profile + AI defaults

## Security
- RLS on every table, scoped through organizations.owner_id = auth.uid()
*/

-- Add columns to ai_agents
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_agents' AND column_name = 'role') THEN
    ALTER TABLE ai_agents ADD COLUMN role text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_agents' AND column_name = 'personality') THEN
    ALTER TABLE ai_agents ADD COLUMN personality text;
  END IF;
END $$;

-- ============================================
-- knowledge_base
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES ai_agents(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text,
  file_name text,
  file_type text,
  file_url text,
  source_type text NOT NULL DEFAULT 'text',
  status text NOT NULL DEFAULT 'ready',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_org_kb" ON knowledge_base;
CREATE POLICY "select_org_kb" ON knowledge_base FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = knowledge_base.organization_id AND organizations.owner_id = auth.uid()));
DROP POLICY IF EXISTS "insert_org_kb" ON knowledge_base;
CREATE POLICY "insert_org_kb" ON knowledge_base FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = knowledge_base.organization_id AND organizations.owner_id = auth.uid()));
DROP POLICY IF EXISTS "update_org_kb" ON knowledge_base;
CREATE POLICY "update_org_kb" ON knowledge_base FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = knowledge_base.organization_id AND organizations.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = knowledge_base.organization_id AND organizations.owner_id = auth.uid()));
DROP POLICY IF EXISTS "delete_org_kb" ON knowledge_base;
CREATE POLICY "delete_org_kb" ON knowledge_base FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = knowledge_base.organization_id AND organizations.owner_id = auth.uid()));

-- ============================================
-- phone_numbers
-- ============================================
CREATE TABLE IF NOT EXISTS phone_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES ai_agents(id) ON DELETE SET NULL,
  phone_number text,
  provider text NOT NULL DEFAULT 'vapi',
  direction text NOT NULL DEFAULT 'both',
  status text NOT NULL DEFAULT 'unassigned',
  vapi_phone_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_org_phones" ON phone_numbers;
CREATE POLICY "select_org_phones" ON phone_numbers FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = phone_numbers.organization_id AND organizations.owner_id = auth.uid()));
DROP POLICY IF EXISTS "insert_org_phones" ON phone_numbers;
CREATE POLICY "insert_org_phones" ON phone_numbers FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = phone_numbers.organization_id AND organizations.owner_id = auth.uid()));
DROP POLICY IF EXISTS "update_org_phones" ON phone_numbers;
CREATE POLICY "update_org_phones" ON phone_numbers FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = phone_numbers.organization_id AND organizations.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = phone_numbers.organization_id AND organizations.owner_id = auth.uid()));
DROP POLICY IF EXISTS "delete_org_phones" ON phone_numbers;
CREATE POLICY "delete_org_phones" ON phone_numbers FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = phone_numbers.organization_id AND organizations.owner_id = auth.uid()));

-- ============================================
-- leads (before calls)
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES ai_agents(id) ON DELETE SET NULL,
  call_id uuid,
  name text NOT NULL,
  phone text,
  email text,
  interested_in text,
  source text,
  status text NOT NULL DEFAULT 'new',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_org_leads" ON leads;
CREATE POLICY "select_org_leads" ON leads FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = leads.organization_id AND organizations.owner_id = auth.uid()));
DROP POLICY IF EXISTS "insert_org_leads" ON leads;
CREATE POLICY "insert_org_leads" ON leads FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = leads.organization_id AND organizations.owner_id = auth.uid()));
DROP POLICY IF EXISTS "update_org_leads" ON leads;
CREATE POLICY "update_org_leads" ON leads FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = leads.organization_id AND organizations.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = leads.organization_id AND organizations.owner_id = auth.uid()));
DROP POLICY IF EXISTS "delete_org_leads" ON leads;
CREATE POLICY "delete_org_leads" ON leads FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = leads.organization_id AND organizations.owner_id = auth.uid()));

-- ============================================
-- appointments (before calls)
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES ai_agents(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  phone text,
  email text,
  purpose text,
  scheduled_date date NOT NULL,
  scheduled_time text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_org_appts" ON appointments;
CREATE POLICY "select_org_appts" ON appointments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = appointments.organization_id AND organizations.owner_id = auth.uid()));
DROP POLICY IF EXISTS "insert_org_appts" ON appointments;
CREATE POLICY "insert_org_appts" ON appointments FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = appointments.organization_id AND organizations.owner_id = auth.uid()));
DROP POLICY IF EXISTS "update_org_appts" ON appointments;
CREATE POLICY "update_org_appts" ON appointments FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = appointments.organization_id AND organizations.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = appointments.organization_id AND organizations.owner_id = auth.uid()));
DROP POLICY IF EXISTS "delete_org_appts" ON appointments;
CREATE POLICY "delete_org_appts" ON appointments FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = appointments.organization_id AND organizations.owner_id = auth.uid()));

-- ============================================
-- calls (references leads + appointments)
-- ============================================
CREATE TABLE IF NOT EXISTS calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES ai_agents(id) ON DELETE SET NULL,
  phone_number_id uuid REFERENCES phone_numbers(id) ON DELETE SET NULL,
  caller_number text,
  caller_name text,
  direction text NOT NULL DEFAULT 'inbound',
  duration_seconds integer DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  outcome text,
  recording_url text,
  transcript text,
  summary text,
  tools_used jsonb DEFAULT '[]'::jsonb,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);
-- Fix leads.call_id FK now that calls exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'leads_call_id_fkey') THEN
    ALTER TABLE leads ADD CONSTRAINT leads_call_id_fkey FOREIGN KEY (call_id) REFERENCES calls(id) ON DELETE SET NULL;
  END IF;
END $$;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_org_calls" ON calls;
CREATE POLICY "select_org_calls" ON calls FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = calls.organization_id AND organizations.owner_id = auth.uid()));
DROP POLICY IF EXISTS "insert_org_calls" ON calls;
CREATE POLICY "insert_org_calls" ON calls FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = calls.organization_id AND organizations.owner_id = auth.uid()));
DROP POLICY IF EXISTS "update_org_calls" ON calls;
CREATE POLICY "update_org_calls" ON calls FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = calls.organization_id AND organizations.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = calls.organization_id AND organizations.owner_id = auth.uid()));
DROP POLICY IF EXISTS "delete_org_calls" ON calls;
CREATE POLICY "delete_org_calls" ON calls FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = calls.organization_id AND organizations.owner_id = auth.uid()));

-- ============================================
-- org_settings
-- ============================================
CREATE TABLE IF NOT EXISTS org_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  industry text,
  email text,
  phone text,
  website text,
  timezone text DEFAULT 'UTC',
  default_language text DEFAULT 'en-US',
  default_voice text DEFAULT 'Ellie',
  default_greeting text,
  default_handoff_rules jsonb DEFAULT '{}'::jsonb,
  human_handoff_phone text,
  handoff_conditions jsonb DEFAULT '[]'::jsonb,
  business_hours jsonb DEFAULT '{}'::jsonb,
  fallback_behavior text DEFAULT 'take_message',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE org_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_org_settings" ON org_settings;
CREATE POLICY "select_org_settings" ON org_settings FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = org_settings.organization_id AND organizations.owner_id = auth.uid()));
DROP POLICY IF EXISTS "insert_org_settings" ON org_settings;
CREATE POLICY "insert_org_settings" ON org_settings FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = org_settings.organization_id AND organizations.owner_id = auth.uid()));
DROP POLICY IF EXISTS "update_org_settings" ON org_settings;
CREATE POLICY "update_org_settings" ON org_settings FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = org_settings.organization_id AND organizations.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = org_settings.organization_id AND organizations.owner_id = auth.uid()));
DROP POLICY IF EXISTS "delete_org_settings" ON org_settings;
CREATE POLICY "delete_org_settings" ON org_settings FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM organizations WHERE organizations.id = org_settings.organization_id AND organizations.owner_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kb_organization_id ON knowledge_base(organization_id);
CREATE INDEX IF NOT EXISTS idx_kb_agent_id ON knowledge_base(agent_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_organization_id ON phone_numbers(organization_id);
CREATE INDEX IF NOT EXISTS idx_calls_organization_id ON calls(organization_id);
CREATE INDEX IF NOT EXISTS idx_calls_agent_id ON calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_organization_id ON leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_appointments_organization_id ON appointments(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_settings_organization_id ON org_settings(organization_id);
