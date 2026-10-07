"use client";

import { useEffect, useRef } from "react";
import scheduleJson from "@/content/schedule.json";
import { Editable } from "@/components/showcase/editable";
import { useContent } from "@/components/showcase/content-context";
import type { Schedule } from "@/lib/types";

const schedule = scheduleJson as Schedule;

const HEADS = [
  { id: "wk-h-deliverables", fallback: "Deliverables", key: "deliverables" },
  { id: "wk-h-live", fallback: "Live", key: "live" },
  { id: "wk-h-measured", fallback: "Measured", key: "measured" },
  { id: "wk-h-gates", fallback: "Gates", key: "gates" },
] as const;

function WeekDetails({
  initiallyOpen,
  children,
}: {
  initiallyOpen: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (initiallyOpen && ref.current) ref.current.open = true;
  }, [initiallyOpen]);
  return (
    <details ref={ref} className="wk">
      {children}
    </details>
  );
}

export function WeekList() {
  const { role } = useContent();

  return (
    <>
      {schedule.weeks.map((week, index) => (
        <WeekDetails key={week.when} initiallyOpen={index < 2}>
          <summary
            onClick={(event) => {
              if (role === "editor" && (event.target as HTMLElement).closest("[data-edit]")) {
                event.preventDefault();
              }
            }}
          >
            <span className="w">
              <Editable id={`w${index}-when`} fallback={week.when} />
            </span>
            <b>
              <Editable id={`w${index}-title`} fallback={week.title} />
            </b>
            <span className="pill ph">
              <Editable id={`w${index}-phase`} fallback={week.phase} />
            </span>
          </summary>
          <div className="body">
            {HEADS.map((head) => {
              const items = week[head.key];
              const prefix = head.key === "deliverables" ? "d" : head.key === "live" ? "l" : head.key === "measured" ? "m" : "g";
              return (
                <div key={head.id}>
                  <h4>
                    <Editable id={head.id} fallback={head.fallback} />
                  </h4>
                  {items.length ? (
                    <ul>
                      {items.map((item, itemIndex) => (
                        <li key={`${prefix}-${itemIndex}`}>
                          <Editable id={`w${index}-${prefix}-${itemIndex}`} fallback={item} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">
                      <Editable id={`w${index}-${prefix}-empty`} fallback="—" />
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </WeekDetails>
      ))}
    </>
  );
}
