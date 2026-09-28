"use client";

import React, { useState, useMemo } from "react";
import { Search, Check, X, Building2, MapPin, CheckCheck, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface FranchiseOption {
  id: string;
  name: string;
  subdomain: string;
  centerCode?: string | null;
  district?: string | null;
  state?: string | null;
}

interface FranchiseMultiSelectProps {
  workspaces: FranchiseOption[];
  selectedWorkspaceIds: string[];
  onChange: (ids: string[]) => void;
  className?: string;
  placeholder?: string;
}

export function FranchiseMultiSelect({
  workspaces,
  selectedWorkspaceIds,
  onChange,
  className,
  placeholder = "Search centers by name, code, city...",
}: FranchiseMultiSelectProps) {
  const [search, setSearch] = useState("");

  const filteredWorkspaces = useMemo(() => {
    if (!search.trim()) return workspaces;
    const q = search.toLowerCase();
    return workspaces.filter((ws) => {
      const matchName = ws.name?.toLowerCase().includes(q);
      const matchCode = ws.centerCode?.toLowerCase().includes(q);
      const matchSubdomain = ws.subdomain?.toLowerCase().includes(q);
      const matchDistrict = ws.district?.toLowerCase().includes(q);
      const matchState = ws.state?.toLowerCase().includes(q);
      return matchName || matchCode || matchSubdomain || matchDistrict || matchState;
    });
  }, [workspaces, search]);

  const handleToggle = (id: string) => {
    if (selectedWorkspaceIds.includes(id)) {
      onChange(selectedWorkspaceIds.filter((item) => item !== id));
    } else {
      onChange([...selectedWorkspaceIds, id]);
    }
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredWorkspaces.map((ws) => ws.id);
    const combined = Array.from(new Set([...selectedWorkspaceIds, ...filteredIds]));
    onChange(combined);
  };

  const handleClearSelection = () => {
    onChange([]);
  };

  const selectedWorkspaces = useMemo(() => {
    return workspaces.filter((ws) => selectedWorkspaceIds.includes(ws.id));
  }, [workspaces, selectedWorkspaceIds]);

  return (
    <div className={cn("space-y-2.5", className)}>
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="h-8 pl-8 pr-7 text-xs bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAllFiltered}
            disabled={filteredWorkspaces.length === 0}
            className="h-7 px-2 text-[11px] font-semibold text-primary hover:bg-primary/5 rounded-md gap-1"
          >
            <CheckCheck className="h-3 w-3" />
            <span>Select Filtered ({filteredWorkspaces.length})</span>
          </Button>

          {selectedWorkspaceIds.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="h-7 px-2 text-[11px] font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear ({selectedWorkspaceIds.length})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Selected Chips Preview */}
      {selectedWorkspaces.length > 0 && (
        <div className="p-2 rounded-lg bg-primary/5 border border-primary/15 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-primary">
            <span>Selected Franchise Centers ({selectedWorkspaces.length})</span>
            <span className="text-[10px] text-slate-400 font-normal">Click × to remove</span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pr-1">
            {selectedWorkspaces.map((ws) => (
              <span
                key={ws.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-2xs"
              >
                <span>{ws.name}</span>
                {ws.centerCode && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                    {ws.centerCode}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleToggle(ws.id)}
                  className="hover:text-rose-500 transition-colors ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable Center Selection List */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
        <div className="max-h-[190px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar">
          {filteredWorkspaces.map((ws) => {
            const isSelected = selectedWorkspaceIds.includes(ws.id);
            return (
              <div
                key={ws.id}
                onClick={() => handleToggle(ws.id)}
                className={cn(
                  "p-2.5 flex items-center justify-between gap-2.5 cursor-pointer transition-colors text-left select-none",
                  isSelected
                    ? "bg-primary/5 dark:bg-primary/10 hover:bg-primary/10"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      "h-4 w-4 rounded border flex items-center justify-center transition-colors shrink-0",
                      isSelected
                        ? "bg-primary border-primary text-white"
                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {ws.name}
                      </span>
                      {ws.centerCode && (
                        <Badge
                          variant="outline"
                          className="text-[9px] font-mono font-bold px-1 py-0 h-4 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                        >
                          {ws.centerCode}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      <span className="font-mono text-slate-400">{ws.subdomain}</span>
                      {(ws.district || ws.state) && (
                        <span className="flex items-center gap-0.5 truncate">
                          <MapPin className="h-2.5 w-2.5 shrink-0 text-slate-400" />
                          <span>
                            {[ws.district, ws.state].filter(Boolean).join(", ")}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider shrink-0 px-1.5 py-0.5 rounded",
                    isSelected
                      ? "text-primary bg-primary/10"
                      : "text-slate-400"
                  )}
                >
                  {isSelected ? "Selected" : "Add"}
                </span>
              </div>
            );
          })}

          {filteredWorkspaces.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-xs">
              <Building2 className="h-7 w-7 mx-auto mb-1.5 opacity-40" />
              <span>No franchise centers matching "{search}"</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
