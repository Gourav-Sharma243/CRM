import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Sparkles, GripVertical, Building2, TrendingUp, Layers, Target, DollarSign } from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { DateRangePicker } from "../components/common/DateRangePicker";
import { LeadDrawer } from "../components/leads/LeadDrawer";
import { LeadFormDialog } from "../components/leads/LeadFormDialog";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { Spinner, Avatar, Badge, Card } from "../components/ui";
import { leadsApi, aiApi } from "../lib/services";
import { currency } from "../lib/format";
import { PIPELINE_STAGES, STAGE_STYLES, PRIORITY_STYLES } from "../lib/constants";
import { cn } from "../lib/utils";
import { toast } from "sonner";

/* Group a flat lead list into { stage: Lead[] } buckets safely. */
const toBoard = (leads) => {
  const board = Object.fromEntries(PIPELINE_STAGES.map((s) => [s, []]));
  for (const l of (leads || [])) {
    if (!l) continue;
    const stage = PIPELINE_STAGES.includes(l.status) ? l.status : "New";
    board[stage].push(l);
  }
  return board;
};

export default function Pipeline() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rawLeads, setRawLeads] = useState(null);
  const [dateRange, setDateRange] = useState({ preset: "all", start: "", end: "" });
  const [board, setBoard] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const [drawerLead, setDrawerLead] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Require moving 8px before drag activates. This prevents accidental drag
  // and allows standard clicking anywhere on the card to open lead details.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const reloadLeads = useCallback(() => {
    leadsApi
      .list()
      .then((res) => {
        const list = res?.leads || [];
        setRawLeads(list);
        setBoard(toBoard(list));
        if (drawerLead) {
          const updated = list.find((l) => l?._id === drawerLead._id);
          if (updated) setDrawerLead(updated);
        }
      })
      .catch(() => {
        setRawLeads([]);
        setBoard(toBoard([]));
      });
  }, [drawerLead]);

  useEffect(() => {
    reloadLeads();
  }, []);

  /* ── Deep link auto-open via ?leadId=... ───────────────────────────── */
  useEffect(() => {
    const leadId = searchParams.get("leadId");
    if (leadId && rawLeads) {
      const match = rawLeads.find((l) => l?._id === leadId);
      if (match) setDrawerLead(match);
    }
  }, [searchParams, rawLeads]);

  const handleDrawerClose = () => {
    setDrawerLead(null);
    if (searchParams.get("leadId")) {
      const next = new URLSearchParams(searchParams);
      next.delete("leadId");
      setSearchParams(next, { replace: true });
    }
  };

  const openEdit = (lead) => {
    setEditing(lead);
    setFormOpen(true);
  };

  const handleSaved = () => {
    reloadLeads();
    setFormOpen(false);
    setEditing(null);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await leadsApi.remove(toDelete._id);
      toast.success("Lead removed");
      setToDelete(null);
      if (drawerLead?._id === toDelete._id) {
        handleDrawerClose();
      }
      reloadLeads();
    } catch (err) {
      toast.error(err?.message || "Failed to delete lead");
    } finally {
      setDeleting(false);
    }
  };

  /* ── Timeline date filtering ────────────────────────────────────────── */
  const effectiveLeads = useMemo(() => {
    if (!rawLeads) return [];
    if (!dateRange.start && !dateRange.end) return rawLeads;

    const start = dateRange.start ? new Date(dateRange.start + "T00:00:00").getTime() : 0;
    const end = dateRange.end ? new Date(dateRange.end + "T23:59:59.999").getTime() : Infinity;

    return rawLeads.filter((l) => {
      if (!l) return false;
      const d = new Date(l.createdAt || l.updatedAt).getTime();
      return !Number.isNaN(d) && d >= start && d <= end;
    });
  }, [rawLeads, dateRange]);

  useEffect(() => {
    if (rawLeads) {
      setBoard(toBoard(effectiveLeads));
    }
  }, [effectiveLeads]);

  if (!board) return <Spinner />;

  // Safely find which container an ID belongs to (either a stage name or a lead's _id)
  const findContainer = (id, b = board) => {
    if (!id || !b) return null;
    if (id in b) return id;
    return PIPELINE_STAGES.find((s) => (b[s] || []).some((l) => l && l._id === id)) || null;
  };

  const activeLead = activeId
    ? Object.values(board || {}).flat().find((l) => l && l._id === activeId)
    : null;

  /* Persist ordering and stage updates to the backend */
  const persistBoard = (nextBoard) => {
    const updates = [];
    PIPELINE_STAGES.forEach((stage) => {
      (nextBoard[stage] || []).forEach((l, order) => {
        if (l && l._id) {
          updates.push({ id: l._id, status: stage, order });
        }
      });
    });

    leadsApi.reorder(updates).catch(() => toast.error("Could not save pipeline"));

    // Sync rawLeads in memory
    setRawLeads((prevLeads) =>
      prevLeads
        ? prevLeads.map((item) => {
            const u = updates.find((x) => x.id === item?._id);
            return u ? { ...item, status: u.status } : item;
          })
        : prevLeads
    );
  };

  /* Atomically resolve drops when drag completes */
  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over || !active) return;
    if (active.id === over.id) return;

    setBoard((prev) => {
      if (!prev) return prev;
      const fromStage = findContainer(active.id, prev);
      const toStage = findContainer(over.id, prev);

      if (!fromStage || !toStage) return prev;

      let next;

      // Reordering within the same column
      if (fromStage === toStage) {
        const items = [...(prev[fromStage] || [])];
        const oldIdx = items.findIndex((l) => l && l._id === active.id);
        const newIdx = items.findIndex((l) => l && l._id === over.id);

        if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return prev;

        const reordered = arrayMove(items, oldIdx, newIdx);
        next = { ...prev, [fromStage]: reordered };
      } else {
        // Moving between different stages
        const sourceItems = (prev[fromStage] || []).filter(
          (l) => l && l._id !== active.id
        );
        const draggedLead = (prev[fromStage] || []).find(
          (l) => l && l._id === active.id
        );

        if (!draggedLead) return prev;

        const updatedLead = { ...draggedLead, status: toStage };
        const destItems = (prev[toStage] || []).filter(
          (l) => l && l._id !== active.id
        );

        const overIdx = destItems.findIndex((l) => l && l._id === over.id);
        const insertIdx = overIdx >= 0 ? overIdx : destItems.length;

        destItems.splice(insertIdx, 0, updatedLead);

        next = {
          ...prev,
          [fromStage]: sourceItems,
          [toStage]: destItems,
        };
      }

      persistBoard(next);
      return next;
    });
  };

  /* ── KPI computations ─────────────────────────────────────────────── */
  const allLeads = Object.values(board || {}).flat().filter(Boolean);
  const totalValue = allLeads.reduce((s, l) => s + (l?.value || 0), 0);
  const openDeals = allLeads.filter((l) => l?.status !== "Won" && l?.status !== "Lost");
  const wonLeads = allLeads.filter((l) => l?.status === "Won");
  const wonValue = wonLeads.reduce((s, l) => s + (l?.value || 0), 0);
  const closedCount = wonLeads.length + (board.Lost?.length || 0);
  const winRate = closedCount > 0 ? Math.round((wonLeads.length / closedCount) * 100) : 0;
  const hasDateFilter = Boolean(dateRange.preset !== "all" && (dateRange.start || dateRange.end));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline"
        subtitle={`${allLeads.length} leads · ${currency(totalValue, { compact: true })} in play`}
      >
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </PageHeader>

      {/* Active timeline filter indicator */}
      {hasDateFilter && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sky-50 px-3.5 py-2 text-xs text-sky-800 border border-sky-200 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-600 animate-pulse" />
            <span>
              Timeline active: <strong>{dateRange.start || "Any"}</strong> to{" "}
              <strong>{dateRange.end || "Any"}</strong> ({allLeads.length} deals in this view)
            </span>
          </div>
          <button
            onClick={() => setDateRange({ preset: "all", start: "", end: "" })}
            className="font-semibold text-sky-700 hover:text-sky-900 underline"
          >
            Reset timeline
          </button>
        </div>
      )}

      {/* KPI summary strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={DollarSign}
          tint="bg-brand-50 text-brand-600"
          label="Total pipeline"
          value={currency(totalValue, { compact: true })}
        />
        <StatTile
          icon={Layers}
          tint="bg-sky-50 text-sky-600"
          label="Open deals"
          value={openDeals.length}
        />
        <StatTile
          icon={Target}
          tint="bg-emerald-50 text-emerald-600"
          label="Won value"
          value={currency(wonValue, { compact: true })}
        />
        <StatTile
          icon={TrendingUp}
          tint="bg-violet-50 text-violet-600"
          label="Win rate"
          value={`${winRate}%`}
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }) => setActiveId(active?.id)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => (
            <Column
              key={stage}
              stage={stage}
              leads={board[stage] || []}
              onOpenLead={(lead) => setDrawerLead(lead)}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeLead ? <LeadCard lead={activeLead} overlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* Lead details drawer & dialogs */}
      <LeadDrawer
        open={Boolean(drawerLead)}
        onClose={handleDrawerClose}
        lead={drawerLead}
        onEdit={openEdit}
        onDelete={setToDelete}
      />
      <LeadFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        lead={editing}
        onSaved={handleSaved}
      />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this lead?"
        description={`"${toDelete?.name}" will be permanently removed.`}
      />
    </div>
  );
}

/* ── KPI stat tile (matches Leads page pattern) ─────────────────────── */
function StatTile({ icon: Icon, label, value, tint }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", tint)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-ink-soft">{label}</p>
          <p className="font-display text-lg font-bold text-ink">{value}</p>
        </div>
      </div>
    </Card>
  );
}

/* ── Column ─────────────────────────────────────────────────────────── */
function Column({ stage, leads = [], onOpenLead }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const style = STAGE_STYLES[stage] || STAGE_STYLES.New;
  const value = (leads || []).reduce((s, l) => s + (l?.value || 0), 0);

  return (
    <div className="flex w-80 shrink-0 flex-col">
      {/* Colored top accent bar */}
      <div className={cn("mb-2 h-1 w-full rounded-full", style.bar)} />

      {/* Column header */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-full", style.dot)} />
          <h3 className="text-sm font-semibold text-ink">{stage}</h3>
          <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-ink-soft shadow-sm border border-line">
            {leads.length}
          </span>
        </div>
        <span className="text-xs font-medium text-ink-soft">
          {currency(value, { compact: true })}
        </span>
      </div>

      {/* Droppable column body */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[60vh] flex-1 flex-col gap-3 rounded-3xl border-2 border-dashed border-transparent bg-surface-muted/60 p-3 transition",
          isOver && "border-brand-400 bg-brand-50/80 shadow-inner"
        )}
      >
        <SortableContext
          items={(leads || []).map((l) => l?._id).filter(Boolean)}
          strategy={verticalListSortingStrategy}
        >
          {(leads || []).map((lead) =>
            lead ? (
              <SortableCard key={lead._id} lead={lead} onOpen={onOpenLead} />
            ) : null
          )}
        </SortableContext>
        {leads.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-line/60 py-10">
            <p className="text-xs text-ink-soft">Drop deals here</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sortable card wrapper ──────────────────────────────────────────── */
function SortableCard({ lead, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lead._id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(isDragging && "opacity-30 pointer-events-none", "w-full min-w-0")}
      {...attributes}
      {...listeners}
    >
      <LeadCard
        lead={lead}
        onOpen={onOpen}
      />
    </div>
  );
}

/* ── Card UI ────────────────────────────────────────────────────────── */
function LeadCard({ lead, overlay, onOpen }) {
  const [suggesting, setSuggesting] = useState(false);

  // AI: suggest the next best action / priority for this lead.
  const suggest = async (e) => {
    e.stopPropagation();
    setSuggesting(true);
    try {
      const res = await aiApi.leadSummary({ leadId: lead._id });
      toast(`AI suggestion for ${lead.name}`, {
        description: `${res.nextBestAction} (suggested priority: ${res.suggestedPriority})`,
        duration: 7000,
      });
    } catch (err) {
      toast.error(err?.message || "AI unavailable");
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <div
      onClick={() => onOpen && onOpen(lead)}
      className={cn(
        "group flex flex-col justify-between rounded-2xl bg-surface p-3.5 shadow-[var(--shadow-soft)] transition border border-line/60 h-auto w-full min-w-0 select-none cursor-grab active:cursor-grabbing",
        overlay
          ? "shadow-[var(--shadow-pop)] rotate-2 border-brand-300 ring-2 ring-brand-500/20"
          : "hover:shadow-[var(--shadow-card)] hover:border-brand-300"
      )}
    >
      {/* Name / company row + visual drag indicator */}
      <div className="flex items-start justify-between gap-2.5 w-full">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <Avatar name={lead.name} size="sm" className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-ink leading-snug break-words group-hover:text-brand-600 transition-colors">
              {lead.name}
            </h4>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft truncate">
              <Building2 className="h-3 w-3 shrink-0 text-ink-soft/70" />
              <span className="truncate">{lead.company || "—"}</span>
            </p>
          </div>
        </div>
        <div
          className="text-ink-soft/40 transition group-hover:text-ink-soft shrink-0 mt-0.5 p-0.5 -mr-0.5"
          aria-hidden="true"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      {/* Value + priority */}
      <div className="mt-3.5 flex items-center justify-between pt-1 border-t border-line/40">
        <span className="text-sm font-bold text-ink">{currency(lead.value)}</span>
        <Badge className={cn(PRIORITY_STYLES[lead.priority], "shrink-0 font-medium")}>
          {lead.priority}
        </Badge>
      </div>

      {/* AI suggest button — appears on hover, hidden in DragOverlay */}
      {!overlay && (
        <button
          onClick={suggest}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={suggesting}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-50 py-1.5 text-xs font-medium text-brand-700 opacity-0 transition group-hover:opacity-100 hover:bg-brand-100 disabled:opacity-60 cursor-pointer"
        >
          <Sparkles className={cn("h-3.5 w-3.5", suggesting && "animate-pulse")} />
          {suggesting ? "Thinking…" : "AI suggest next step"}
        </button>
      )}
    </div>
  );
}
