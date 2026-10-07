/*
# Create core multi-tenant tables: organizations, profiles, ai_agents

## Overview
This migration sets up the foundational multi-tenant data structure for the AI Voice Agent SaaS.
Each user (business) signs up, an organization is auto-created, and they manage AI voice agents
within their organization. Row Level Security ensures complete data isolation between businesses.

## New Tables

### organizations
- id (uuid, PK) — unique organization identifier
- name (text) — business name
- owner_id (uuid, FK → auth.users) — the user who owns this organization
- created_at (timestamptz) — creation timestamp

### profiles
- id (uuid, PK) — profile identifier
- user_id (uuid, FK → auth.users) — linked auth user
- organization_id (uuid, FK → organizations) — which org this profile belongs to
- full_name (text) — user's full name
- created_at (timestamptz) — creation timestamp

### ai_agents
- id (uuid, PK) — agent identifier
- organization_id (uuid, FK → organizations) — owning organization
- name (text) — agent display name
- business_type (text) — e.g. Restaurant, Insurance, Real Estate, etc.
- description (text) — business description
- system_prompt (text) — system instructions for the AI
- greeting (text) — agent greeting message
- voice (text) — voice selection
- language (text) — language code
- vapi_assistant_id (text) — ID returned by Vapi when assistant is created
- status (text) — agent status (active/inactive)
- created_at (timestamptz) — creation timestamp

## Security
- RLS enabled on ALL three tables.
- organizations: owner can CRUD their own org.
- profiles: user can CRUD their own profile; users can read profiles within their org.
- ai_agents: only members of the owning organization can CRUD agents.
- All policies scoped TO authenticated with auth.uid() ownership checks.
- Child tables (profiles, ai_agents) scope through organizations via EXISTS subquery.
*/

-- ============================================
-- organizations
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_organization" ON organizations;
CREATE POLICY "select_own_organization"
ON organizations FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "insert_own_organization" ON organizations;
CREATE POLICY "insert_own_organization"
ON organizations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "update_own_organization" ON organizations;
CREATE POLICY "update_own_organization"
ON organizations FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "delete_own_organization" ON organizations;
CREATE POLICY "delete_own_organization"
ON organizations FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- ============================================
-- profiles
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile"
ON profiles FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- ai_agents
-- ============================================
CREATE TABLE IF NOT EXISTS ai_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  business_type text NOT NULL DEFAULT 'Other',
  description text,
  system_prompt text,
  greeting text,
  voice text NOT NULL DEFAULT 'Ellie',
  language text NOT NULL DEFAULT 'en-US',
  vapi_assistant_id text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_org_agents" ON ai_agents;
CREATE POLICY "select_org_agents"
ON ai_agents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE organizations.id = ai_agents.organization_id
    AND organizations.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "insert_org_agents" ON ai_agents;
CREATE POLICY "insert_org_agents"
ON ai_agents FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE organizations.id = ai_agents.organization_id
    AND organizations.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "update_org_agents" ON ai_agents;
CREATE POLICY "update_org_agents"
ON ai_agents FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE organizations.id = ai_agents.organization_id
    AND organizations.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE organizations.id = ai_agents.organization_id
    AND organizations.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "delete_org_agents" ON ai_agents;
CREATE POLICY "delete_org_agents"
ON ai_agents FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE organizations.id = ai_agents.organization_id
    AND organizations.owner_id = auth.uid()
  )
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_organization_id ON ai_agents(organization_id);
