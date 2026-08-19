/**
 * Guards §0 of the build spec: nothing inside components/apps/** may navigate
 * the page. An <a href="/..."> or <a href="#..."> is only legal here when
 * paired with an onClick that intercepts it (the §3 crawlable-link exception,
 * which must call preventDefault() + openWindow()).
 */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow internal <a href> navigation inside components/apps without an intercepting onClick.",
    },
    schema: [],
    messages: {
      noShellNav:
        "Internal links inside components/apps must never navigate the page. Use openWindow() (via an OpenWindowButton), or if this is the §3 crawlable <a href> exception, pair it with onClick={(e) => { e.preventDefault(); openWindow(...) }}.",
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (node.name.type !== "JSXIdentifier" || node.name.name !== "a") return;

        const hrefAttr = node.attributes.find(
          (a) => a.type === "JSXAttribute" && a.name.name === "href"
        );
        if (!hrefAttr || hrefAttr.value?.type !== "Literal") return;

        const href = hrefAttr.value.value;
        if (typeof href !== "string" || !/^[/#]/.test(href)) return;

        const hasOnClick = node.attributes.some(
          (a) => a.type === "JSXAttribute" && a.name.name === "onClick"
        );
        if (!hasOnClick) {
          context.report({ node: hrefAttr, messageId: "noShellNav" });
        }
      },
    };
  },
};

export default rule;
