import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ChevronRightIcon,
  ClockIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  ShoppingCartIcon,
  TruckIcon,
} from "@heroicons/react/24/solid";
import { LifebuoyIcon } from "@heroicons/react/24/outline";
import WhatsAppIcon, {
  WHATSAPP_ICON_PATH,
} from "@/components/common/WhatsAppIcon";
import { APP_NAME } from "@/constants";
import { selectSettings } from "@/features/settings";
import { resolveMediaUrl, toPhoneHref, toWhatsAppUrl } from "@/utils";

const importantLinks = [
  { label: "About Us", to: "/" },
  { label: "Terms & Conditions", to: "/" },
  { label: "Privacy & Security", to: "/" },
  { label: "Return & Refund Policy", to: "/" },
  { label: "Customer Care & Help", to: "/" },
];

const SOCIAL_ICONS = [
  {
    key: "facebook",
    label: "Facebook",
    className: "bg-[#1877F2]",
    path: "M14 8.5V6.8c0-.8.5-1 .9-1H17V2.1L14.1 2C10.9 2 10.2 4.4 10.2 6v2.5H8v3.8h2.2V22H14v-9.7h2.8l.4-3.8H14z",
  },
  {
    key: "instagram",
    label: "Instagram",
    className:
      "bg-[radial-gradient(circle_at_30%_110%,#fdf497_0%,#fd5949_45%,#d6249f_60%,#285AEB_90%)]",
    path: "M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm4.9-8.9a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2zM12 4.6c2.4 0 2.7 0 3.6.1 2.4.1 3.6 1.3 3.7 3.7.1.9.1 1.2.1 3.6s0 2.7-.1 3.6c-.1 2.4-1.3 3.6-3.7 3.7-.9.1-1.2.1-3.6.1s-2.7 0-3.6-.1c-2.4-.1-3.6-1.3-3.7-3.7-.1-.9-.1-1.2-.1-3.6s0-2.7.1-3.6C4.8 6 6 4.8 8.4 4.7c.9-.1 1.2-.1 3.6-.1zM12 3c-2.4 0-2.8 0-3.7.1C5 3.2 3.2 5 3.1 8.3 3 9.2 3 9.6 3 12s0 2.8.1 3.7c.1 3.3 1.9 5.1 5.2 5.2.9.1 1.3.1 3.7.1s2.8 0 3.7-.1c3.3-.1 5.1-1.9 5.2-5.2.1-.9.1-1.3.1-3.7s0-2.8-.1-3.7C20.8 5 19 3.2 15.7 3.1 14.8 3 14.4 3 12 3z",
  },
  {
    key: "tiktok",
    label: "TikTok",
    className: "bg-black ring-1 ring-white/15",
    path: "M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.8a5.7 5.7 0 1 0 4.9 5.6V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z",
  },
  {
    key: "youtube",
    label: "YouTube",
    className: "bg-[#FF0000]",
    path: "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    className: "bg-[#25D366]",
    path: WHATSAPP_ICON_PATH,
  },
  {
    key: "messenger",
    label: "Messenger",
    className: "bg-gradient-to-br from-[#00B2FF] to-[#006AFF]",
    path: "M12 2C6.4 2 2 6.1 2 11.7c0 2.9 1.2 5.5 3.3 7.2V22l3-1.7c.9.3 1.8.4 2.8.4 5.6 0 10-4.1 10-9.7S17.6 2 12 2zm1 13-2.5-2.7L5.6 15l5.4-5.7 2.6 2.7 4.8-2.7L13 15z",
  },
  {
    key: "call",
    label: "Call",
    className: "bg-[#F0532D]",
    path: "M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z",
  },
];

function FooterHeading({ children }) {
  return (
    <div className="mb-5">
      <h4 className="text-[15px] font-bold text-white">{children}</h4>
      <span className="bg-primary-400 mt-2 block h-0.5 w-9 rounded-full" />
    </div>
  );
}

function FooterLogo({ storeName, logoUrl }) {
  const [failedUrl, setFailedUrl] = useState("");
  const src = resolveMediaUrl(logoUrl);
  const dotIndex = storeName.indexOf(".");
  const [main, suffix] =
    dotIndex > 0
      ? [storeName.slice(0, dotIndex), storeName.slice(dotIndex)]
      : [storeName, ""];

  return (
    <Link
      to="/"
      aria-label={storeName}
      className="border-primary-300 inline-flex items-center rounded-lg border-2 bg-white px-4 py-2 text-xl font-extrabold tracking-tight"
    >
      {src && failedUrl !== src ? (
        <img
          src={src}
          alt={storeName}
          className="h-8 w-auto max-w-45 object-contain"
          onError={() => setFailedUrl(src)}
        />
      ) : (
        <>
          <span className="text-primary-950">{main}</span>
          {suffix && <span className="text-primary-600">{suffix}</span>}
        </>
      )}
    </Link>
  );
}

const clean = (value) => (typeof value === "string" ? value.trim() : "");

export default function Footer() {
  const settings = useSelector(selectSettings) || {};
  const storeName = clean(settings.storeName) || APP_NAME;
  const phone = clean(settings.phone);
  const whatsapp = clean(settings.whatsapp);
  const email = clean(settings.supportEmail);
  const address = clean(settings.address);
  const description = clean(settings.footerDescription);
  const supportHours = clean(settings.supportHours);
  const copyrightName = clean(settings.copyrightName) || storeName;
  const phoneHref = toPhoneHref(phone);
  const whatsappUrl = toWhatsAppUrl(whatsapp);

  const socialHrefs = {
    ...settings.socialLinks,
    whatsapp: whatsappUrl,
    call: phoneHref,
  };
  const socialLinks = SOCIAL_ICONS.map((social) => ({
    ...social,
    href: clean(socialHrefs[social.key]),
  })).filter((social) => social.href);

  const supportLinks = [
    { label: "Order Tracking", to: "/track-order", icon: TruckIcon },
    { label: "Shopping Cart", to: "/cart", icon: ShoppingCartIcon },
    phoneHref && {
      label: "Customer Helpline",
      href: phoneHref,
      icon: LifebuoyIcon,
    },
  ].filter(Boolean);

  const hasContact = Boolean(address || phoneHref || whatsappUrl || email);

  return (
    <footer className="border-primary-800 bg-primary-950 text-primary-100 mt-16 border-t">
      <div className="container-app py-12">
        <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <FooterLogo
              storeName={storeName}
              logoUrl={clean(settings.logoUrl)}
            />
            {description && (
              <p className="text-primary-200/80 mt-4 text-[13px] leading-relaxed whitespace-pre-line">
                {description}
              </p>
            )}
            {socialLinks.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target={
                      social.href.startsWith("http") ? "_blank" : undefined
                    }
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-white transition hover:-translate-y-0.5 hover:opacity-90 ${social.className}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <FooterHeading>Important Links</FooterHeading>
            <ul className="space-y-3">
              {importantLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="group text-primary-100 flex items-center gap-2 text-[13px] transition hover:text-white"
                  >
                    <ChevronRightIcon className="text-primary-400 h-3 w-3 transition group-hover:translate-x-0.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <FooterHeading>Customer Support</FooterHeading>
            <ul className="space-y-3">
              {supportLinks.map(({ label, to, href, icon: Icon }) => {
                const content = (
                  <>
                    <Icon className="text-primary-400 h-4 w-4" />
                    {label}
                  </>
                );
                const className =
                  "flex items-center gap-2 text-[13px] text-primary-100 transition hover:text-white";
                return (
                  <li key={label}>
                    {to ? (
                      <Link to={to} className={className}>
                        {content}
                      </Link>
                    ) : (
                      <a href={href} className={className}>
                        {content}
                      </a>
                    )}
                  </li>
                );
              })}
              {supportHours && (
                <li className="text-primary-200/80 flex items-center gap-2 text-[13px]">
                  <ClockIcon className="text-primary-400 h-4 w-4" />
                  {supportHours}
                </li>
              )}
            </ul>
          </div>

          {hasContact && (
            <div>
              <FooterHeading>Contact Us</FooterHeading>
              <ul className="space-y-3 rounded-xl border border-white/10 bg-white/3 p-4 text-[13px]">
                {address && (
                  <li className="text-primary-200/80 flex items-start gap-2 leading-relaxed">
                    <MapPinIcon className="text-primary-400 mt-0.5 h-4 w-4 shrink-0" />
                    {address}
                  </li>
                )}
                {phoneHref && (
                  <li>
                    <a
                      href={phoneHref}
                      className="text-primary-100 flex items-center gap-2 transition hover:text-white"
                    >
                      <PhoneIcon className="text-primary-400 h-4 w-4 shrink-0" />
                      Phone: {phone}
                    </a>
                  </li>
                )}
                {whatsappUrl && (
                  <li>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-100 flex items-center gap-2 transition hover:text-white"
                    >
                      <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366]" />
                      WhatsApp: {whatsapp}
                    </a>
                  </li>
                )}
                {email && (
                  <li>
                    <a
                      href={`mailto:${email}`}
                      className="text-primary-100 flex min-w-0 items-center gap-2 transition hover:text-white"
                    >
                      <EnvelopeIcon className="text-primary-400 h-4 w-4 shrink-0" />
                      <span className="break-all">{email}</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/20">
        <p className="container-app text-primary-200/80 py-5 text-center text-[13px]">
          Copyright © {new Date().getFullYear()}{" "}
          <span className="font-bold text-white">{copyrightName}</span>. All
          rights reserved.
        </p>
      </div>
    </footer>
  );
}
