"use client";

import { useState } from "react";
import { ExternalLink } from "@/components/shell/ExternalLink";
import { EXTERNAL_LINKS } from "@/lib/externalLinks";

const EMAIL_USER = "skrishnendu115";
const EMAIL_DOMAIN = "gmail.com";
const PHONE_COUNTRY_CODE = "+91";
const PHONE_NUMBER = "8910886505";

export default function Contact() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const email = `${EMAIL_USER}@${EMAIL_DOMAIN}`;
  const phone = `${PHONE_COUNTRY_CODE} ${PHONE_NUMBER}`;
  const phoneHref = `tel:${PHONE_COUNTRY_CODE}${PHONE_NUMBER}`;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Portfolio contact from ${name || "a visitor"}`);
    const body = encodeURIComponent(message);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — silently no-op.
    }
  }

  return (
    <div className="flex h-full flex-col gap-3 bg-white p-3">
      <div className="field-row-stacked text-xs">
        <span>Email: {email}</span>
        <span>
          Phone:{" "}
          <a href={phoneHref} aria-label="Call Krishnendu (opens your phone app)">
            {phone}
          </a>
        </span>
        <span>
          LinkedIn: <ExternalLink href={EXTERNAL_LINKS.linkedin} label="echowhisper" />
        </span>
        <span>Location: Kolkata, India</span>
      </div>
      <form className="flex flex-1 flex-col gap-3" onSubmit={handleSubmit}>
        <div className="field-row-stacked">
          <label htmlFor="contact-name">Name</label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field-row-stacked">
          <label htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button type="submit">Send (opens your mail app)</button>
          <button type="button" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy email address"}
          </button>
        </div>
      </form>
    </div>
  );
}
