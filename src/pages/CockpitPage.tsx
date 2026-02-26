import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Target,
  Pencil,
  ChevronRight,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMission } from "@/hooks/useMission";
import { useTasks } from "@/hooks/useTasks";
import { toast } from "sonner";
import type { Build } from "@/hooks/useBuilds";
import ShippingLog from "@/components/ShippingLog";
import DecisionVault from "@/components/DecisionVault";
import SessionDebrief from "@/components/SessionDebrief";
import ExecutionBoard from "@/components/ExecutionBoard";

type CockpitTab = "execute" | "log" | "decisions" | "debrief";

const CockpitPage = () => {
  const { buildId } = useParams<{ buildId: string }>();
  const navigate = useNavigate();
  const [build, setBuild] = useState<Build | null>(null);
  const [buildLoading, setBuildLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<CockpitTab>("execute");

  // Mission
  const { mission, loading: missionLoading, upsertMission } = useMission(buildId!);
  const [editingMission, setEditingMission] = useState(false);
  const [missionDraft, setMissionDraft] = useState({ priority: "", next_step: "", time_estimate: "" });

  // Tasks
  const taskHook = useTasks(buildId!);

  // Fetch build info
  useEffect(() => {
    if (!buildId) return;
    (async () => {
      const { data } = await supabase.from("builds").select("*").eq("id", buildId).single();
      if (data) setBuild(data as Build);
      setBuildLoading(false);
    })();
  }, [buildId]);

  useEffect(() => {
    if (mission) {
      setMissionDraft({
        priority: mission.priority,
        next_step: mission.next_step,
        time_estimate: mission.time_estimate || "",
      });
    }
  }, [mission]);

  const handleSaveMission = async () => {
    if (!missionDraft.priority.trim()) { toast.error("Set a current priority"); return; }
    const ok = await upsertMission({
      priority: missionDraft.priority.trim(),
      next_step: missionDraft.next_step.trim(),
      time_estimate: missionDraft.time_estimate.trim() || undefined,
    });
    if (ok) { setEditingMission(false); toast.success("Mission updated"); }
    else { toast.error("Couldn't save mission"); }
  };


  if (buildLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted/50 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!build) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-muted-foreground">Project not found.</p>
        <button onClick={() => navigate("/log")} className="mt-4 text-sm text-primary underline">Back to projects</button>
      </div>
    );
  }

  const tabs: { key: CockpitTab; label: string }[] = [
    { key: "execute", label: "Execute" },
    { key: "log", label: "Ship Log" },
    { key: "decisions", label: "Decisions" },
    { key: "debrief", label: "Debrief" },
  ];


  return (
    <div className="max-w-3xl mx-auto">
      {/* Back + title */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6">
        <button onClick={() => navigate("/log")} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3">
          <ArrowLeft size={14} /> Projects
        </button>
        <h2 className="font-heading text-3xl text-foreground leading-tight">{build.name}</h2>
        {build.description && <p className="text-sm text-muted-foreground mt-1">{build.description}</p>}
      </motion.div>

      {/* Current Mission — always visible */}
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }} className="card-glass p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Target size={15} className="text-muted-foreground" /> Current Mission
          </h3>
          {!editingMission && (
            <button onClick={() => setEditingMission(true)} className="rounded-full px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              <Pencil size={12} />
            </button>
          )}
        </div>

        {missionLoading ? (
          <div className="animate-pulse space-y-2"><div className="h-5 bg-muted rounded w-2/3" /><div className="h-4 bg-muted rounded w-1/2" /></div>
        ) : editingMission || !mission ? (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Active priority</label>
              <input type="text" placeholder="What's the one thing to focus on?" value={missionDraft.priority} onChange={(e) => setMissionDraft((d) => ({ ...d, priority: e.target.value }))} className="w-full rounded-lg bg-secondary/50 border-0 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20" autoFocus />
            </div>
            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Next atomic step</label>
              <input type="text" placeholder="Smallest move forward" value={missionDraft.next_step} onChange={(e) => setMissionDraft((d) => ({ ...d, next_step: e.target.value }))} className="w-full rounded-lg bg-secondary/50 border-0 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">Time estimate (optional)</label>
              <input type="text" placeholder="e.g. 30 min" value={missionDraft.time_estimate} onChange={(e) => setMissionDraft((d) => ({ ...d, time_estimate: e.target.value }))} className="w-full rounded-lg bg-secondary/50 border-0 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/20" />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button onClick={handleSaveMission} disabled={!missionDraft.priority.trim()} className="rounded-full px-4 py-2 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40">Lock in</button>
              {mission && (
                <button onClick={() => { setEditingMission(false); setMissionDraft({ priority: mission.priority, next_step: mission.next_step, time_estimate: mission.time_estimate || "" }); }} className="rounded-full px-3 py-2 text-xs text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-base font-medium text-foreground leading-snug">{mission.priority}</p>
            {mission.next_step && <p className="text-sm text-muted-foreground flex items-center gap-1.5"><ChevronRight size={12} className="shrink-0" />{mission.next_step}</p>}
            {mission.time_estimate && <p className="text-xs text-muted-foreground/60 flex items-center gap-1.5"><Clock size={11} /> {mission.time_estimate}</p>}
          </div>
        )}
      </motion.section>

      {/* Tab bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex gap-1 mb-4 bg-secondary/30 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all ${
              activeTab === tab.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Tab content */}
      <motion.section
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="card-glass p-5"
      >
        {activeTab === "execute" && (
          <ExecutionBoard
            tasks={taskHook.tasks}
            setTasks={taskHook.setTasks}
            byBucket={taskHook.byBucket}
            addTask={taskHook.addTask}
            updateTask={taskHook.updateTask}
            deleteTask={taskHook.deleteTask}
            reorderTasks={taskHook.reorderTasks}
            loading={taskHook.loading}
          />
        )}
        {activeTab === "log" && <ShippingLog buildId={buildId!} />}
        {activeTab === "decisions" && <DecisionVault buildId={buildId!} />}
        {activeTab === "debrief" && <SessionDebrief buildId={buildId!} />}
      </motion.section>
    </div>
  );
};

export default CockpitPage;
