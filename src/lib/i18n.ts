export type Locale = "en" | "hr";

export function getLocale(input: string): Locale {
  return input === "hr" ? "hr" : "en";
}

const dict = {
  en: {
    nav: {
      properties: "Properties",
      messages: "Messages",
      pricing: "Pricing",
      login: "Login",
      logout: "Logout",
      dashboard: "Dashboard",
    },
    common: {
      back: "Back",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      new: "New",
      search: "Search",
      clear: "Clear",
      copied: "Copied ✅",
      copyLink: "Copy link",
      print: "Print",
    },
    properties: {
      title: "Properties",
      subtitle: "Manage your properties and view guest messages.",
      newProperty: "New property",
      yourList: "Your list",
      total: "total",
      created: "Created",
      noProperties: "No properties yet. Create your first one.",
      instructions: "Guest instructions",
      printInstructions: "Print instructions",
      openInstructions: "Open instructions",
    },
    instructions: {
      title: "Guest instructions",
      subtitle: "Print this and place it in the property (QR opens a simple guest page).",
      scanToChat: "Scan to chat",
      backupLink: "Backup link (if QR doesn’t work)",
      editProperty: "Edit property",
      enLabel: "EN",
      hrLabel: "HR",
      stepsEn: [
        "Scan the QR code (or open the link below).",
        "Tap “Open WhatsApp”.",
        "Ask any question — you’ll get an instant reply.",
      ],
      stepsHr: [
        "Skeniraj QR kod (ili otvori link ispod).",
        "Klikni “Otvori WhatsApp”.",
        "Postavi pitanje — dobit ćeš brz odgovor.",
      ],
    },
    inbox: {
      title: "Inbox",
      noMessages: "No messages yet.",
      placeholder: "Search guest messages or bot replies…",
      page: "Page",
      of: "of",
      prev: "Prev",
      next: "Next",
      replyWhatsapp: "Reply in WhatsApp",
      guest: "Guest",
      bot: "Bot",
      handoff: "Handoff",
      ai: "AI",
    },
  },

  hr: {
    nav: {
      properties: "Objekti",
      messages: "Poruke",
      pricing: "Cijene",
      login: "Prijava",
      logout: "Odjava",
      dashboard: "Nadzorna ploča",
    },
    common: {
      back: "Natrag",
      edit: "Uredi",
      save: "Spremi",
      cancel: "Odustani",
      delete: "Obriši",
      new: "Novo",
      search: "Traži",
      clear: "Očisti",
      copied: "Kopirano ✅",
      copyLink: "Kopiraj link",
      print: "Ispis",
    },
    properties: {
      title: "Objekti",
      subtitle: "Upravljaj objektima i pregledaj poruke gostiju.",
      newProperty: "Novi objekt",
      yourList: "Tvoj popis",
      total: "ukupno",
      created: "Kreirano",
      noProperties: "Još nema objekata. Kreiraj prvi.",
      instructions: "Upute za goste",
      printInstructions: "Ispiši upute",
      openInstructions: "Otvori upute",
    },
    instructions: {
      title: "Upute za goste",
      subtitle: "Ispiši i ostavi u objektu (QR otvara jednostavnu stranicu za gosta).",
      scanToChat: "Skeniraj za chat",
      backupLink: "Backup link (ako QR ne radi)",
      editProperty: "Uredi objekt",
      enLabel: "EN",
      hrLabel: "HR",
      stepsEn: [
        "Scan the QR code (or open the link below).",
        "Tap “Open WhatsApp”.",
        "Ask any question — you’ll get an instant reply.",
      ],
      stepsHr: [
        "Skeniraj QR kod (ili otvori link ispod).",
        "Klikni “Otvori WhatsApp”.",
        "Postavi pitanje — dobit ćeš brz odgovor.",
      ],
    },
    inbox: {
      title: "Inbox",
      noMessages: "Još nema poruka.",
      placeholder: "Traži po porukama gosta ili odgovoru bota…",
      page: "Stranica",
      of: "od",
      prev: "Preth",
      next: "Sljed",
      replyWhatsapp: "Odgovori u WhatsAppu",
      guest: "Gost",
      bot: "Bot",
      handoff: "Preuzimanje",
      ai: "AI",
    },
  },
} as const;

export function t(locale: string) {
  return dict[getLocale(locale)];
}