"use client";

import { ExternalLink } from "@/components/shell/ExternalLink";
import { EXTERNAL_LINKS } from "@/lib/externalLinks";

const EMAIL_USER = "skrishnendu115";
const EMAIL_DOMAIN = "gmail.com";
const PHONE_COUNTRY_CODE = "+91";
const PHONE_NUMBER = "8910886505";

export default function Contact() {
  const email = `${EMAIL_USER}@${EMAIL_DOMAIN}`;
  const phone = `${PHONE_COUNTRY_CODE} ${PHONE_NUMBER}`;
  const phoneHref = `tel:${PHONE_COUNTRY_CODE}${PHONE_NUMBER}`;
  const mailtoHref = `mailto:${email}?subject=${encodeURIComponent("Hello from your portfolio")}`;

  return (
    <div className="flex h-full flex-col gap-3 bg-white p-3">
      <p className="font-bold">Let&apos;s build</p>
      <p>
        Have an idea, a role, or just want to talk shop? I&apos;m always up
        for a good conversation about AI-native products.
      </p>
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
      <button
        type="button"
        className="self-start"
        onClick={() => {
          window.location.href = mailtoHref;
        }}
      >
        Say Hello
      </button>
    </div>
  );
}
