"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Building2, Search, Check, ChevronDown, X, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface WorkspaceOption {
  id: string;
  name: string;
  subdomain: string;
  centerCode: string | null;
  state: string | null;
}

interface InstituteSearchPickerProps {
  workspaces: WorkspaceOption[];
  selectedId: string;
  onSelect: (workspaceId: string) => void;
  disabled?: boolean;
}

export function InstituteSearchPicker({
  workspaces,
  selectedId,
  onSelect,
  disabled = false,
}: InstituteSearchPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Focus search on open
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectedWorkspace = useMemo(() => {
    if (selectedId === "all") return null;
    return workspaces.find((w) => w.id === selectedId);
  }, [selectedId, workspaces]);

  // High performance filtered list for 500-1000 institutes
  const filteredWorkspaces = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return workspaces.slice(0, 80); // Default to first 80 for speed

    return workspaces
      .filter((w) => {
        return (
          w.name.toLowerCase().includes(q) ||
          (w.centerCode && w.centerCode.toLowerCase().includes(q)) ||
          w.subdomain.toLowerCase().includes(q) ||
          (w.state && w.state.toLowerCase().includes(q))
        );
      })
      .slice(0, 80); // Cap at 80 for 60fps rendering
  }, [search, workspaces]);

  const handleSelectWorkspace = (id: string) => {
    onSelect(id);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative w-full sm:w-auto">
      {/* Trigger Button */}
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-8 sm:h-9 w-full sm:w-auto px-2.5 sm:px-3 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs flex items-center justify-between gap-2 max-w-full sm:max-w-[240px] md:max-w-[270px] truncate"
      >
        <div className="flex items-center gap-1.5 truncate min-w-0">
          {selectedId === "all" ? (
            <>
              <Globe className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span className="truncate font-semibold">All Centers (Global)</span>
            </>
          ) : (
            <>
              <Building2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">{selectedWorkspace?.name || "Selected Center"}</span>
              {selectedWorkspace?.centerCode && (
                <Badge
                  variant="outline"
                  className="text-[9px] font-bold px-1 py-0 h-4 border-indigo-200 text-indigo-600 shrink-0"
                >
                  {selectedWorkspace.centerCode}
                </Badge>
              )}
            </>
          )}
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="fixed inset-x-3 top-20 sm:absolute sm:inset-x-auto sm:top-full sm:left-0 sm:mt-1.5 z-50 sm:w-[340px] md:w-[380px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95">
          {/* Search Header */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="relative">
              <Search className="absolute inset-y-0 left-2.5 my-auto h-3.5 w-3.5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search by name, center code, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-7 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-2 my-auto h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 mt-1.5 font-medium">
              <span>{workspaces.length} Total Institutes</span>
              <span>{filteredWorkspaces.length} matching</span>
            </div>
          </div>

          {/* List options */}
          <div className="max-h-[260px] sm:max-h-[300px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/60 p-1">
            {/* Global option */}
            <button
              type="button"
              onClick={() => handleSelectWorkspace("all")}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors text-xs ${
                selectedId === "all"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600 shrink-0" />
                <div>
                  <div className="font-semibold">All Centers (Global Network)</div>
                  <div className="text-[10px] text-slate-400">View aggregate network traffic & leads</div>
                </div>
              </div>
              {selectedId === "all" && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
            </button>

            {/* Filtered Institutes list */}
            {filteredWorkspaces.length > 0 ? (
              filteredWorkspaces.map((ws) => {
                const isSelected = selectedId === ws.id;
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => handleSelectWorkspace(ws.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors text-xs ${
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold truncate">{ws.name}</span>
                        {ws.centerCode && (
                          <Badge
                            variant="outline"
                            className="text-[9px] font-bold px-1.5 py-0 border-indigo-200 text-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shrink-0"
                          >
                            {ws.centerCode}
                          </Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        {ws.state && <span>{ws.state} • </span>}
                        <span>{ws.subdomain}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No centers found matching &quot;{search}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
