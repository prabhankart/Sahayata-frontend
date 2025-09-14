// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const isBrowser = typeof window !== "undefined";

function getInitialLang() {
  if (!isBrowser) return "en";
  const urlLang = new URLSearchParams(window.location.search).get("lang");
  if (urlLang) return urlLang;
  const saved = window.localStorage.getItem("lang");
  return saved || "en";
}

const commonLangLabels = {
  en: "English (US)",
  hi: "हिन्दी",
  es: "Español",
  mr: "मराठी",
  gu: "ગુજરાતી",
  bn: "বাংলা",
  ta: "தமிழ்",
  te: "తెలుగు",
  kn: "ಕನ್ನಡ",
  pa: "ਪੰਜਾਬੀ",
  ur: "اردو",
};

// ---- TRANSLATIONS ----
// Keep brand localized; adjust if you prefer a single brand string.
const resources = {
  en: {
    translation: {
      brand: "Sahayata",
      nav: { community: "Community", map: "Map View", connect: "Connect", groups: "Groups" },
      actions: {
        help: "Help", messages: "Messages", friendRequests: "Friend Requests",
        createPost: "Create Post", logout: "Logout", signIn: "Sign In", back: "Back"
      },
      greeting: "Hi, {{name}}",
      lang: commonLangLabels,
    },
  },
  hi: {
    translation: {
      brand: "सहायता",
      nav: { community: "समुदाय", map: "मानचित्र दृश्य", connect: "कनेक्ट", groups: "समूह" },
      actions: {
        help: "सहायता", messages: "संदेश", friendRequests: "मित्र अनुरोध",
        createPost: "पोस्ट बनाएँ", logout: "लॉगआउट", signIn: "साइन इन", back: "वापस"
      },
      greeting: "नमस्ते, {{name}}",
      lang: commonLangLabels,
    },
  },
  es: {
    translation: {
      brand: "Sahayata",
      nav: { community: "Comunidad", map: "Mapa", connect: "Conectar", groups: "Grupos" },
      actions: {
        help: "Ayuda", messages: "Mensajes", friendRequests: "Solicitudes de amistad",
        createPost: "Crear publicación", logout: "Cerrar sesión", signIn: "Iniciar sesión", back: "Atrás"
      },
      greeting: "Hola, {{name}}",
      lang: commonLangLabels,
    },
  },
  mr: {
    translation: {
      brand: "सहायता",
      nav: { community: "समुदाय", map: "नकाशा दृश्य", connect: "जोडा", groups: "गट" },
      actions: {
        help: "मदत", messages: "संदेश", friendRequests: "मित्र विनंत्या",
        createPost: "पोस्ट तयार करा", logout: "लॉगआउट", signIn: "साइन इन", back: "मागे"
      },
      greeting: "नमस्कार, {{name}}",
      lang: commonLangLabels,
    },
  },
  gu: {
    translation: {
      brand: "સહાયતા",
      nav: { community: "સમુદાય", map: "નકશો દૃશ્ય", connect: "કનેક્ટ", groups: "ગ્રુપ્સ" },
      actions: {
        help: "મદદ", messages: "સંદેશા", friendRequests: "મિત્ર વિનંતીઓ",
        createPost: "પોસ્ટ બનાવો", logout: "લૉગઆઉટ", signIn: "સાઇન ઇન", back: "પાછળ"
      },
      greeting: "નમસ્તે, {{name}}",
      lang: commonLangLabels,
    },
  },
  bn: {
    translation: {
      brand: "সহায়তা",
      nav: { community: "সমাজ", map: "মানচিত্র দৃশ্য", connect: "কনেক্ট", groups: "গ্রুপ" },
      actions: {
        help: "সহায়তা", messages: "বার্তা", friendRequests: "বন্ধুত্ব অনুরোধ",
        createPost: "পোস্ট তৈরি করুন", logout: "লগ আউট", signIn: "সাইন ইন", back: "ফিরে যান"
      },
      greeting: "নমস্কার, {{name}}",
      lang: commonLangLabels,
    },
  },
  ta: {
    translation: {
      brand: "சகாயதா",
      nav: { community: "சமூகம்", map: "வரைபடம்", connect: "இணை", groups: "குழுக்கள்" },
      actions: {
        help: "உதவி", messages: "செய்திகள்", friendRequests: "நண்பர் கோரிக்கைகள்",
        createPost: "பதிவு உருவாக்கு", logout: "வெளியேறு", signIn: "உள்நுழை", back: "பின் செல்ல"
      },
      greeting: "வணக்கம், {{name}}",
      lang: commonLangLabels,
    },
  },
  te: {
    translation: {
      brand: "సహాయత",
      nav: { community: "సమాజం", map: "పటము దృశ్యం", connect: "కనెక్ట్", groups: "గుంపులు" },
      actions: {
        help: "సహాయం", messages: "సందేశాలు", friendRequests: "స్నేహితుల అభ్యర్థనలు",
        createPost: "పోస్ట్ సృష్టించండి", logout: "లాగౌట్", signIn: "సైన్ ఇన్", back: "వెనుకకు"
      },
      greeting: "నమస్తే, {{name}}",
      lang: commonLangLabels,
    },
  },
  kn: {
    translation: {
      brand: "ಸಹಾಯತಾ",
      nav: { community: "ಸಮುದಾಯ", map: "ನಕ್ಷೆ ದೃಶ್ಯ", connect: "ಕನೆಕ್ಟ್", groups: "ಗುಂಪುಗಳು" },
      actions: {
        help: "ಸಹಾಯ", messages: "ಸಂದೇಶಗಳು", friendRequests: "ಸ್ನೇಹ ವಿನಂತಿಗಳು",
        createPost: "ಪೋಸ್ಟ್ ರಚಿಸಿ", logout: "ಲಾಗ್ ಔಟ್", signIn: "ಸೈನ್ ಇನ್", back: "ಹಿಂದೆ"
      },
      greeting: "ನಮಸ್ಕಾರ, {{name}}",
      lang: commonLangLabels,
    },
  },
  pa: {
    translation: {
      brand: "ਸਹਾਇਤਾ",
      nav: { community: "ਭਾਈਚਾਰਾ", map: "ਨਕਸ਼ਾ ਦ੍ਰਿਸ਼", connect: "ਕਨੈਕਟ", groups: "ਗਰੁੱਪ" },
      actions: {
        help: "ਮਦਦ", messages: "ਸੁਨੇਹੇ", friendRequests: "ਦੋਸਤੀ ਬੇਨਤੀਆਂ",
        createPost: "ਪੋਸਟ ਬਣਾਓ", logout: "ਲਾਗ ਆਉਟ", signIn: "ਸਾਇਨ ਇਨ", back: "ਵਾਪਸ"
      },
      greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ, {{name}}",
      lang: commonLangLabels,
    },
  },
  ur: {
    translation: {
      brand: "سہایتا",
      nav: { community: "کمیونٹی", map: "نقشہ منظر", connect: "کنیکٹ", groups: "گروپس" },
      actions: {
        help: "مدد", messages: "پیغامات", friendRequests: "دوستی درخواستیں",
        createPost: "پوسٹ بنائیں", logout: "لاگ آؤٹ", signIn: "سائن اِن", back: "واپس"
      },
      greeting: "سلام، {{name}}",
      lang: commonLangLabels,
    },
  },
};

const initialLang = getInitialLang();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

// HTML <html lang="" dir=""> for accessibility + RTL
function applyLangAttrs(code) {
  if (!isBrowser) return;
  const rtl = ["ur"]; // add 'ar' if you add Arabic later
  document.documentElement.lang = code || "en";
  document.documentElement.dir = rtl.includes(code) ? "rtl" : "ltr";
}

applyLangAttrs(initialLang);

i18n.on("languageChanged", (lng) => {
  if (isBrowser) {
    try { window.localStorage.setItem("lang", lng); } catch {}
  }
  applyLangAttrs(lng);
});

export default i18n;
