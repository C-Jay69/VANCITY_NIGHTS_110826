import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { motion } from "motion/react";
import {
  LayoutDashboardIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  Trash2Icon,
  PlusIcon,
  MapPinIcon,
  Building2Icon,
  UsersIcon,
  StarIcon,
  MessageSquareTextIcon,
  DatabaseIcon,
  ChevronRightIcon,
} from "lucide-react";
import { api } from "@/convex/_generated/api.js";
import type { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import Navbar from "../_components/Navbar.tsx";
import Footer from "../_components/Footer.tsx";
import { cn } from "@/lib/utils";

const NEIGHBORHOODS = [
  "Gastown",
  "Downtown",
  "Granville Strip",
  "Chinatown",
  "Yaletown",
  "West End",
  "Mount Pleasant",
  "Commercial Drive",
  "Richmond",
  "Burnaby",
  "Surrey",
  "New Westminster",
  "North Vancouver",
  "West Vancouver",
  "Coquitlam",
  "Other",
];

const CATEGORY_OPTIONS = [
  { value: "bar", label: "Bar" },
  { value: "club", label: "Club" },
  { value: "casino", label: "Casino" },
  { value: "lounge", label: "Lounge" },
] as const;

const MODEL_OPTIONS = [
  {
    id: "google/gemma-4-31b-it:free",
    label: "Gemma 4 31B (free)",
    note: "Free tier — good default for casual use",
  },
  {
    id: "openai/gpt-4o-mini",
    label: "GPT-4o mini",
    note: "Fast, cheap, solid quality",
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    label: "Claude 3.5 Sonnet",
    note: "Best quality — premium pricing",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    label: "Llama 3.3 70B (free)",
    note: "Free tier, strong open-weight model",
  },
];

const KNOWLEDGE_CATEGORIES = [
  "area",
  "restaurant",
  "daytime",
  "bar",
  "club",
  "casino",
  "event",
  "tips",
];

const inputCls =
  "w-full px-3 py-2 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm";

type Tab = "dashboard" | "moderation" | "knowledge" | "settings";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboardIcon className="h-4 w-4" /> },
  { id: "moderation", label: "Moderation", icon: <ShieldCheckIcon className="h-4 w-4" /> },
  { id: "knowledge", label: "Knowledge", icon: <BookOpenIcon className="h-4 w-4" /> },
  { id: "settings", label: "NightShade", icon: <SparklesIcon className="h-4 w-4" /> },
];

export default function AdminPage() {
  const isAdmin = useQuery(api.admin.isAdmin);
  const [tab, setTab] = useState<Tab>("dashboard");

  if (isAdmin === undefined) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center space-y-4">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Checking access...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheckIcon className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Admins only</h1>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            This portal is restricted to VanCity Nights staff. If that's you,
            sign in with the admin account.
          </p>
          <div className="flex items-center justify-center gap-3">
            <SignInButton />
            <Link to="/" className="text-sm text-primary hover:text-primary/80">
              Back to site
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-24 pb-6 border-b border-border bg-card/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheckIcon className="h-4 w-4 text-primary" />
            <span className="text-xs uppercase tracking-widest text-primary font-semibold">
              Staff Portal
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">Admin Console</h1>
          <p className="text-muted-foreground mt-1">
            Approve submissions, curate NightShade's knowledge, and tune the assistant.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-8 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer whitespace-nowrap",
                tab === t.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "dashboard" && <DashboardTab />}
          {tab === "moderation" && <ModerationTab />}
          {tab === "knowledge" && <KnowledgeTab />}
          {tab === "settings" && <SettingsTab />}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

function DashboardTab() {
  const stats = useQuery(api.admin.dashboardStats);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Approved venues",
      value: stats.venues.approved,
      icon: <Building2Icon className="h-4 w-4" />,
    },
    {
      label: "Pending review",
      value: stats.venues.pending,
      icon: <ShieldCheckIcon className="h-4 w-4" />,
    },
    {
      label: "Rejected",
      value: stats.venues.rejected,
      icon: <XCircleIcon className="h-4 w-4" />,
    },
    {
      label: "Reviews",
      value: stats.reviews,
      icon: <MessageSquareTextIcon className="h-4 w-4" />,
    },
    {
      label: "Avg rating",
      value: stats.averageRating ? stats.averageRating.toFixed(2) : "—",
      icon: <StarIcon className="h-4 w-4" />,
    },
    {
      label: "Knowledge entries",
      value: stats.knowledge,
      icon: <DatabaseIcon className="h-4 w-4" />,
    },
    {
      label: "Signed-up users",
      value: stats.users,
      icon: <UsersIcon className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                {c.icon}
              </span>
              <span className="text-xs">{c.label}</span>
            </div>
            <span className="text-2xl font-bold">{c.value}</span>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Latest submissions</h2>
        {stats.recentSubmissions.length === 0 ? (
          <p className="text-sm text-muted-foreground rounded-xl border border-border bg-card p-6">
            No submissions waiting. When someone submits a spot it'll show up in
            the Moderation tab.
          </p>
        ) : (
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {stats.recentSubmissions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <MapPinIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.neighborhood} · spotted by {s.submitterHandle ?? "anonymous"}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">
                  Pending
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Moderation                                                          */
/* ------------------------------------------------------------------ */

function ModerationTab() {
  const pending = useQuery(api.admin.listPendingVenues);

  if (!pending) {
    return <div className="h-40 rounded-xl bg-muted/50 animate-pulse" />;
  }

  if (pending.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <CheckCircleIcon className="h-10 w-10 text-primary mx-auto mb-3" />
        <h3 className="font-semibold mb-1">Queue is clear</h3>
        <p className="text-sm text-muted-foreground">
          No submissions awaiting approval. Nice work.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {pending.length} submission{pending.length === 1 ? "" : "s"} waiting.
        Reword anything to match the brand, then approve.
      </p>
      {pending.map((venue) => (
        <PendingVenueCard key={venue._id} venue={venue} />
      ))}
    </div>
  );
}

function PendingVenueCard({ venue }: { venue: Doc<"venues"> }) {
  const approveVenue = useMutation(api.admin.approveVenue);
  const rejectVenue = useMutation(api.admin.rejectVenue);

  const [name, setName] = useState(venue.name);
  const [category, setCategory] = useState(venue.category);
  const [neighborhood, setNeighborhood] = useState(venue.neighborhood);
  const [address, setAddress] = useState(venue.address);
  const [description, setDescription] = useState(venue.description);
  const [whyItsAce, setWhyItsAce] = useState(venue.whyItsAce);
  const [imageUrls, setImageUrls] = useState(venue.imageUrls.join("\n"));
  const [isPremium, setIsPremium] = useState(venue.isPremium);
  const [isFeatured, setIsFeatured] = useState(venue.isFeatured);
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);

  const handleError = (err: unknown) => {
    if (err instanceof ConvexError) {
      const data = err.data as { message?: string };
      toast.error(data.message ?? "Something went wrong");
    } else {
      toast.error("Something went wrong");
    }
  };

  async function handleApprove() {
    setBusy("approve");
    try {
      await approveVenue({
        venueId: venue._id,
        name: name.trim(),
        category,
        neighborhood,
        address: address.trim(),
        description: description.trim(),
        whyItsAce: whyItsAce.trim(),
        imageUrls: imageUrls
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        isPremium,
        isFeatured,
      });
      toast.success(`Published "${name.trim()}"`);
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(null);
    }
  }

  async function handleReject() {
    setBusy("reject");
    try {
      await rejectVenue({ venueId: venue._id });
      toast.success(`Rejected "${venue.name}"`);
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            Spotted by{" "}
            <span className="text-primary">{venue.submitterHandle ?? "anonymous"}</span>
          </p>
          <p className="font-semibold">{venue.name}</p>
        </div>
        <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full shrink-0">
          Pending
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Name</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Category</label>
          <select
            className={cn(inputCls, "cursor-pointer")}
            value={category}
            onChange={(e) => setCategory(e.target.value as Doc<"venues">["category"])}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Neighbourhood</label>
          <select
            className={cn(inputCls, "cursor-pointer")}
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
          >
            {NEIGHBORHOODS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Address</label>
          <input className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">Description</label>
        <textarea
          className={cn(inputCls, "resize-none")}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">Why it's ace</label>
        <textarea
          className={cn(inputCls, "resize-none")}
          rows={2}
          value={whyItsAce}
          onChange={(e) => setWhyItsAce(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          Photo URLs (one per line)
        </label>
        <textarea
          className={cn(inputCls, "resize-none font-mono text-xs")}
          rows={3}
          value={imageUrls}
          onChange={(e) => setImageUrls(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="accent-primary"
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isPremium}
            onChange={(e) => setIsPremium(e.target.checked)}
            className="accent-primary"
          />
          Premium
        </label>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button
          onClick={handleApprove}
          disabled={busy !== null || !name.trim()}
          className="flex-1 sm:flex-none"
        >
          {busy === "approve" ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <CheckCircleIcon className="h-4 w-4" />
          )}
          {busy === "approve" ? "Publishing..." : "Approve & Publish"}
        </Button>
        <Button
          onClick={handleReject}
          disabled={busy !== null}
          variant="outline"
          className="text-destructive hover:text-destructive"
        >
          {busy === "reject" ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <XCircleIcon className="h-4 w-4" />
          )}
          Reject
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Knowledge                                                           */
/* ------------------------------------------------------------------ */

function KnowledgeTab() {
  const entries = useQuery(api.knowledge.list);
  const addKnowledge = useMutation(api.knowledge.add);
  const removeKnowledge = useMutation(api.knowledge.remove);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("area");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleAdd() {
    if (!title.trim() || !content.trim()) return;
    setBusy(true);
    try {
      await addKnowledge({
        title: title.trim(),
        category,
        content: content.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setTitle("");
      setContent("");
      setTags("");
      toast.success("Knowledge entry added");
    } catch (err) {
      toast.error(
        err instanceof ConvexError
          ? ((err.data as { message?: string }).message ?? "Failed to add")
          : "Failed to add",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Add form */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3 h-fit">
        <h3 className="font-semibold flex items-center gap-2">
          <PlusIcon className="h-4 w-4 text-primary" />
          Add knowledge
        </h3>
        <p className="text-xs text-muted-foreground">
          These entries are fed to NightShade on every answer, so keep them
          short and factual.
        </p>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Title</label>
          <input
            className={inputCls}
            placeholder="e.g. Best late-night food near the Strip"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Category</label>
            <select
              className={cn(inputCls, "cursor-pointer")}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {KNOWLEDGE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Tags (comma separated)
            </label>
            <input
              className={inputCls}
              placeholder="food, granville, late-night"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Content</label>
          <textarea
            className={cn(inputCls, "resize-none")}
            rows={4}
            placeholder="What should NightShade know about this?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <Button
          onClick={handleAdd}
          disabled={busy || !title.trim() || !content.trim()}
          className="w-full"
        >
          {busy ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <PlusIcon className="h-4 w-4" />
          )}
          Add entry
        </Button>
      </div>

      {/* Existing entries */}
      <div className="space-y-3">
        <h3 className="font-semibold">
          Existing entries ({entries?.length ?? "…"})
        </h3>
        {!entries ? (
          <div className="h-32 rounded-xl bg-muted/50 animate-pulse" />
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground rounded-xl border border-border bg-card p-6">
            Nothing here yet. Add your first knowledge entry.
          </p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry._id}
              className="rounded-xl border border-border bg-card p-4 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {entry.category}
                  </span>
                  <h4 className="font-semibold text-sm truncate">{entry.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {entry.content}
                </p>
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {entry.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={async () => {
                  await removeKnowledge({ id: entry._id }).catch((err) =>
                    toast.error(
                      err instanceof ConvexError
                        ? ((err.data as { message?: string }).message ?? "Failed")
                        : "Failed",
                    ),
                  );
                }}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer transition-colors shrink-0"
                aria-label={`Delete ${entry.title}`}
              >
                <Trash2Icon className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* NightShade settings                                                 */
/* ------------------------------------------------------------------ */

function SettingsTab() {
  const model = useQuery(api.settings.get, { key: "nights_model" });
  const setSetting = useMutation(api.settings.set);

  const [selected, setSelected] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const current = selected ?? model ?? "google/gemma-4-31b-it:free";
  const useCustom = selected === "__custom__";

  async function handleSave() {
    const value = useCustom ? custom.trim() : selected;
    if (!value) return;
    setBusy(true);
    try {
      await setSetting({ key: "nights_model", value });
      setSelected(value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast.success(`NightShade is now running on ${value}`);
    } catch (err) {
      toast.error(
        err instanceof ConvexError
          ? ((err.data as { message?: string }).message ?? "Failed to save")
          : "Failed to save",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="rounded-xl border border-border bg-card p-5 space-y-4 h-fit">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Model selection</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Choose which OpenRouter model powers NightShade. This applies to every
          visitor instantly — no redeploy needed.
        </p>

        <div className="space-y-2">
          {MODEL_OPTIONS.map((m) => (
            <label
              key={m.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                current === m.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-foreground/30",
              )}
            >
              <input
                type="radio"
                name="model"
                checked={current === m.id}
                onChange={() => setSelected(m.id)}
                className="mt-1 accent-primary"
              />
              <div>
                <p className="text-sm font-medium">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.note}</p>
              </div>
            </label>
          ))}
          <label
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
              useCustom
                ? "border-primary bg-primary/5"
                : "border-border hover:border-foreground/30",
            )}
          >
            <input
              type="radio"
              name="model"
              checked={useCustom}
              onChange={() => setSelected("__custom__")}
              className="mt-1 accent-primary"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">Custom model id</p>
              <input
                className={cn(inputCls, "mt-2")}
                placeholder="provider/model:deployment"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected("__custom__");
                }}
              />
            </div>
          </label>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button onClick={handleSave} disabled={busy || (!useCustom && !selected)}>
            {busy ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : saved ? (
              <CheckCircleIcon className="h-4 w-4" />
            ) : null}
            {saved ? "Saved!" : busy ? "Saving..." : "Save model"}
          </Button>
          <span className="text-xs text-muted-foreground">
            Currently:{" "}
            <code className="text-foreground">{model ?? "OPENROUTER_MODEL env"}</code>
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-3 h-fit">
        <div className="flex items-center gap-2">
          <MessageSquareTextIcon className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">How NightShade works</h3>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <ChevronRightIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            Answers come from the approved venue list plus your knowledge
            entries.
          </li>
          <li className="flex items-start gap-2">
            <ChevronRightIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            It only talks about what's in the knowledge base — if it doesn't
            know, it says so.
          </li>
          <li className="flex items-start gap-2">
            <ChevronRightIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            Free models (e.g. Gemma) are fine for testing; pick a premium model
            like Claude 3.5 Sonnet for the best answers.
          </li>
          <li className="flex items-start gap-2">
            <ChevronRightIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            Use the Knowledge tab to teach it about Vancouver — areas, food,
            events, and tips.
          </li>
        </ul>
      </div>
    </div>
  );
}