"use client";

import { useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { Users, Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";
import { PlatformSection } from "@/components/dashboard/platform-section";

interface Client {
  id: string;
  email: string;
  name: string;
  companyName: string | null;
  createdAt: string;
  smartleadApiKey: string | null;
  smartleadCampaignIds: string | null;
  heyreachApiKey: string | null;
  heyreachCampaignIds: string | null;
}

interface FormData {
  email: string;
  name: string;
  password: string;
  companyName: string;
  smartleadApiKey: string;
  smartleadCampaignIds: string;
  heyreachApiKey: string;
  heyreachCampaignIds: string;
}

const emptyForm: FormData = {
  email: "", name: "", password: "", companyName: "",
  smartleadApiKey: "", smartleadCampaignIds: "",
  heyreachApiKey: "", heyreachCampaignIds: "",
};

export default function AdminClientsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  if (session?.user?.role !== "admin") redirect("/");

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["admin", "clients"],
    queryFn: async () => {
      const res = await fetch("/api/admin/clients");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create client");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
      resetForm();
    },
    onError: (err: Error) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FormData> }) => {
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "clients"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/clients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "clients"] }),
  });

  function resetForm() {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
    setError("");
  }

  function startEdit(client: Client) {
    setEditId(client.id);
    setForm({
      email: client.email,
      name: client.name,
      password: "",
      companyName: client.companyName || "",
      smartleadApiKey: client.smartleadApiKey || "",
      smartleadCampaignIds: client.smartleadCampaignIds || "",
      heyreachApiKey: client.heyreachApiKey || "",
      heyreachCampaignIds: client.heyreachCampaignIds || "",
    });
    setShowForm(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (editId) {
      const payload: Partial<FormData> = { ...form };
      if (!payload.password) delete payload.password;
      updateMutation.mutate({ id: editId, data: payload });
    } else {
      createMutation.mutate(form);
    }
  }

  function maskKey(key: string | null) {
    if (!key) return "—";
    return key.slice(0, 4) + "..." + key.slice(-4);
  }

  return (
    <div className="space-y-6">
      <PlatformSection title="Manage Clients" icon={Users}>
        <div className="flex justify-end">
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Client
          </button>
        </div>

        {/* Client Form Modal */}
        {showForm && (
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editId ? "Edit Client" : "New Client"}</h3>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                <InputField label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
                <InputField label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required={!editId} placeholder={editId ? "Leave blank to keep current" : undefined} />
                <InputField label="Company Name" value={form.companyName} onChange={(v) => setForm({ ...form, companyName: v })} />
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">SmartLead Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="API Key" value={form.smartleadApiKey} onChange={(v) => setForm({ ...form, smartleadApiKey: v })} placeholder="SmartLead API key" />
                  <InputField label="Campaign IDs" value={form.smartleadCampaignIds} onChange={(v) => setForm({ ...form, smartleadCampaignIds: v })} placeholder="Comma-separated (empty = all)" />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">HeyReach Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="API Key" value={form.heyreachApiKey} onChange={(v) => setForm({ ...form, heyreachApiKey: v })} placeholder="HeyReach API key" />
                  <InputField label="Campaign IDs" value={form.heyreachCampaignIds} onChange={(v) => setForm({ ...form, heyreachCampaignIds: v })} placeholder="Comma-separated (empty = all)" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 text-sm font-medium">
                  {editId ? "Save Changes" : "Create Client"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Clients List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : clients.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center text-[var(--color-muted-foreground)]">
            No clients yet. Click &ldquo;Add Client&rdquo; to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((client) => (
              <div key={client.id} className="bg-white rounded-xl border p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{client.name}</h4>
                    <p className="text-sm text-[var(--color-muted-foreground)]">{client.email}</p>
                    {client.companyName && <p className="text-sm text-[var(--color-muted-foreground)]">{client.companyName}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(client)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </button>
                    <button onClick={() => { if (confirm(`Delete ${client.name}?`)) deleteMutation.mutate(client.id); }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <PlatformBadge
                    label="SmartLead"
                    connected={!!client.smartleadApiKey}
                    detail={client.smartleadApiKey ? maskKey(client.smartleadApiKey) : undefined}
                    showFull={showKeys[`sl-${client.id}`]}
                    fullValue={client.smartleadApiKey}
                    onToggle={() => setShowKeys(p => ({ ...p, [`sl-${client.id}`]: !p[`sl-${client.id}`] }))}
                  />
                  <PlatformBadge
                    label="HeyReach"
                    connected={!!client.heyreachApiKey}
                    detail={client.heyreachApiKey ? maskKey(client.heyreachApiKey) : undefined}
                    showFull={showKeys[`hr-${client.id}`]}
                    fullValue={client.heyreachApiKey}
                    onToggle={() => setShowKeys(p => ({ ...p, [`hr-${client.id}`]: !p[`hr-${client.id}`] }))}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </PlatformSection>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        required={required} placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
      />
    </div>
  );
}

function PlatformBadge({ label, connected, detail, showFull, fullValue, onToggle }: {
  label: string; connected: boolean; detail?: string;
  showFull?: boolean; fullValue?: string | null; onToggle?: () => void;
}) {
  return (
    <div className={`px-3 py-2 rounded-lg border text-sm ${connected ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"}`}>
      <div className="flex items-center justify-between">
        <span className={`font-medium ${connected ? "text-emerald-700" : "text-gray-500"}`}>{label}</span>
        {connected ? (
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        ) : (
          <span className="text-xs text-gray-400">Not connected</span>
        )}
      </div>
      {detail && (
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-gray-500 font-mono">
            {showFull && fullValue ? fullValue : detail}
          </span>
          {onToggle && (
            <button onClick={onToggle} className="p-0.5 hover:bg-white/50 rounded">
              {showFull ? <EyeOff className="w-3 h-3 text-gray-400" /> : <Eye className="w-3 h-3 text-gray-400" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
