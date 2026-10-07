'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { AIAgent } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Bot,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  PhoneCall,
  Globe,
  Mic,
  Clock,
} from 'lucide-react';
import { BUSINESS_TYPES, VOICE_OPTIONS, LANGUAGE_OPTIONS, type BusinessType } from '@/types/database';
import { toast } from 'sonner';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function AgentsPage() {
  const { organization } = useAuth();
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewAgent, setViewAgent] = useState<AIAgent | null>(null);
  const [editAgent, setEditAgent] = useState<AIAgent | null>(null);

  const fetchAgents = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('organization_id', organization.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load agents');
    } else {
      setAgents(data as AIAgent[]);
    }
    setLoading(false);
  }, [organization]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Agents</h2>
          <p className="text-muted-foreground">
            Create and manage your AI voice agents
          </p>
        </div>
        <CreateAgentButton
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={fetchAgents}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : agents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
              <Bot className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No agents yet</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Create your first AI voice agent to start handling calls automatically.
            </p>
            <CreateAgentButton
              open={createOpen}
              onOpenChange={setCreateOpen}
              onCreated={fetchAgents}
              variant="default"
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Business Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vapi ID</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{agent.business_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={agent.status === 'active' ? 'default' : 'outline'}
                      className={
                        agent.status === 'active'
                          ? 'bg-success/10 text-success hover:bg-success/20'
                          : ''
                      }
                    >
                      {agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {agent.vapi_assistant_id ? (
                      <span title={agent.vapi_assistant_id}>
                        {agent.vapi_assistant_id.slice(0, 12)}…
                      </span>
                    ) : (
                      <span className="text-warning">Pending</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(agent.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setViewAgent(agent)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditAgent(agent)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteAgentButton
                        agent={agent}
                        onDeleted={fetchAgents}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* View dialog */}
      <Dialog open={!!viewAgent} onOpenChange={(open) => !open && setViewAgent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewAgent?.name}</DialogTitle>
            <DialogDescription>Agent details</DialogDescription>
          </DialogHeader>
          {viewAgent && (
            <div className="space-y-4">
              <DetailRow icon={Bot} label="Business Type" value={viewAgent.business_type} />
              <DetailRow icon={Globe} label="Language" value={viewAgent.language} />
              <DetailRow icon={Mic} label="Voice" value={viewAgent.voice} />
              <DetailRow
                icon={PhoneCall}
                label="Vapi Assistant ID"
                value={viewAgent.vapi_assistant_id ?? 'Not yet created'}
                mono
              />
              <DetailRow
                icon={Clock}
                label="Created"
                value={new Date(viewAgent.created_at).toLocaleString()}
              />
              {viewAgent.description && (
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{viewAgent.description}</p>
                </div>
              )}
              {viewAgent.greeting && (
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">Greeting</p>
                  <p className="rounded-md bg-secondary p-3 text-sm italic">
                    &ldquo;{viewAgent.greeting}&rdquo;
                  </p>
                </div>
              )}
              {viewAgent.system_prompt && (
                <div>
                  <p className="mb-1 text-sm font-medium text-muted-foreground">System Instructions</p>
                  <p className="rounded-md bg-secondary p-3 text-sm whitespace-pre-wrap">
                    {viewAgent.system_prompt}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <EditAgentDialog
        agent={editAgent}
        onClose={() => setEditAgent(null)}
        onSaved={fetchAgents}
      />
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <span className={`text-sm font-medium ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  );
}

// ============================================
// Create Agent Button + Dialog
// ============================================
function CreateAgentButton({
  open,
  onOpenChange,
  onCreated,
  variant = 'default',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
  variant?: 'default' | 'ghost';
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant={variant}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create AI Agent</DialogTitle>
          <DialogDescription>
            Configure your AI voice agent. It will be created on Vapi automatically.
          </DialogDescription>
        </DialogHeader>
        <AgentForm
          mode="create"
          onSaved={() => {
            onOpenChange(false);
            onCreated();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Edit Agent Dialog
// ============================================
function EditAgentDialog({
  agent,
  onClose,
  onSaved,
}: {
  agent: AIAgent | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  return (
    <Dialog open={!!agent} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Agent</DialogTitle>
          <DialogDescription>
            Update your agent configuration. Changes will sync to Vapi.
          </DialogDescription>
        </DialogHeader>
        {agent && (
          <AgentForm
            mode="edit"
            agent={agent}
            onSaved={() => {
              onClose();
              onSaved();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Delete Agent Button
// ============================================
function DeleteAgentButton({
  agent,
  onDeleted,
}: {
  agent: AIAgent;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);

    // If agent has a Vapi ID, delete from Vapi first
    if (agent.vapi_assistant_id) {
      try {
        const session = await supabase.auth.getSession();
        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/vapi-agents`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.data.session?.access_token}`,
              apikey: SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              vapiAssistantId: agent.vapi_assistant_id,
            }),
          }
        );

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          toast.error(data.error || 'Failed to delete agent from Vapi');
          setDeleting(false);
          return;
        }
      } catch {
        toast.error('Network error while deleting from Vapi');
        setDeleting(false);
        return;
      }
    }

    // Delete from Supabase
    const { error } = await supabase
      .from('ai_agents')
      .delete()
      .eq('id', agent.id);

    if (error) {
      toast.error('Failed to delete agent');
      setDeleting(false);
      return;
    }

    toast.success('Agent deleted');
    setDeleting(false);
    onDeleted();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete agent?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete &ldquo;{agent.name}&rdquo; from both VoiceForge and Vapi. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================
// Agent Form (shared by create and edit)
// ============================================
function AgentForm({
  mode,
  agent,
  onSaved,
}: {
  mode: 'create' | 'edit';
  agent?: AIAgent;
  onSaved: () => void;
}) {
  const { organization } = useAuth();
  const [name, setName] = useState(agent?.name ?? '');
  const [businessType, setBusinessType] = useState<BusinessType>(
    (agent?.business_type as BusinessType) ?? 'Restaurant'
  );
  const [description, setDescription] = useState(agent?.description ?? '');
  const [greeting, setGreeting] = useState(agent?.greeting ?? '');
  const [systemPrompt, setSystemPrompt] = useState(agent?.system_prompt ?? '');
  const [language, setLanguage] = useState(agent?.language ?? 'en-US');
  const [voice, setVoice] = useState(agent?.voice ?? 'Ellie');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    setSaving(true);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (mode === 'create') {
        // Step 1: Save agent to Supabase
        const { data: agentData, error: dbError } = await supabase
          .from('ai_agents')
          .insert({
            organization_id: organization.id,
            name,
            business_type: businessType,
            description,
            greeting,
            system_prompt: systemPrompt,
            language,
            voice,
            status: 'active',
          })
          .select()
          .single();

        if (dbError || !agentData) {
          toast.error(dbError?.message || 'Failed to save agent');
          setSaving(false);
          return;
        }

        // Step 2: Create on Vapi via edge function
        try {
          const response = await fetch(`${SUPABASE_URL}/functions/v1/vapi-agents`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              apikey: SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              agentId: agentData.id,
              name,
              businessType,
              description,
              greeting,
              systemPrompt,
              language,
              voice,
            }),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            toast.error(errData.error || 'Agent saved but Vapi creation failed');
            setSaving(false);
            return;
          }

          const result = await response.json();

          // Step 3: Update agent with Vapi ID
          if (result.vapiAssistantId) {
            await supabase
              .from('ai_agents')
              .update({ vapi_assistant_id: result.vapiAssistantId })
              .eq('id', agentData.id);
          }

          toast.success('Agent created on Vapi successfully');
        } catch {
          toast.error('Agent saved but failed to create on Vapi');
          setSaving(false);
          return;
        }
      } else if (mode === 'edit' && agent) {
        // Update Supabase
        const { error: dbError } = await supabase
          .from('ai_agents')
          .update({
            name,
            business_type: businessType,
            description,
            greeting,
            system_prompt: systemPrompt,
            language,
            voice,
          })
          .eq('id', agent.id);

        if (dbError) {
          toast.error(dbError.message);
          setSaving(false);
          return;
        }

        // Update Vapi if assistant exists
        if (agent.vapi_assistant_id) {
          try {
            const response = await fetch(`${SUPABASE_URL}/functions/v1/vapi-agents`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                apikey: SUPABASE_ANON_KEY,
              },
              body: JSON.stringify({
                vapiAssistantId: agent.vapi_assistant_id,
                name,
                businessType,
                description,
                greeting,
                systemPrompt,
                language,
                voice,
              }),
            });

            if (!response.ok) {
              const errData = await response.json().catch(() => ({}));
              toast.error(errData.error || 'Saved locally but Vapi update failed');
              setSaving(false);
              return;
            }

            toast.success('Agent updated and synced to Vapi');
          } catch {
            toast.error('Saved locally but Vapi update failed');
            setSaving(false);
            return;
          }
        } else {
          toast.success('Agent updated');
        }
      }

      setSaving(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Agent Name</Label>
        <Input
          id="name"
          placeholder="e.g. Front Desk Receptionist"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessType">Business Type</Label>
        <Select value={businessType} onValueChange={(v) => setBusinessType(v as BusinessType)}>
          <SelectTrigger id="businessType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BUSINESS_TYPES.map((bt) => (
              <SelectItem key={bt.value} value={bt.value}>
                {bt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Business Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your business so the AI agent understands context..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="greeting">Agent Greeting</Label>
        <Input
          id="greeting"
          placeholder="e.g. Hello! Thanks for calling Acme Corp, how can I help you?"
          value={greeting}
          onChange={(e) => setGreeting(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="systemPrompt">System Instructions</Label>
        <Textarea
          id="systemPrompt"
          placeholder="Instructions for the AI agent on how to handle calls, what to say, what to collect..."
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="voice">Voice</Label>
          <Select value={voice} onValueChange={setVoice}>
            <SelectTrigger id="voice">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VOICE_OPTIONS.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Agent' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
