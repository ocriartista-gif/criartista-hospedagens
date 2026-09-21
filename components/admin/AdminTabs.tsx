"use client";

import {
  Children,
  useId,
  useState,
  type ReactNode,
} from "react";

export type AdminTab = {
  key: string;
  label: string;
  hint?: string;
};

export function AdminTabs({
  tabs,
  children,
  defaultTab,
}: {
  tabs: AdminTab[];
  children: ReactNode;
  defaultTab?: string;
}) {
  const id = useId();
  const panels = Children.toArray(children);
  const initial =
    tabs.find((tab) => tab.key === defaultTab)?.key ?? tabs[0]?.key ?? "";
  const [active, setActive] = useState(initial);

  return (
    <div className="admin-tabs">
      <div className="admin-tab-list" role="tablist" aria-label="Seções">
        {tabs.map((tab) => {
          const selected = active === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`${id}-tab-${tab.key}`}
              aria-selected={selected}
              aria-controls={`${id}-panel-${tab.key}`}
              className={selected ? "active" : ""}
              onClick={() => setActive(tab.key)}
            >
              <span>{tab.label}</span>
              {tab.hint && <small>{tab.hint}</small>}
            </button>
          );
        })}
      </div>

      <div className="admin-tab-panels">
        {tabs.map((tab, index) => (
          <div
            key={tab.key}
            id={`${id}-panel-${tab.key}`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${tab.key}`}
            hidden={active !== tab.key}
            className="admin-tab-panel"
          >
            {panels[index] ?? null}
          </div>
        ))}
      </div>
    </div>
  );
}
