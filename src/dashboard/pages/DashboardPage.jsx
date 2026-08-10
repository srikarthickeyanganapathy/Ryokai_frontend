import React from "react";
import { useMissionControlViewModel } from "../hooks/useMissionControlViewModel";
import { MissionControlV2 } from "./MissionControlView";
import { PageShell } from "@/shared/ui/PageShell";
import { PageState } from "@/shared/ui/PageState";

export function DashboardPage() {
  const vm = useMissionControlViewModel();

  return (
    <PageShell maxWidth="wide">
      <PageState state={vm.pageState || "ready"} moduleId="tasks">
        <MissionControlV2 vm={vm} />
      </PageState>
    </PageShell>
  );
}
