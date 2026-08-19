"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useWindowStore } from "@/lib/windowStore";
import { useIconPositionsStore } from "@/lib/iconPositionsStore";
import { windowMeta } from "@/lib/windowMeta";
import { cases } from "@/content/cases";

type SubItem = { id: string; label: string };

type MenuItem =
  | { kind: "window"; id: string; label: string }
  | { kind: "action"; label: string; run: () => void }
  | { kind: "submenu"; label: string; items: SubItem[] }
  | { kind: "separator" };

export function StartMenu({
  onClose,
  anchorRef,
}: {
  onClose: () => void;
  anchorRef: RefObject<HTMLButtonElement | null>;
}) {
  const openWindow = useWindowStore((s) => s.openWindow);
  const resetLayout = useIconPositionsStore((s) => s.resetLayout);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const submenuRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [submenuOpen, setSubmenuOpen] = useState(false);

  const items: MenuItem[] = [
    {
      kind: "submenu",
      label: "Selected Work",
      items: cases.map((c) => ({ id: `case-${c.slug}`, label: c.title })),
    },
    { kind: "window", id: "about-me", label: "About Me" },
    { kind: "window", id: "what-i-do", label: "What I Do" },
    { kind: "window", id: "resume", label: "Résumé" },
    { kind: "window", id: "contact", label: "Contact" },
    { kind: "separator" },
    { kind: "window", id: "display-properties", label: "Display Properties" },
    { kind: "action", label: "Reset icon layout", run: resetLayout },
    { kind: "separator" },
    { kind: "window", id: "shutdown", label: "Shut Down…" },
  ];

  const focusableIndices = items
    .map((item, i) => (item.kind === "separator" ? -1 : i))
    .filter((i) => i !== -1);
  const submenuIndex = items.findIndex((item) => item.kind === "submenu");

  function close() {
    setSubmenuOpen(false);
    onClose();
    anchorRef.current?.focus();
  }

  useEffect(() => {
    itemRefs.current[focusableIndices[0]]?.focus();
    // Only run once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openById(id: string) {
    const meta = windowMeta[id];
    if (!meta) return;
    openWindow(id, { title: meta.title, w: meta.defaultSize.w, h: meta.defaultSize.h });
  }

  function activate(item: MenuItem) {
    if (item.kind === "window") openById(item.id);
    else if (item.kind === "action") item.run();
    else return;
    close();
  }

  function moveFocus(current: number, dir: 1 | -1) {
    const idx = focusableIndices.indexOf(current);
    const next =
      focusableIndices[(idx + dir + focusableIndices.length) % focusableIndices.length];
    itemRefs.current[next]?.focus();
  }

  function openSubmenu() {
    setSubmenuOpen(true);
    requestAnimationFrame(() => submenuRefs.current[0]?.focus());
  }

  function onItemKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, index: number, item: MenuItem) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveFocus(index, 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveFocus(index, -1);
        break;
      case "ArrowRight":
        if (item.kind === "submenu") {
          e.preventDefault();
          openSubmenu();
        }
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        close();
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (item.kind === "submenu") openSubmenu();
        else activate(item);
        break;
      default:
        break;
    }
  }

  function onSubmenuKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
    subItems: SubItem[]
  ) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        submenuRefs.current[(index + 1) % subItems.length]?.focus();
        break;
      case "ArrowUp":
        e.preventDefault();
        submenuRefs.current[(index - 1 + subItems.length) % subItems.length]?.focus();
        break;
      case "ArrowLeft":
        e.preventDefault();
        setSubmenuOpen(false);
        itemRefs.current[submenuIndex]?.focus();
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        close();
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        openById(subItems[index].id);
        close();
        break;
      default:
        break;
    }
  }

  return (
    <div
      ref={rootRef}
      role="menu"
      aria-label="Start menu"
      className="window absolute bottom-full left-0 z-[9999] mb-1 flex w-56 p-0"
    >
      <div
        aria-hidden="true"
        className="flex w-6 shrink-0 items-center justify-center py-2"
        style={{ background: "linear-gradient(180deg, #0c6aa8, #001a4d)" }}
      >
        <span
          className="text-xs font-bold tracking-wide whitespace-nowrap text-white"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Krishnendu OS
        </span>
      </div>
      <ul className="flex-1 list-none p-1 text-sm">
        {items.map((item, i) => {
          if (item.kind === "separator") {
            return (
              <li key={`sep-${i}`} role="separator" className="my-1 border-t border-gray-400" />
            );
          }
          return (
            <li key={`${item.kind}-${item.label}`} className="relative">
              <button
                type="button"
                role="menuitem"
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                tabIndex={-1}
                aria-haspopup={item.kind === "submenu" ? "true" : undefined}
                aria-expanded={item.kind === "submenu" ? submenuOpen : undefined}
                className="flex w-full items-center justify-between px-2 py-1 text-left hover:bg-[#000080] hover:text-white focus:bg-[#000080] focus:text-white focus:outline-none"
                onClick={() => {
                  if (item.kind === "submenu") openSubmenu();
                  else activate(item);
                }}
                onKeyDown={(e) => onItemKeyDown(e, i, item)}
                onMouseEnter={() => {
                  itemRefs.current[i]?.focus();
                  setSubmenuOpen(item.kind === "submenu");
                }}
              >
                <span>{item.label}</span>
                {item.kind === "submenu" && <span aria-hidden="true">▸</span>}
              </button>
              {item.kind === "submenu" && submenuOpen && (
                <ul
                  role="menu"
                  aria-label={item.label}
                  className="window absolute top-0 left-full ml-0.5 w-48 list-none p-1 text-sm"
                >
                  {item.items.map((sub, si) => (
                    <li key={sub.id}>
                      <button
                        type="button"
                        role="menuitem"
                        ref={(el) => {
                          submenuRefs.current[si] = el;
                        }}
                        tabIndex={-1}
                        className="w-full px-2 py-1 text-left hover:bg-[#000080] hover:text-white focus:bg-[#000080] focus:text-white focus:outline-none"
                        onClick={() => {
                          openById(sub.id);
                          close();
                        }}
                        onKeyDown={(e) => onSubmenuKeyDown(e, si, item.items)}
                      >
                        {sub.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
