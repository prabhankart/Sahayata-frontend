import { useEffect, useMemo, useRef, useState } from "react";

/**
 * VirtualKeyboard v2 — Multi-language (HI, MR, AWA, BHO, GU, BN, TA, TE, KN, EN)
 *
 * Props:
 * - visible: boolean
 * - onInput(char)
 * - onBackspace()
 * - onEnter()
 * - onSpace()
 * - onHide()
 * - onHeightChange(h:number)
 */
export default function VirtualKeyboard({
  visible,
  onInput,
  onBackspace,
  onEnter,
  onSpace,
  onHide,
  onHeightChange,
}) {
  const LANGS = useMemo(
    () => ([
      { code: "hi", label: "हिन्दी", group: "dev" },
      { code: "mr", label: "मराठी", group: "dev" },
      { code: "awa", label: "अवधी", group: "dev" },
      { code: "bho", label: "भोजपुरी", group: "dev" },
      { code: "gu", label: "ગુજરાતી", group: "guj" },
      { code: "bn", label: "বাংলা", group: "ben" },
      { code: "ta", label: "தமிழ்", group: "tam" },
      { code: "te", label: "తెలుగు", group: "tel" },
      { code: "kn", label: "ಕನ್ನಡ", group: "kan" },
      { code: "en", label: "English", group: "lat" },
    ]), []
  );

  const pickInitialLang = () => {
    try {
      const saved = window.localStorage.getItem("vk_lang");
      if (saved && LANGS.some(l => l.code === saved)) return saved;
    } catch {}
    return "hi";
  };

  const [lang, setLang] = useState(pickInitialLang);
  const [mode, setMode] = useState("letters"); // letters | matras | numbers
  const [shift, setShift] = useState(false);
  const [altPad, setAltPad] = useState(null);  // {x,y, options:[], key?:string}
  const rootRef = useRef(null);
  const repeatTimer = useRef(null);
  const longPressTimer = useRef(null);

  // Height -> chat padding
  useEffect(() => {
    if (!visible) {
      onHeightChange?.(0);
      return;
    }
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => onHeightChange?.(el.offsetHeight || 0));
    ro.observe(el);
    onHeightChange?.(el.offsetHeight || 0);
    return () => ro.disconnect();
  }, [visible, onHeightChange]);

  // Persist language
  useEffect(() => {
    try { window.localStorage.setItem("vk_lang", lang); } catch {}
  }, [lang]);

  const buzz = (ms = 8) => {
    try { window.navigator?.vibrate?.(ms); } catch {}
  };

  // --------- LAYOUTS ---------
  // Devanagari (HI/MR/AWA/BHO)
  const DEV_LETTERS = [
    ["क","ख","ग","घ","ङ","च","छ","ज","झ","ञ"],
    ["ट","ठ","ड","ढ","ण","त","थ","द","ध","न"],
    ["प","फ","ब","भ","म","य","र","ल","व","back"],
    ["shift","श","ष","स","ह","ऽ","।","space","enter","hide"],
  ];
  const DEV_ALTS = {
    "क":["क़","क्ष"], "ख":["ख़"], "ग":["ग़"], "ज":["ज़","ज्ञ"], "ड":["ड़"], "ढ":["ढ़"],
    "फ":["फ़"], "र":["ऱ"], "ल":["ळ"], "स":["श","ष"], "त":["त्र"], "।":["॥"], "ह":["ॐ"]
  };
  const DEV_MATRAS = [
    ["ा","ि","ी","ु","ू","ृ","े","ै","ो","ौ"],
    ["ं","ँ","ः","ॅ","ॉ","्","़","।","॥","ॐ"],
    ["ABC","digits","back"],
    [",","space",".","enter","hide"],
  ];
  const DEV_NUMBERS = [
    ["1","2","3","4","5","6","7","8","9","0"],
    ["-","/","(",")",":",";","₹","&","@","\""],
    ["ABC",".",",","?","!","'","back"],
    [",","space",".","enter","hide"],
  ];

  // Gujarati
  const GUJ_LETTERS = [
    ["ક","ખ","ગ","ઘ","ઙ","ચ","છ","જ","ઝ","ઞ"],
    ["ટ","ઠ","ડ","ઢ","ણ","ત","થ","દ","ધ","ન"],
    ["પ","ફ","બ","ભ","મ","ય","ર","લ","વ","back"],
    ["shift","શ","ષ","સ","હ","ઽ","।","space","enter","hide"],
  ];
  const GUJ_ALTS = { "ર":["઱"], "લ":["ળ"], "।":["॥"] };
  const GUJ_MATRAS = [
    ["ા","િ","ી","ુ","ૂ","ૃ","ે","ૈ","ો","ૌ"],
    ["ં","ઃ","ૅ","ૉ","્","઼","।","॥","back"],
    ["ABC","digits","hide"],
    [",","space",".","enter"],
  ];
  const GUJ_NUMBERS = DEV_NUMBERS;

  // Bengali
  const BEN_LETTERS = [
    ["ক","খ","গ","ঘ","ঙ","চ","ছ","জ","ঝ","ঞ"],
    ["ট","ঠ","ড","ঢ","ণ","ত","থ","দ","ধ","ন"],
    ["প","ফ","ব","ভ","ম","য","র","ল","ৱ","back"],
    ["shift","শ","ষ","স","হ","ড়","ঢ়","space","enter","hide"],
  ];
  const BEN_ALTS = { "র":["ড়","ঢ়"], "য":["য়"], "স":["শ","ষ"] };
  const BEN_MATRAS = [
    ["া","ি","ী","ু","ূ","ৃ","ে","ৈ","ো","ৌ"],
    ["ং","ঃ","ঁ","্","।","back"],
    ["ABC","digits","hide"],
    [",","space",".","enter"],
  ];
  const BEN_NUMBERS = DEV_NUMBERS;

  // Tamil
  const TAM_LETTERS = [
    ["அ","ஆ","இ","ஈ","உ","ஊ","எ","ஏ","ஐ","ஒ"],
    ["ஓ","ஔ","க","ங","ச","ஞ","ட","ண","த","ந"],
    ["ப","ம","ய","ர","ல","வ","ழ","ள","ற","back"],
    ["shift","ஸ","ஹ","ஜ","க்ஷ","ஃ","·","space","enter","hide"],
  ];
  const TAM_ALTS = { "·":["।","॥"] };
  const TAM_MATRAS = [
    ["ா","ி","ீ","ு","ூ","ெ","ே","ை","ொ","ோ"],
    ["ௌ","்","ஂ","ஃ","back"],
    ["ABC","digits","hide"],
    [",","space",".","enter"],
  ];
  const TAM_NUMBERS = DEV_NUMBERS;

  // Telugu
  const TEL_LETTERS = [
    ["అ","ఆ","ఇ","ఈ","ఉ","ఊ","ఎ","ఏ","ఐ","ఒ"],
    ["ఓ","ఔ","క","ఖ","గ","ఘ","ఙ","చ","ఛ","జ"],
    ["ఝ","ట","ఠ","డ","ఢ","ణ","త","థ","ద","back"],
    ["ధ","న","ప","ఫ","బ","భ","మ","య","ర","ల"],
    ["వ","శ","ష","స","హ","ఱ","space","enter","hide"],
  ];
  const TEL_ALTS = {};
  const TEL_MATRAS = [
    ["ా","ి","ీ","ు","ూ","ృ","ౄ","ె","ే","ై"],
    ["ొ","ో","ౌ","్","ం","ః","back"],
    ["ABC","digits","hide"],
    [",","space",".","enter"],
  ];
  const TEL_NUMBERS = DEV_NUMBERS;

  // Kannada
  const KAN_LETTERS = [
    ["ಅ","ಆ","ಇ","ಈ","ಉ","ಊ","ಎ","ಏ","ಐ","ಒ"],
    ["ಓ","ಔ","ಕ","ಖ","ಗ","ಘ","ಙ","ಚ","ಛ","ಜ"],
    ["ಝ","ಟ","ಠ","ಡ","ಢ","ಣ","ತ","ಥ","ದ","back"],
    ["ಧ","ನ","ಪ","ಫ","ಬ","ಭ","ಮ","ಯ","ರ","ಲ"],
    ["ವ","ಶ","ಷ","ಸ","ಹ","ಳ","space","enter","hide"],
  ];
  const KAN_ALTS = {};
  const KAN_MATRAS = [
    ["ಾ","ಿ","ೀ","ು","ೂ","ೃ","ೄ","ೆ","ೇ","ೈ"],
    ["ೊ","ೋ","ೌ","್","ಂ","ಃ","back"],
    ["ABC","digits","hide"],
    [",","space",".","enter"],
  ];
  const KAN_NUMBERS = DEV_NUMBERS;

  // Latin fallback
  const LAT_LETTERS = [
    ["q","w","e","r","t","y","u","i","o","p"],
    ["a","s","d","f","g","h","j","k","l"],
    ["shift","z","x","c","v","b","n","m","back"],
    ["123",",","space",".","enter","hide"],
  ];
  const LAT_ALTS = { "a":["á","à","â","ä","ã","å","ā"], "e":["é","è","ê","ë","ē"], "i":["í","ì","î","ï","ī"], "o":["ó","ò","ô","ö","õ","ō"], "u":["ú","ù","û","ü","ū"], "c":["ç"], "n":["ñ"] };
  const LAT_NUMBERS = DEV_NUMBERS;

  const byGroup = (g) => {
    switch (g) {
      case "dev": return { letters: DEV_LETTERS, matras: DEV_MATRAS, numbers: DEV_NUMBERS, alts: DEV_ALTS };
      case "guj": return { letters: GUJ_LETTERS, matras: GUJ_MATRAS, numbers: GUJ_NUMBERS, alts: GUJ_ALTS };
      case "ben": return { letters: BEN_LETTERS, matras: BEN_MATRAS, numbers: BEN_NUMBERS, alts: BEN_ALTS };
      case "tam": return { letters: TAM_LETTERS, matras: TAM_MATRAS, numbers: TAM_NUMBERS, alts: TAM_ALTS };
      case "tel": return { letters: TEL_LETTERS, matras: TEL_MATRAS, numbers: TEL_NUMBERS, alts: TEL_ALTS };
      case "kan": return { letters: KAN_LETTERS, matras: KAN_MATRAS, numbers: KAN_NUMBERS, alts: KAN_ALTS };
      default: return { letters: LAT_LETTERS, matras: LAT_LETTERS, numbers: LAT_NUMBERS, alts: LAT_ALTS };
    }
  };

  const current = useMemo(() => {
    const group = LANGS.find(l => l.code === lang)?.group || "lat";
    return byGroup(group);
  }, [lang, LANGS]);

  // Mode rows
  const rows = mode === "letters" ? current.letters
             : mode === "matras"   ? current.matras
             : current.numbers;

  // --------- actions ----------
  const pressChar = (k) => {
    if (!k) return;
    // controls:
    if (k === "back") return onBackspace?.();
    if (k === "enter") return onEnter?.();
    if (k === "space") return onSpace?.();
    if (k === "shift") { setShift(v => !v); return; }
    if (k === "hide") return onHide?.();
    if (k === "123" || k === "digits") { setMode("numbers"); return; }
    if (k === "ABC") { setMode("letters"); return; }

    // "letters" <-> "matras" switcher present in dev/others via special keys:
    if (k === "matras") { setMode("matras"); return; }

    // regular char
    const ch = shift && k.length === 1 ? k.toUpperCase() : k;
    onInput?.(ch);
    buzz();
    if (shift) setShift(false);
  };

  // hold backspace
  const holdBackspaceStart = () => {
    onBackspace?.();
    clearInterval(repeatTimer.current);
    repeatTimer.current = setInterval(() => onBackspace?.(), 60);
  };
  const holdBackspaceEnd = () => clearInterval(repeatTimer.current);

  // long-press alt
  const openAlt = (key, e) => {
    const alts = current.alts?.[key];
    if (!alts || !alts.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setAltPad({
      key,
      options: alts,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };
  const closeAlt = () => setAltPad(null);

  // Render nothing if hidden
  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      className="sticky bottom-0 z-30 w-full border-t border-gray-200 bg-white dark:bg-gray-900 shadow-[0_-10px_24px_-12px_rgba(0,0,0,0.25)]"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom,0px) + 8px)" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Language chips */}
      <div className="px-2 pt-2">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {LANGS.map(l => (
            <button
              key={l.code}
              className={[
                "px-3 py-1 rounded-full text-sm whitespace-nowrap border transition",
                lang === l.code ? "bg-violet-600 text-white border-violet-600" : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700"
              ].join(" ")}
              onClick={() => { setLang(l.code); setMode("letters"); buzz(5); }}
              title={l.label}
            >
              {l.label}
            </button>
          ))}
          {/* Quick mode toggle (for Devanagari scripts etc.) */}
          <button
            className="ml-auto px-3 py-1 rounded-full text-sm border bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-100 border-gray-200 dark:border-gray-700"
            onClick={() => setMode(m => m === "letters" ? "matras" : "letters")}
            title="Letters / Matras"
          >
            {mode === "letters" ? "Matras" : "Letters"}
          </button>
        </div>
      </div>

      {/* ALT Pad */}
      {altPad && (
        <div
          className="fixed z-[100]"
          style={{ left: Math.max(10, altPad.x - 120), top: Math.max(6, altPad.y - 56) }}
          onMouseLeave={closeAlt}
        >
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg px-2 py-1 flex gap-1">
            {altPad.options.map(o => (
              <button
                key={o}
                className="px-3 py-2 rounded-lg text-base font-semibold hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => { onInput?.(o); closeAlt(); buzz(); }}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Keys */}
      <div className="mx-auto max-w-3xl px-2 py-2 select-none">
        {rows.map((row, idx) => (
          <div key={idx} className="flex justify-center gap-2 mb-2 last:mb-0">
            {row.map((key) => {
              const isWide = key === "space";
              const isBack = key === "back";
              const isShift = key === "shift";
              const isEnter = key === "enter";
              const isHide = key === "hide";
              const isMode = key === "123" || key === "digits" || key === "ABC";
              const label =
                key === "back" ? "⌫" :
                key === "shift" ? (shift ? "⇧" : "⬆") :
                key === "enter" ? "Send" :
                key === "space" ? (lang === "en" ? "Space" : "␣") :
                key === "hide" ? "Hide" :
                key === "123" ? "123" :
                key === "digits" ? "123" :
                key === "ABC" ? "ABC" :
                key;

              const commonBtn =
                "active:scale-[0.98] transition " +
                "rounded-xl border text-base font-semibold " +
                "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 " +
                "border-gray-200 dark:border-gray-700 px-3 py-3 shadow-sm";

              return (
                <button
                  key={key + idx}
                  className={[
                    commonBtn,
                    isWide ? "flex-1" : "min-w-[46px]",
                    isEnter ? "bg-violet-600 text-white border-violet-600" : "",
                    isBack || isShift || isMode || isHide ? "bg-gray-50 dark:bg-gray-700" : "",
                  ].join(" ")}
                  onClick={(e) => {
                    if (isBack) return onBackspace?.();
                    pressChar(key);
                  }}
                  onMouseDown={(e) => {
                    if (key === "back") return holdBackspaceStart();
                    clearTimeout(longPressTimer.current);
                    longPressTimer.current = setTimeout(() => openAlt(key, e), 360);
                  }}
                  onMouseUp={() => {
                    if (key === "back") return holdBackspaceEnd();
                    clearTimeout(longPressTimer.current);
                  }}
                  onMouseLeave={() => {
                    if (key === "back") return holdBackspaceEnd();
                  }}
                  onTouchStart={(e) => {
                    if (key === "back") return holdBackspaceStart();
                    clearTimeout(longPressTimer.current);
                    longPressTimer.current = setTimeout(() => openAlt(key, e), 360);
                  }}
                  onTouchEnd={() => {
                    if (key === "back") return holdBackspaceEnd();
                    clearTimeout(longPressTimer.current);
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom mode quick bar */}
      <div className="px-2 pb-2">
        <div className="flex gap-2">
          {mode !== "numbers" ? (
            <button
              onClick={() => setMode("numbers")}
              className="flex-1 rounded-lg border bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 px-3 py-2"
              title="Numbers"
            >
              123
            </button>
          ) : (
            <button
              onClick={() => setMode("letters")}
              className="flex-1 rounded-lg border bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 px-3 py-2"
              title="Letters"
            >
              ABC
            </button>
          )}
          <button
            onClick={() => onHide?.()}
            className="rounded-lg border bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-700 px-3 py-2"
            title="Hide"
          >
            ⌄
          </button>
        </div>
      </div>
    </div>
  );
}
