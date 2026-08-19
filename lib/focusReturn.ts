const returnTargets = new Map<string, HTMLElement>();

export function rememberFocusOrigin(windowId: string, el: HTMLElement | null) {
  if (el) returnTargets.set(windowId, el);
}

export function restoreFocusOrigin(windowId: string) {
  const el = returnTargets.get(windowId);
  returnTargets.delete(windowId);
  if (el && document.contains(el)) el.focus();
}
