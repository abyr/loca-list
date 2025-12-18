/**
 * useKeyboardShortcuts.ts
 *
 * A custom React hook to manage keyboard shortcuts within a specified scope or globally.
 * It allows defining key combinations and their associated handlers, with options for
 * preventing default behavior, stopping propagation, and enabling/disabling shortcuts.
 *
 * import React, { useRef } from "react";
 *
 * import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
 *
 * Example usage:useKeyboardShortcuts(
 * {
 *     "e": {
 *      handler: () => exportTasks(tasks),
 *     },
 * },
 *   // { scopeRef: ref }
 * );
 *
 * <div ref={ref} >
 */
import { useEffect, useRef, useCallback } from "react";

type KeyCombo = string;
type Handler = (event: KeyboardEvent) => void;

export type ShortcutOptions = {
  preventDefault?: boolean;
  stopPropagation?: boolean;
  enabled?: boolean;
  allowInInputs?: boolean;
};

export type ShortcutMap = {
  [combo: string]: {
    handler: Handler;
    options?: ShortcutOptions;
  };
};

function normalizeKey(key: string) {
  const k = key.trim();
  return k
    .replace(/\bcontrol\b/i, "Ctrl")
    .replace(/\bctrl\b/i, "Ctrl")
    .replace(/\bmeta\b/i, "Meta")
    .replace(/\bcmd\b/i, "Meta")
    .replace(/\bcommand\b/i, "Meta")
    .replace(/\balt\b/i, "Alt")
    .replace(/\boption\b/i, "Alt")
    .replace(/\bshift\b/i, "Shift");
}

function parseCombo(combo: KeyCombo) {
  const parts = combo.split("+").map((p) => p.trim()).filter(Boolean);
  const mods = new Set<string>();
  let key = "";
  for (const p of parts) {
    const u = normalizeKey(p);
    if (/^(Ctrl|Alt|Shift|Meta)$/i.test(u)) mods.add(u);
    else key = u.length === 1 ? u.toLowerCase() : u;
  }
  return { mods, key };
}

function eventMatchesCombo(ev: KeyboardEvent, comboDef: ReturnType<typeof parseCombo>) {
  const { mods, key } = comboDef;
  if (mods.has("Ctrl") !== Boolean(ev.ctrlKey)) return false;
  if (mods.has("Alt") !== Boolean(ev.altKey)) return false;
  if (mods.has("Shift") !== Boolean(ev.shiftKey)) return false;
  if (mods.has("Meta") !== Boolean(ev.metaKey)) return false;
  const codeKey = ev.key;
  if (!key) return true;
  if (key.length === 1) return codeKey.toLowerCase() === key;
  return codeKey.toLowerCase() === key.toLowerCase();
}

function isEditableElement(target: EventTarget | null) {
  if (!target || !(target instanceof Element)) return false;
  const tag = (target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea") return true;
  if (target.hasAttribute && target.hasAttribute("contenteditable")) return true;
  if (target instanceof HTMLInputElement) return target.type !== "hidden";
  return false;
}

export function useKeyboardShortcuts<E extends HTMLElement = HTMLElement>(
  shortcuts: ShortcutMap,
  { scopeRef, global = false, enabled = true }: {
    scopeRef?: React.RefObject<E | null>;
    global?: boolean;
    enabled?: boolean;
  } = {}
) {
  const parsedRef = useRef<Record<string, ReturnType<typeof parseCombo>>>({});
  const handlersRef = useRef<Record<string, { handler: Handler; options: Required<ShortcutOptions> }>>({});

  useEffect(() => {
    const parsed: typeof parsedRef.current = {};
    const handlers: typeof handlersRef.current = {};
    for (const comboRaw of Object.keys(shortcuts)) {
      const combo = comboRaw.trim();
      parsed[combo] = parseCombo(combo);
      const def = shortcuts[comboRaw];
      handlers[combo] = {
        handler: def.handler,
        options: {
          preventDefault: def.options?.preventDefault ?? false,
          stopPropagation: def.options?.stopPropagation ?? false,
          enabled: def.options?.enabled ?? true,
          allowInInputs: def.options?.allowInInputs ?? false,
        },
      };
    }
    parsedRef.current = parsed;
    handlersRef.current = handlers;
  }, [shortcuts]);

  const listener = useCallback(
    (ev: KeyboardEvent) => {
      if (!enabled) return;
      const target = ev.target;
      for (const combo of Object.keys(parsedRef.current)) {
        const parsed = parsedRef.current[combo];
        const h = handlersRef.current[combo];
        if (!h || !h.options.enabled) continue;
        if (!h.options.allowInInputs && isEditableElement(target)) continue;
        if (eventMatchesCombo(ev, parsed)) {
          if (h.options.preventDefault) ev.preventDefault();
          if (h.options.stopPropagation) ev.stopPropagation();
          try {
            h.handler(ev);
          } catch (err) {
            // swallow errors
            // eslint-disable-next-line no-console
            console.error("Shortcut handler error", err);
          }
          break;
        }
      }
    },
    [enabled]
  );

  useEffect(() => {
    const el = scopeRef?.current;
    const attachTarget: EventTarget = global || !el ? document : el;
    attachTarget.addEventListener("keydown", listener as EventListener);
    return () => {
      attachTarget.removeEventListener("keydown", listener as EventListener);
    };
  }, [listener, scopeRef, global]);
}
