/**
 * Command Instinct's per-license verdict logic, ported from the routing
 * engine on commandinstinct.com (their compliance matrix, read from the OFAC
 * Venezuela general licenses). The demo runs every simulated shipment through
 * the same tests, so what the yard shows is what the real engine would say.
 *
 * china: "categorical" bars PRC persons and any entity they own, control or
 *        share a JV with; "nexus" bars only Venezuelan- or U.S.-organized
 *        entities owned, controlled by or in a JV with one.
 */
export const LICENSES = {
  "48D": { name: "GL 48D", china: "categorical", diluent: "prohibited", scope: "O&G / petrochem / electricity supply", venue: true, fgdf: true, jvBar: "(b)(5)", jvRoute: "49B" },
  "61A": { name: "GL 61A", china: "categorical", diluent: "na", scope: "Telecommunications", venue: true, jvBar: "(b)(5)", jvRoute: "62" },
  "54C": { name: "GL 54C", china: "categorical", diluent: "na", scope: "Minerals-ops supply", venue: true, fgdf: true, jvBar: "(b)(5)", jvRoute: "55A" },
  "50C": { name: "GL 50C", china: "categorical", diluent: "na", scope: "Named-entity O&G operations", venue: true, fgdf: true },
  "46E": { name: "GL 46E", china: "nexus", diluent: "na", scope: "Oil / petrochem import to U.S.", est: true, venue: true, fgdf: true },
  "51D": { name: "GL 51D", china: "nexus", diluent: "na", scope: "Minerals export", est: true, venue: true, fgdf: true, jvBar: "(b)(7)", jvRoute: "55A" },
  "52C": { name: "GL 52C", china: "nexus", diluent: "na", scope: "Broad PdVSA transactions", est: true, venue: true, fgdf: true },
  "47B": { name: "GL 47B", china: "none", diluent: "authorized", scope: "U.S.-origin diluents to Venezuela", venue: true, usDiluentOnly: true },
  "49B": { name: "GL 49B", china: "categorical", diluent: "na", scope: "Contingent contracts, O&G / electricity investment", contingent: true },
  "55A": { name: "GL 55A", china: "categorical", diluent: "na", scope: "Contingent contracts, coal / minerals investment", contingent: true },
};
export const ORIGIN_NAME = { US: "United States", DE: "Germany", CN: "China (PRC)", RU: "Russia", BR: "Brazil" };
export const OWNER_NAME = { clean: "No PRC ownership / control", "prc-owned": "PRC-owned or -controlled", "prc-jv": "JV with a PRC person" };
export const PAYMENT_NAME = { fgdf: "Foreign Govt Deposit Fund (E.O. 14373)", direct: "Direct to counterparty", na: "No payment to blocked person" };
export const SHIPPER_NAME = { established: "U.S. entity formed by Jan 29, 2025", "us-new": "U.S. entity formed after Jan 29, 2025", "non-us": "Non-U.S. entity" };
export const VENUE_NAME = { ok: "US, UK, France or Singapore", other: "Anywhere else", none: "No contract with GoV or PdVSA" };

/** Returns { license, checks: [tone, title, text][], fail }. tone: ok | no | wn */
export function evaluate(s) {
  const L = LICENSES[s.license];
  const checks = [];
  let fail = false;
  const no = (title, text) => {
    checks.push(["no", title, text]);
    fail = true;
  };
  const ok = (title, text) => checks.push(["ok", title, text]);
  const wn = (title, text) => checks.push(["wn", title, text]);
  const prc = s.owner === "prc-owned" || s.owner === "prc-jv";
  const how = s.owner === "prc-owned" ? "is PRC-owned / -controlled" : "is in a JV with a PRC person";

  if (L.china === "categorical") {
    if (s.origin === "CN") no("Categorical China bar", `${L.name} bars any PRC-origin component outright. Origin = China.`);
    else if (prc) no("Categorical China bar", `Distributor ${how}. ${L.name} also bars any entity owned or controlled by, or in a JV with, a PRC person, wherever it is organized. An origin-only screen would have cleared this.`);
    else ok("Categorical China bar", "Non-PRC origin and no PRC ownership, control or JV. Cleared.");
  } else if (L.china === "nexus") {
    if (prc) no("Nexus China bar", `Distributor ${how}. ${L.name} bars this regardless of component origin, the case an origin-only screen misses.`);
    else {
      ok("Nexus China bar", "No PRC ownership / control / JV. Cleared. Origin alone would not decide this.");
      if (s.origin === "CN") wn("Origin note", `Component is PRC-origin, but ${L.name} applies a nexus test. Origin is not the trigger here.`);
    }
  } else ok("China test", `${L.name} lists no China bar, the narrowest screen of the set.`);

  if (s.origin === "RU") {
    if (s.license === "47B") wn("Country list", "Russia is not in the 47B excluded-country list. 47B still covers only U.S.-origin diluents.");
    else no("Country bar", `Russia-origin component barred under ${L.name}.`);
  }

  if (s.diluent === "yes") {
    if (L.diluent === "prohibited") no("Diluent partition breach", `${L.name} (b)(6) expressly prohibits diluents. This must route via GL 47B.`);
    else if (L.diluent === "authorized") {
      if (L.usDiluentOnly && s.origin !== "US") no("Origin bar", `${L.name} authorizes only U.S.-origin diluents. This diluent is ${ORIGIN_NAME[s.origin] || s.origin} origin.`);
      else ok("Diluent lane", `U.S.-origin diluent. ${L.name} is the correct and only lane for diluent trade.`);
    } else no("Diluent lane", `Cargo is a diluent but ${L.name} does not authorize diluents. Route via GL 47B, walled off from this license.`);
  }

  ok("Carrier", "Carrier screened against the OFAC SDN list: no match by name, former name or IMO.");

  if (L.fgdf) {
    if (s.payment === "direct") no("Payment channel breach", `${L.name} requires payments to blocked persons to go into the FGDF (E.O. 14373), not direct.`);
    else if (s.payment === "fgdf") ok("Payment channel", "Payment routed via Foreign Govt Deposit Fund. E.O. 14373 satisfied.");
  } else if (s.payment === "direct") wn("Payment channel", `${L.name} carries no FGDF proviso, so its terms do not bar a direct payment. Confirm E.O. 14373 treatment separately.`);
  else if (s.payment === "fgdf") ok("Payment channel", `Payment routed via Foreign Govt Deposit Fund. ${L.name} carries no FGDF proviso.`);

  if (L.est) {
    if (s.shipper === "established") ok("Established U.S. entity", `Organized on or before January 29, 2025. ${L.name} is available to this party.`);
    else no("Established U.S. entity bar", `${L.name} authorizes only an entity organized under U.S. law on or before January 29, 2025. The authorized party is ${s.shipper === "us-new" ? "a U.S. entity organized after January 29, 2025" : "not a U.S. entity"}.`);
  }

  if (L.venue) {
    if (s.venue === "other") no("Dispute venue breach", `${L.name} requires any contract with the Government of Venezuela or PdVSA to place dispute resolution in the U.S., U.K., France or Singapore.`);
    else if (s.venue === "ok") ok("Dispute venue", `Dispute resolution sits in the U.S., U.K., France or Singapore, as ${L.name} requires.`);
  }

  if (s.jv === "yes") {
    if (L.contingent) ok("New JV", `${L.name} authorizes forming a new JV in Venezuela as a contingent contract.`);
    else if (L.jvBar) no("New JV bar", `${L.name} ${L.jvBar} does not authorize forming new joint ventures or other entities in Venezuela in this sector.`);
    else wn("New JV", `${L.name} does not expressly authorize forming a new JV in Venezuela. Route through a contingent-contract license or a specific OFAC license.`);
  }

  if (L.usDiluentOnly && s.diluent !== "yes") no("Out of scope", `${L.name} authorizes only the sale of U.S.-origin diluents to Venezuela. This cargo is not a diluent.`);
  if (L.contingent) wn("Contingent only", `${L.name} authorizes negotiating and signing. Performance needs a separate OFAC license.`);

  return { license: L, checks, fail };
}

/** Ranked execution options: [title, action, deliverables][] */
export function substitutes(s) {
  const L = LICENSES[s.license];
  const opts = [];
  if (s.diluent === "yes" && L.diluent !== "authorized") opts.push(["Re-lane to GL 47B", "Move the diluent cargo onto the GL 47B pathway; wall it off from this license's scope.", "Compliant lane · 47B reporting cadence (10d, then 90d)"]);
  if (s.origin === "CN" && L.china === "categorical") opts.push(["Substitute non-PRC Tier-1 part", "Isolate the PRC-origin component; reroute an equivalent non-PRC substitute via an adjacent LatAm hub (Cartagena / Panamá).", "Substitute identity · hub location · freight capacity · revised transit time"]);
  if ((s.owner === "prc-owned" || s.owner === "prc-jv") && L.china !== "none") opts.push(["Re-source through a non-PRC-owned distributor", "Same component, compliant channel: route through a distributor with no PRC ownership / control / JV nexus.", "Verified distributor · UBO-cleared · lead time · landed-compliance status"]);
  if (s.origin === "RU" && s.license !== "47B") opts.push(["Substitute non-Russian component", "Isolate the Russia-origin part; secondary-source a verified compliant equivalent.", "Verified alternate supplier · inventory · lead time · landed status"]);
  if (s.payment === "direct" && L.fgdf) opts.push(["Reroute payment to FGDF", "Redirect the payment to blocked persons into the E.O. 14373 Foreign Govt Deposit Fund.", "FGDF channel confirmation · payment audit record"]);
  if (L.est && s.shipper !== "established") opts.push(["Contract through an established U.S. entity", "Have a U.S. entity organized on or before January 29, 2025 act as the contracting and exporting party.", "Qualifying counterparty · incorporation date evidence · contract assignment"]);
  if (L.venue && s.venue === "other") opts.push(["Amend the dispute resolution clause", "Move dispute resolution in the contract with the Government of Venezuela or PdVSA to a U.S., U.K., French or Singapore forum.", "Contract amendment · counterparty sign-off"]);
  if (L.jvBar && s.jv === "yes") opts.push([`Sign the JV as a contingent contract under GL ${L.jvRoute}`, `GL ${L.jvRoute} authorizes negotiating and entering a new JV, with performance made expressly contingent on a specific OFAC license.`, "Contingent contract · specific license application · no performance until authorized"]);
  if (L.usDiluentOnly && s.diluent === "yes" && s.origin !== "US") opts.push(["Source a U.S.-origin diluent", "Replace the diluent with a U.S.-origin equivalent so the cargo falls inside GL 47B.", "U.S. supplier · origin documentation · 47B reporting (10d, then 90d)"]);
  if (!opts.length) opts.push(["Secondary sourcing on standby", "No substitution required for this shipment. Verified-supplier protocol remains available if conditions change in transit.", "Alternate suppliers · inventory availability · lead time"]);
  return opts;
}

const base = { origin: "US", owner: "clean", diluent: "no", payment: "fgdf", shipper: "established", venue: "ok", jv: "no" };
/** Simulated shipments. Shippers and distributors are invented for the demo. */
export const SCENARIOS = [
  { ...base, license: "48D", cargo: "Wellhead valve assemblies", shipper_co: "Gulf Coast Valve Co.", dist: "Meridian Industrial Supply", to: "Puerto La Cruz" },
  { ...base, license: "48D", origin: "CN", cargo: "Variable-frequency drives", shipper_co: "Lone Star Power Systems", dist: "Meridian Industrial Supply", to: "Maracaibo" },
  { ...base, license: "46E", origin: "CN", cargo: "Tank gauging sensors", shipper_co: "Bayou Terminal Services", dist: "Northline Instruments", to: "Houston, TX" },
  { ...base, license: "46E", origin: "DE", owner: "prc-owned", cargo: "Loading-arm couplings", shipper_co: "Bayou Terminal Services", dist: "Harbor Pacific Trading", to: "Houston, TX" },
  { ...base, license: "47B", diluent: "yes", payment: "na", cargo: "Heavy naphtha diluent", shipper_co: "Sabine Blending LLC", dist: "Sabine Blending LLC", to: "Jose terminal" },
  { ...base, license: "48D", diluent: "yes", cargo: "Light naphtha diluent", shipper_co: "Sabine Blending LLC", dist: "Sabine Blending LLC", to: "Jose terminal" },
  { ...base, license: "61A", origin: "DE", payment: "na", cargo: "Fiber transmission shelves", shipper_co: "Great Lakes Telecom Export", dist: "Rheinland Netzwerk GmbH", to: "Caracas" },
  { ...base, license: "52C", payment: "direct", cargo: "Compressor spare parts", shipper_co: "Permian Rotating Equipment", dist: "Meridian Industrial Supply", to: "Puerto La Cruz" },
  { ...base, license: "50C", cargo: "Drill pipe, 5 in", shipper_co: "Red River Tubulars", dist: "Red River Tubulars", to: "El Tigre" },
  { ...base, license: "48D", origin: "BR", owner: "prc-jv", cargo: "Medium-voltage switchgear", shipper_co: "Lone Star Power Systems", dist: "Atlantico Eletrica JV", to: "Maracaibo" },
  { ...base, license: "54C", origin: "DE", cargo: "Conveyor gearboxes", shipper_co: "Great Lakes Mining Supply", dist: "Rheinland Antriebe GmbH", to: "Ciudad Guayana" },
  { ...base, license: "51D", shipper: "us-new", cargo: "Assay lab equipment", shipper_co: "Orinoco Minerals Trading LLC", dist: "Northline Instruments", to: "Ciudad Guayana" },
  { ...base, license: "54C", origin: "RU", cargo: "Haul-truck engine blocks", shipper_co: "Great Lakes Mining Supply", dist: "Volga Heavy Parts", to: "Ciudad Guayana" },
  { ...base, license: "52C", cargo: "Pipeline inspection tools", shipper_co: "Permian Rotating Equipment", dist: "Northline Instruments", to: "Puerto La Cruz" },
  { ...base, license: "48D", jv: "yes", cargo: "Gas turbine package", shipper_co: "Lone Star Power Systems", dist: "Meridian Industrial Supply", to: "Maracaibo" },
  { ...base, license: "61A", payment: "na", cargo: "Microwave backhaul radios", shipper_co: "Great Lakes Telecom Export", dist: "Northline Instruments", to: "Valencia" },
];
