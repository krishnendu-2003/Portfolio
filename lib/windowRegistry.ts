import type { ComponentType } from "react";
import DummyOne from "@/components/apps/DummyOne";
import DummyTwo from "@/components/apps/DummyTwo";

export type WindowRegistryEntry = {
  title: string;
  icon: string;
  component: ComponentType<{ windowId: string }>;
  defaultSize: { w: number; h: number };
  resizable?: boolean;
};

export const windowRegistry: Record<string, WindowRegistryEntry> = {
  "dummy-one": {
    title: "Dummy Window One",
    icon: "/icons/placeholder.svg",
    component: DummyOne,
    defaultSize: { w: 420, h: 300 },
    resizable: true,
  },
  "dummy-two": {
    title: "Dummy Window Two",
    icon: "/icons/placeholder.svg",
    component: DummyTwo,
    defaultSize: { w: 360, h: 240 },
    resizable: true,
  },
};
