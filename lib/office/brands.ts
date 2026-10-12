/**
 * One office, several brands. A brand picks the roster, the signs in the 3D
 * office, the header, the tour's example agent, the analyst behind the
 * dashboard chat and the extra dashboards. MT_BRAND is the white-label demo
 * at /office-demo; USFQ_BRAND is the university's office at /office-usfq.
 */
import type { Lang } from "./i18n";
import { botsFor, type Bot } from "./bots";
import { usfqBotsFor, USFQ_DIRECTORY } from "./usfqBots";

type Txt = { es: string; en: string };

export type OfficeBrand = {
  key: "mt" | "usfq";
  name: string;
  /** small word after the name in the header */
  tag: Txt;
  logo?: { src: string; w: number; h: number; alt: string };
  accent: string;
  home: string;
  botsFor: (lang: Lang) => Bot[];
  /** overrides for the texts painted in the 3D office */
  signs?: { logo?: string[]; welcome?: string[] };
  /** hotspot ids listed first in the Dashboards menu */
  dashboards: string[];
  /** the agent the tour opens, and how the tour introduces them */
  tourBot: string;
  tourScreen: Txt;
  intro: { title: Txt; text: Txt };
  wa: Txt;
  /** who answers the dashboard chats */
  analyst: string;
  directory?: typeof USFQ_DIRECTORY;
};

export const MT_BRAND: OfficeBrand = {
  key: "mt",
  name: "AI Management Office",
  tag: { es: "demo", en: "demo" },
  accent: "#2e6e63",
  home: "/",
  botsFor,
  dashboards: [],
  tourBot: "mateo",
  tourScreen: {
    es: "Seleccionamos a Mateo, de Soporte. Su panel muestra sus indicadores y su escritorio real en vivo: aquí está respondiendo tickets en Zendesk. Es como conectarte a su computador y mirar por encima de su hombro.",
    en: "We selected Mateo, from Support. His panel shows his metrics and his real desktop, live: here he is answering tickets in Zendesk. It is like connecting to his computer and looking over his shoulder.",
  },
  intro: {
    title: { es: "Bienvenido a tu oficina de gestión con IA", en: "Welcome to your AI Management Office" },
    text: {
      es: "Cada persona que ves es un empleado de IA con un rol real: ventas, soporte, finanzas, marketing, operaciones. Trabajan las 24 horas con tus herramientas y aquí puedes ver, preguntar y auditar todo lo que hacen. Este tour muestra cómo funciona.",
      en: "Everyone you see is an AI employee with a real role: sales, support, finance, marketing, operations. They work around the clock inside your tools, and here you can watch, ask and audit everything they do. This tour shows how it works.",
    },
  },
  wa: { es: "Hola, vi la demo de la oficina de gestión con IA y quiero saber más.", en: "Hi, I saw the AI Management Office demo and I would like to know more." },
  analyst: "tomas",
};

export const USFQ_BRAND: OfficeBrand = {
  key: "usfq",
  name: "USFQ · AI Office",
  tag: { es: "USFQ NEXT", en: "USFQ NEXT" },
  logo: { src: "/usfq/usfq-logo.svg", w: 76, h: 24, alt: "USFQ" },
  accent: "#e11b22",
  home: "/office-usfq/",
  botsFor: usfqBotsFor,
  signs: { logo: ["USFQ NEXT"], welcome: ["BIENVENIDOS"] },
  dashboards: ["next"],
  tourBot: "andrade",
  tourScreen: {
    es: "Seleccionamos a Alejandro Andrade, director de USFQ NEXT. Su panel muestra sus indicadores y su pantalla en vivo: el tablero de donaciones por vertical, donantes y proyectos. Es como mirar por encima de su hombro.",
    en: "We selected Alejandro Andrade, director of USFQ NEXT. His panel shows his metrics and his live screen: the donations dashboard by vertical, donors and projects. It is like looking over his shoulder.",
  },
  intro: {
    title: { es: "Bienvenido a la oficina de IA de la USFQ", en: "Welcome to USFQ's AI office" },
    text: {
      es: "Cada persona que ves es un agente de IA con el rol de alguien del organigrama: el Rectorado, las cinco vicepresidencias, Legal, el Ombudsman, Admisiones, Comunicación, Vinculación y USFQ NEXT. Trabajan las 24 horas y aquí puedes ver, preguntar y auditar lo que hacen.",
      en: "Everyone you see is an AI agent with the role of someone on the organisation chart: the Rector's office, the five vice-presidencies, Legal, the Ombudsman, Admissions, Communications, Engagement and USFQ NEXT. They work around the clock and here you can watch, ask and audit what they do.",
    },
  },
  wa: { es: "Hola, vi la oficina de IA de la USFQ y quiero saber más.", en: "Hi, I saw USFQ's AI office and I would like to know more." },
  analyst: "andrade",
  directory: USFQ_DIRECTORY,
};

export type BrandKey = OfficeBrand["key"];
/** pages pass the key (a server component cannot hand functions to a client one); OfficeDemo resolves it */
export const BRANDS: Record<BrandKey, OfficeBrand> = { mt: MT_BRAND, usfq: USFQ_BRAND };
