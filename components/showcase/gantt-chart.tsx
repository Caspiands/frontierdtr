"use client";

import scheduleJson from "@/content/schedule.json";
import { Editable } from "@/components/showcase/editable";
import { useContent } from "@/components/showcase/content-context";
import { useUi } from "@/components/showcase/ui-context";
import type { DocNode, Schedule } from "@/lib/types";

const schedule = scheduleJson as Schedule;
const SPAN = 52;

function textOf(texts: Record<string, string>, id: string, fallback: string) {
  return texts[id] ?? fallback;
}

export function GanttSelect({ node }: { node: DocNode }) {
  const kind = node.a?.id === "gOwner" ? "owner" : "ws";
  const { texts, role } = useContent();
  const { ganttWs, ganttOwner, setGanttWs, setGanttOwner } = useUi();
  const all = textOf(texts, "gantt-all", "All");

  if (kind === "ws") {
    return (
      <>
        {role === "editor" ? (
          <span className="all-edit">
            All-workstreams label <Editable id="gantt-all" fallback="All" />
          </span>
        ) : null}
        <select
          id="gWs"
          value={ganttWs === "all" ? "" : String(ganttWs)}
          onChange={(event) => setGanttWs(event.target.value === "" ? "all" : Number(event.target.value))}
        >
          <option value="">{all}</option>
          {schedule.gantt.map((stream, index) => (
            <option key={stream.ws} value={index}>
              {textOf(texts, `g${index}-ws`, stream.ws)}
            </option>
          ))}
        </select>
      </>
    );
  }

  const owners: { index: number; label: string }[] = [];
  schedule.gantt.forEach((stream, index) => {
    const label = textOf(texts, `g${index}-owner`, stream.owner);
    if (!owners.some((owner) => owner.label === label)) owners.push({ index, label });
  });

  return (
    <select
      id="gOwner"
      value={ganttOwner === "all" ? "" : String(ganttOwner)}
      onChange={(event) => setGanttOwner(event.target.value === "" ? "all" : Number(event.target.value))}
    >
      <option value="">{all}</option>
      {owners.map((owner) => (
        <option key={owner.label} value={owner.index}>
          {owner.label}
        </option>
      ))}
    </select>
  );
}

export function GanttChart() {
  const { texts, role } = useContent();
  const { ganttWs, ganttOwner } = useUi();
  const selectedOwner =
    ganttOwner === "all" ? null : textOf(texts, `g${ganttOwner}-owner`, schedule.gantt[ganttOwner].owner);

  const visible = schedule.gantt
    .map((stream, index) => ({ stream, index }))
    .filter(({ stream, index }) => {
      if (ganttWs !== "all" && ganttWs !== index) return false;
      if (selectedOwner && textOf(texts, `g${index}-owner`, stream.owner) !== selectedOwner) return false;
      return true;
    });

  return (
    <>
      <div className="g-row g-head">
        <div className="g-lab">
          <Editable id="gantt-head" fallback="Workstream · task" />
        </div>
        <div className="g-track">
          {Array.from({ length: 13 }, (_, quarter) => {
            const start = quarter * 4 + 1;
            const end = start + 3;
            return (
              <span key={quarter}>
                <Editable id={`gantt-q${quarter}`} fallback={`W${start}–${end}`} />
              </span>
            );
          })}
        </div>
      </div>
      {visible.map(({ stream, index }) => (
        <div key={stream.ws}>
          <div className="g-row ws">
            <div className="g-lab">
              <Editable id={`g${index}-ws`} fallback={stream.ws} />
              <small>
                <Editable id={`g${index}-owner`} fallback={stream.owner} />
                {" · "}
                <Editable id={`g${index}-scope`} fallback={stream.scope} />
              </small>
            </div>
            <div className="g-track">
              {stream.gates.map((gate, gateIndex) => (
                <span
                  key={gate.label}
                  className="g-gate"
                  style={{ left: `${((gate.week - 0.5) / SPAN) * 100}%` }}
                  title={`Week ${gate.week} · ${textOf(texts, `g${index}-gate-${gateIndex}`, gate.label)}`}
                />
              ))}
            </div>
          </div>
          {stream.items.map((item, itemIndex) => {
            const label = textOf(texts, `g${index}-task-${itemIndex}`, item.name);
            const when = item.start === item.end ? `Week ${item.start}` : `Weeks ${item.start}–${item.end}`;
            return (
              <div className="g-row" key={`${index}-${itemIndex}`}>
                <div className="g-lab" title={label}>
                  <Editable id={`g${index}-task-${itemIndex}`} fallback={item.name} />
                </div>
                <div className="g-track">
                  <span
                    className={`g-bar ${item.kind}`}
                    style={{
                      left: `${((item.start - 1) / SPAN) * 100}%`,
                      width: `${((item.end - item.start + 1) / SPAN) * 100}%`,
                    }}
                    title={`${label} · ${when}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ))}
      {role === "editor" ? (
        <div className="editor-gates">
          <p>Gate labels, shown on the red diamonds</p>
          <div className="gate-edit">
            {schedule.gantt.flatMap((stream, index) =>
              stream.gates.map((gate, gateIndex) => (
                <span key={`${stream.ws}-${gate.label}`}>
                  Week {gate.week} · <Editable id={`g${index}-gate-${gateIndex}`} fallback={gate.label} />
                </span>
              )),
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
