// src/components/GlobalTranslator.jsx
import { useEffect, useRef } from "react";
import i18n from "../i18n";

// === Minimal phrase dictionary (extend anytime) =============================
// Keys are lowercased English phrases; values are per-language translations.
// This covers a lot of common UI. Add your own entries as you see untranslated bits.
const DICT = {
  // NAV / COMMON
  "sahayata": {
    hi: "सहायता", es: "Sahayata", mr: "सहायता", gu: "સહાયતા", bn: "সহায়তা",
    ta: "சகாயதா", te: "సహాయత", kn: "ಸಹಾಯತಾ", pa: "ਸਹਾਇਤਾ", ur: "سہایتا"
  },
  "community": {
    hi: "समुदाय", es: "Comunidad", mr: "समुदाय", gu: "સમુદાય", bn: "সমাজ",
    ta: "சமூகம்", te: "సమాజం", kn: "ಸಮುದಾಯ", pa: "ਭਾਈਚਾਰਾ", ur: "کمیونٹی"
  },
  "map view": {
    hi: "मानचित्र दृश्य", es: "Mapa", mr: "नकाशा दृश्य", gu: "નકશો દૃશ્ય", bn: "মানচিত্র দৃশ্য",
    ta: "வரைபடம்", te: "పటము దృశ్యం", kn: "ನಕ್ಷೆ ದೃಶ್ಯ", pa: "ਨਕਸ਼ਾ ਦ੍ਰਿਸ਼", ur: "نقشہ منظر"
  },
  "connect": {
    hi: "कनेक्ट", es: "Conectar", mr: "जोडा", gu: "કનેક્ટ", bn: "কনেক্ট",
    ta: "இணை", te: "కనెక్ట్", kn: "ಕನೆಕ್ಟ್", pa: "ਕਨੈਕਟ", ur: "کنیکٹ"
  },
  "groups": {
    hi: "समूह", es: "Grupos", mr: "गट", gu: "ગ્રુપ્સ", bn: "গ্রুপ",
    ta: "குழுக்கள்", te: "గుంపులు", kn: "ಗುಂಪುಗಳು", pa: "ਗਰੁੱਪ", ur: "گروپس"
  },
  "help": {
    hi: "सहायता", es: "Ayuda", mr: "मदत", gu: "મદદ", bn: "সহায়তা",
    ta: "உதவி", te: "సహాయం", kn: "ಸಹಾಯ", pa: "ਮਦਦ", ur: "مدد"
  },
  "messages": {
    hi: "संदेश", es: "Mensajes", mr: "संदेश", gu: "સંદેશા", bn: "বার্তা",
    ta: "செய்திகள்", te: "సందేశాలు", kn: "ಸಂದೇಶಗಳು", pa: "ਸੁਨੇਹੇ", ur: "پیغامات"
  },
  "friend requests": {
    hi: "मित्र अनुरोध", es: "Solicitudes de amistad", mr: "मित्र विनंत्या", gu: "મિત્ર વિનંતીઓ", bn: "বন্ধুত্ব অনুরোধ",
    ta: "நண்பர் கோரிக்கைகள்", te: "స్నేహితుల అభ్యర్థనలు", kn: "ಸ್ನೇಹ ವಿನಂತಿಗಳು", pa: "ਦੋਸਤੀ ਬੇਨਤੀਆਂ", ur: "دوستی درخواستیں"
  },
  "create post": {
    hi: "पोस्ट बनाएँ", es: "Crear publicación", mr: "पोस्ट तयार करा", gu: "પોસ્ટ બનાવો", bn: "পোস্ট তৈরি করুন",
    ta: "பதிவு உருவாக்கு", te: "పోస్ట్ సృష్టించండి", kn: "ಪೋಸ್ಟ್ ರಚಿಸಿ", pa: "ਪੋਸਟ ਬਣਾਓ", ur: "پوسٹ بنائیں"
  },
  "logout": {
    hi: "लॉगआउट", es: "Cerrar sesión", mr: "लॉगआउट", gu: "લૉગઆઉટ", bn: "লগ আউট",
    ta: "வெளியேறு", te: "లాగౌట్", kn: "ಲಾಗ್ ಔಟ್", pa: "ਲਾਗ ਆਉਟ", ur: "لاگ آؤٹ"
  },
  "sign in": {
    hi: "साइन इन", es: "Iniciar sesión", mr: "साइन इन", gu: "સાઇન ઇન", bn: "সাইন ইন",
    ta: "உள்நுழை", te: "సైన్ ఇన్", kn: "ಸೈನ್ ಇನ್", pa: "ਸਾਇਨ ਇਨ", ur: "سائن اِن"
  },
  "back": {
    hi: "वापस", es: "Atrás", mr: "मागे", gu: "પાછળ", bn: "ফিরে যান",
    ta: "பின் செல்ல", te: "వెనుకకు", kn: "ಹಿಂದೆ", pa: "ਵਾਪਸ", ur: "واپس"
  },

  // COMMON ACTIONS
  "save": { hi: "सहेजें", es: "Guardar", mr: "जतन करा", gu: "સાચવો", bn: "সংরক্ষণ করুন", ta: "சேமி", te: "భద్రపరచు", kn: "ಉಳಿಸಿ", pa: "ਸੇਵ ਕਰੋ", ur: "محفوظ کریں" },
  "cancel": { hi: "रद्द करें", es: "Cancelar", mr: "रद्द करा", gu: "રદ કરો", bn: "বাতিল করুন", ta: "ரத்துசெய்", te: "రద్దు", kn: "ರದ್ದು", pa: "ਰੱਦ ਕਰੋ", ur: "منسوخ کریں" },
  "edit": { hi: "संपादित करें", es: "Editar", mr: "संपादित करा", gu: "ફેરફાર કરો", bn: "সম্পাদনা", ta: "திருத்து", te: "సవరించు", kn: "ತಿದ್ದು", pa: "ਸੋਧੋ", ur: "ترمیم کریں" },
  "delete": { hi: "हटाएँ", es: "Eliminar", mr: "हटवा", gu: "કાઢી નાખો", bn: "মুছে ফেলুন", ta: "அழி", te: "తొలగించు", kn: "ಅಳಿಸಿ", pa: "ਹਟਾਓ", ur: "حذف کریں" },
  "loading...": { hi: "लोड हो रहा है...", es: "Cargando...", mr: "लोड होत आहे...", gu: "લોડ થઈ રહ્યું છે...", bn: "লোড হচ্ছে...", ta: "ஏற்றுகிறது...", te: "లోడ్ అవుతోంది...", kn: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...", pa: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...", ur: "لوڈ ہو رہا ہے..." },

  // FORM / FIELD LABELS (add more as needed)
  "email": { hi: "ईमेल", es: "Correo", mr: "ईमेल", gu: "ઇમેઇલ", bn: "ইমেইল", ta: "மின்னஞ்சல்", te: "ఈమెయిల్", kn: "ಇಮೇಲ್", pa: "ਈਮੇਲ", ur: "ای میل" },
  "password": { hi: "पासवर्ड", es: "Contraseña", mr: "पासवर्ड", gu: "પાસવર્ડ", bn: "পাসওয়ার্ড", ta: "கடவுச்சொல்", te: "పాస్‌వర్డ్", kn: "ಪಾಸ್ವರ್ಡ್", pa: "ਪਾਸਵਰਡ", ur: "پاس ورڈ" },
  "name": { hi: "नाम", es: "Nombre", mr: "नाव", gu: "નામ", bn: "নাম", ta: "பெயர்", te: "పేరు", kn: "ಹೆಸರು", pa: "ਨਾਂ", ur: "نام" },
  "title": { hi: "शीर्षक", es: "Título", mr: "शीर्षक", gu: "શીર્ષક", bn: "শিরোনাম", ta: "தலைப்பு", te: "శీర్షిక", kn: "ಶೀರ್ಷಿಕೆ", pa: "ਸਿਰਲੇਖ", ur: "عنوان" },
  "description": { hi: "विवरण", es: "Descripción", mr: "वर्णन", gu: "વિવરણ", bn: "বিবরণ", ta: "விளக்கம்", te: "వివరణ", kn: "ವಿವರಣೆ", pa: "ਵੇਰਵਾ", ur: "تفصیل" },
  "category": { hi: "श्रेणी", es: "Categoría", mr: "वर्ग", gu: "શ્રેણી", bn: "বিভাগ", ta: "வகை", te: "వర్గం", kn: "ವರ್ಗ", pa: "ਸ਼੍ਰੇਣੀ", ur: "زمرہ" },
  "urgency": { hi: "तत्कालता", es: "Urgencia", mr: "तत्काळता", gu: "તાત્કાલિકતા", bn: "জরুরিতা", ta: "அவசரம்", te: "త్వరితత", kn: "ತುರ್ತು", pa: "ਤੁਰੰਤਤਾ", ur: "ہنگامی" },
  "status": { hi: "स्थिति", es: "Estado", mr: "स्थिती", gu: "સ્થિતિ", bn: "অবস্থা", ta: "நிலை", te: "స్థితి", kn: "ಸ್ಥಿತಿ", pa: "ਸਥਿਤੀ", ur: "حالت" },
};

// Languages we support for auto-translate (match your i18n set)
const SUPPORTED = ["en","hi","es","mr","gu","bn","ta","te","kn","pa","ur"];

// Utilities
const isTextNode = (n) => n && n.nodeType === Node.TEXT_NODE;
const shouldSkip = (el) => {
  if (!el) return true;
  const tag = el.nodeName.toLowerCase();
  if (el.hasAttribute?.("data-no-translate")) return true;
  return ["script","style","noscript","code","pre","textarea"].includes(tag);
};

function buildReplaceList(lang) {
  if (!lang || lang === "en") return [];
  const list = [];
  Object.entries(DICT).forEach(([src, map]) => {
    const tgt = map[lang];
    if (!tgt) return;
    // replace whole word/phrase, case-insensitive
    list.push({
      re: new RegExp(`\\b${escapeRegex(src)}\\b`, "gi"),
      to: tgt
    });
  });
  // Sort longest first to avoid partial overlaps
  return list.sort((a, b) => (b.re.source.length - a.re.source.length));
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function translateTextContent(text, replaceList) {
  if (!replaceList.length) return null;
  let newText = text;
  replaceList.forEach(({ re, to }) => {
    newText = newText.replace(re, (m) => {
      // preserve capitalization for simple cases
      if (m === m.toUpperCase()) return to;      // shouty becomes target (we could add uppercasing rules)
      if (m[0] === m[0].toUpperCase()) return to; // Titlecase -> just use target
      return to;
    });
  });
  return newText === text ? null : newText;
}

function walkAndTranslate(root, replaceList) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const p = node.parentElement;
      if (shouldSkip(p)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const changes = [];
  let n;
  while ((n = walker.nextNode())) {
    const updated = translateTextContent(n.nodeValue, replaceList);
    if (updated) changes.push([n, updated]);
  }
  changes.forEach(([node, val]) => (node.nodeValue = val));

  // translate common attributes
  const selector = "[placeholder],[title],[aria-label]";
  root.querySelectorAll?.(selector)?.forEach((el) => {
    if (shouldSkip(el)) return;
    ["placeholder","title","aria-label"].forEach((attr) => {
      const v = el.getAttribute(attr);
      if (!v) return;
      const updated = translateTextContent(v, replaceList);
      if (updated) el.setAttribute(attr, updated);
    });
  });
}

export default function GlobalTranslator() {
  const obsRef = useRef(null);

  useEffect(() => {
    let currentLang = i18n.language || "en";
    let replaceList = buildReplaceList(currentLang);

    // initial pass
    walkAndTranslate(document.body, replaceList);

    // observe DOM changes
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList") {
          m.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (!shouldSkip(node)) walkAndTranslate(node, replaceList);
            } else if (isTextNode(node) && node.nodeValue?.trim()) {
              const p = node.parentElement;
              if (!shouldSkip(p)) {
                const updated = translateTextContent(node.nodeValue, replaceList);
                if (updated) node.nodeValue = updated;
              }
            }
          });
        } else if (m.type === "attributes") {
          const el = m.target;
          if (["placeholder","title","aria-label"].includes(m.attributeName)) {
            const v = el.getAttribute(m.attributeName);
            if (!v) continue;
            const updated = translateTextContent(v, replaceList);
            if (updated) el.setAttribute(m.attributeName, updated);
          }
        }
      }
    });

    obs.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["placeholder","title","aria-label"],
    });
    obsRef.current = obs;

    // react to i18n language changes
    const onLang = (lng) => {
      currentLang = SUPPORTED.includes(lng) ? lng : "en";
      replaceList = buildReplaceList(currentLang);
      walkAndTranslate(document.body, replaceList);
    };
    i18n.on("languageChanged", onLang);

    return () => {
      obs.disconnect();
      i18n.off("languageChanged", onLang);
    };
  }, []);

  // this renders nothing; it just wires the translator
  return null;
}
