import i18n from "i18next";
import { initReactI18next } from "react-i18next";

/**
 * Translations
 * You can expand these freely. Keys used by your UI:
 *   brand, nav.*, actions.*, greeting, lang.*
 */
const langLabels = {
  en: "English (US)",
  hi: "हिन्दी",
  mr: "मराठी",
  bn: "বাংলা",
  gu: "ગુજરાતી",
  ta: "தமிழ்",
  te: "తెలుగు",
  kn: "ಕನ್ನಡ",
  pa: "ਪੰਜਾਬੀ",
  ur: "اردو",
  bho: "भोजपुरी",
  awa: "अवधी",
  mai: "मैथिली",
  ml: "മലയാളം",
};

const resources = {
  en: {
    translation: {
      brand: "Sahayata",
      nav: { community: "Community", map: "Map View", connect: "Connect", groups: "Groups" },
      actions: {
        back: "Back",
        help: "Help",
        messages: "Messages",
        friendRequests: "Friend Requests",
        createPost: "Create Post",
        logout: "Logout",
        signIn: "Sign In",
      },
      greeting: "Hi, {{name}}",
      lang: { ...langLabels },
    },
  },
  hi: {
    translation: {
      brand: "सहायता",
      nav: { community: "समुदाय", map: "मानचित्र", connect: "कनेक्ट", groups: "समूह" },
      actions: {
        back: "वापस",
        help: "मदद",
        messages: "संदेश",
        friendRequests: "मित्र अनुरोध",
        createPost: "पोस्ट बनाएँ",
        logout: "लॉगआउट",
        signIn: "साइन इन",
      },
      greeting: "नमस्ते, {{name}}",
      lang: { ...langLabels },
    },
  },
  mr: {
    translation: {
      brand: "सहाय्यता",
      nav: { community: "समूह", map: "नकाशा", connect: "जोडा", groups: "गट" },
      actions: {
        back: "मागे",
        help: "मदत",
        messages: "संदेश",
        friendRequests: "मित्र विनंत्या",
        createPost: "पोस्ट तयार करा",
        logout: "लॉगआउट",
        signIn: "साइन इन",
      },
      greeting: "नमस्कार, {{name}}",
      lang: { ...langLabels },
    },
  },
  bn: {
    translation: {
      brand: "সহায়তা",
      nav: { community: "কমিউনিটি", map: "মানচিত্র", connect: "কনেক্ট", groups: "গ্রুপ" },
      actions: {
        back: "ফিরে যান",
        help: "সাহায্য",
        messages: "বার্তা",
        friendRequests: "বন্ধু অনুরোধ",
        createPost: "পোস্ট তৈরি করুন",
        logout: "লগআউট",
        signIn: "সাইন ইন",
      },
      greeting: "হ্যালো, {{name}}",
      lang: { ...langLabels },
    },
  },
  gu: {
    translation: {
      brand: "સહાયતા",
      nav: { community: "સમુદાય", map: "નકશો", connect: "કનેક્ટ", groups: "સમૂહો" },
      actions: {
        back: "પાછળ",
        help: "મદદ",
        messages: "સંદેશા",
        friendRequests: "મિત્ર વિનંતિઓ",
        createPost: "પોસ્ટ બનાવો",
        logout: "લૉગઆઉટ",
        signIn: "સાઇન ઇન",
      },
      greeting: "નમસ્તે, {{name}}",
      lang: { ...langLabels },
    },
  },
  ta: {
    translation: {
      brand: "சகாயதா",
      nav: { community: "சமூகங்கள்", map: "வரைபடம்", connect: "இணை", groups: "குழுக்கள்" },
      actions: {
        back: "பின்",
        help: "உதவி",
        messages: "செய்திகள்",
        friendRequests: "நண்பர் கோரிக்கைகள்",
        createPost: "பதிவு உருவாக்கு",
        logout: "லாக் அவுட்",
        signIn: "சைன் இன்",
      },
      greeting: "வணக்கம், {{name}}",
      lang: { ...langLabels },
    },
  },
  te: {
    translation: {
      brand: "సహాయత",
      nav: { community: "సమూహం", map: "మ్యాప్", connect: "కనెక్ట్", groups: "గ్రూప్స్" },
      actions: {
        back: "వెనక్కి",
        help: "సహాయం",
        messages: "సందేశాలు",
        friendRequests: "స్నేహితుల అభ్యర్థనలు",
        createPost: "పోస్ట్ సృష్టించండి",
        logout: "లాగౌట్",
        signIn: "సైన్ ఇన్",
      },
      greeting: "నమస్తే, {{name}}",
      lang: { ...langLabels },
    },
  },
  kn: {
    translation: {
      brand: "ಸಹಾಯತಾ",
      nav: { community: "ಸಮುದಾಯ", map: "ನಕ್ಷೆ", connect: "ಕನೆಕ್ಟ್", groups: "ಗುಂಪುಗಳು" },
      actions: {
        back: "ಹಿಂದೆ",
        help: "ಸಹಾಯ",
        messages: "ಸಂದೇಶಗಳು",
        friendRequests: "ಸ್ನೇಹಿತರ ವಿನಂತಿಗಳು",
        createPost: "ಪೋಸ್ಟ್ ರಚಿಸಿ",
        logout: "ಲಾಗೌಟ್",
        signIn: "ಸೈನ್ ಇನ್",
      },
      greeting: "ನಮಸ್ಕಾರ, {{name}}",
      lang: { ...langLabels },
    },
  },
  pa: {
    translation: {
      brand: "ਸਹਾਇਤਾ",
      nav: { community: "ਕਮਿਊਨਿਟੀ", map: "ਨਕਸ਼ਾ", connect: "ਕਨੈਕਟ", groups: "ਗ੍ਰੁੱਪ" },
      actions: {
        back: "ਪਿੱਛੇ",
        help: "ਮਦਦ",
        messages: "ਸੁਨੇਹੇ",
        friendRequests: "ਦੋਸਤ ਅਰਜ਼ੀਆਂ",
        createPost: "ਪੋਸਟ ਬਣਾਓ",
        logout: "ਲਾਗਆਉਟ",
        signIn: "ਸਾਈਨ ਇਨ",
      },
      greeting: "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ, {{name}}",
      lang: { ...langLabels },
    },
  },
  ur: {
    translation: {
      brand: "سہایتا",
      nav: { community: "برادری", map: "نقشہ", connect: "کنیکٹ", groups: "گروپس" },
      actions: {
        back: "واپس",
        help: "مدد",
        messages: "پیغامات",
        friendRequests: "دوستی درخواستیں",
        createPost: "پوسٹ بنائیں",
        logout: "لاگ آؤٹ",
        signIn: "سائن اِن",
      },
      greeting: "سلام، {{name}}",
      lang: { ...langLabels },
    },
  },
  bho: {
    translation: {
      brand: "सहायता",
      nav: { community: "समुदाय", map: "नक्शा", connect: "जुड़ीं", groups: "गुरूप" },
      actions: {
        back: "पाछू",
        help: "सहायता",
        messages: "संदेस",
        friendRequests: "दोस्ती निवेदन",
        createPost: "पोस्ट बनाईं",
        logout: "लॉगआउट",
        signIn: "साइन इन",
      },
      greeting: "नमस्कार, {{name}}",
      lang: { ...langLabels },
    },
  },
  awa: {
    translation: {
      brand: "सहायता",
      nav: { community: "समुदाय", map: "नक़्सा", connect: "जुड़ि", groups: "गुरुप" },
      actions: {
        back: "पाछे",
        help: "मदद",
        messages: "संदेस",
        friendRequests: "दोस्त निवेदन",
        createPost: "पोस्ट बनाव",
        logout: "लॉगआउट",
        signIn: "साइन इन",
      },
      greeting: "नमस्ते, {{name}}",
      lang: { ...langLabels },
    },
  },
  mai: {
    translation: {
      brand: "सहायता",
      nav: { community: "समुदाय", map: "नक्शा", connect: "जोड़ू", groups: "समूह" },
      actions: {
        back: "पाछू",
        help: "सहायता",
        messages: "संदेश",
        friendRequests: "सखिया निवेदन",
        createPost: "पोस्ट बनाउ",
        logout: "लॉगआउट",
        signIn: "साइन इन",
      },
      greeting: "नमस्कार, {{name}}",
      lang: { ...langLabels },
    },
  },
  ml: {
    translation: {
      brand: "സഹായത",
      nav: { community: "കമ്മ്യൂണിറ്റി", map: "മാപ്പ്", connect: "കണക്റ്റ്", groups: "ഗ്രൂപ്പുകൾ" },
      actions: {
        back: "തിരികെ",
        help: "സഹായം",
        messages: "സന്ദേശങ്ങൾ",
        friendRequests: "സുഹൃത്ത് അഭ്യർത്ഥനകൾ",
        createPost: "പോസ്റ്റ് സൃഷ്‌ടിക്കുക",
        logout: "ലോഗ് ഔട്ട്",
        signIn: "സൈൻ ഇൻ",
      },
      greeting: "നമസ്കാരം, {{name}}",
      lang: { ...langLabels },
    },
  },
};

// Restore saved language from localStorage (key: "lang")
let savedLang = "en";
try {
  const s = localStorage.getItem("lang");
  if (s && typeof s === "string") savedLang = s.split("-")[0];
} catch {}

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,                 // start with saved language
  fallbackLng: "en",
  supportedLngs: Object.keys(langLabels),
  nonExplicitSupportedLngs: true,
  load: "languageOnly",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
