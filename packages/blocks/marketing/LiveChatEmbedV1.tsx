"use client";

import { useEffect } from "react";

type Props = {
  provider: "intercom" | "crisp" | "tawk" | "custom";
  appId?: string;
  customScript?: string;
};

declare global {
  interface Window {
    Intercom?: any;
    intercomSettings?: any;
    $crisp?: any;
    CRISP_WEBSITE_ID?: string;
    Tawk_API?: any;
  }
}

function injectIntercom(appId: string) {
  if (typeof window === "undefined" || window.Intercom) return;
  window.intercomSettings = { app_id: appId };
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://widget.intercom.io/widget/${encodeURIComponent(appId)}`;
  document.head.appendChild(s);
}

function injectCrisp(websiteId: string) {
  if (typeof window === "undefined" || window.$crisp) return;
  window.$crisp = [];
  window.CRISP_WEBSITE_ID = websiteId;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://client.crisp.chat/l.js";
  document.head.appendChild(s);
}

function injectTawk(propertyId: string) {
  if (typeof window === "undefined" || window.Tawk_API) return;
  window.Tawk_API = {};
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://embed.tawk.to/${propertyId}`;
  s.setAttribute("crossorigin", "*");
  document.head.appendChild(s);
}

function injectCustom(script: string) {
  if (typeof window === "undefined") return;
  try {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = script;
    const nodes = Array.from(wrapper.querySelectorAll("script"));
    nodes.forEach((src) => {
      const next = document.createElement("script");
      Array.from(src.attributes).forEach((a) =>
        next.setAttribute(a.name, a.value),
      );
      next.textContent = src.textContent;
      document.head.appendChild(next);
    });
  } catch {}
}

export default function LiveChatEmbedV1(props: Props) {
  useEffect(() => {
    switch (props.provider) {
      case "intercom":
        if (props.appId) injectIntercom(props.appId);
        break;
      case "crisp":
        if (props.appId) injectCrisp(props.appId);
        break;
      case "tawk":
        if (props.appId) injectTawk(props.appId);
        break;
      case "custom":
        if (props.customScript) injectCustom(props.customScript);
        break;
    }
  }, [props.provider, props.appId, props.customScript]);

  return null;
}
