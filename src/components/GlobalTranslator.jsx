import React, { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";

// keep <html lang/dir> synced globally (RTL for Urdu)
function applyHtmlLangDir(lng) {
  const short = (lng || "en").split("-")[0];
  const el = document.documentElement;
  if (!el) return;
  el.lang = short;
  el.dir = short === "ur" ? "rtl" : "ltr";
}

export default function GlobalTranslator({ children }) {
  useEffect(() => {
    applyHtmlLangDir(i18n.resolvedLanguage || i18n.language);
    const onChange = (lng) => applyHtmlLangDir(lng);
    i18n.on("languageChanged", onChange);
    return () => i18n.off("languageChanged", onChange);
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
