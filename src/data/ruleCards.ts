import { RuleCard } from '../types/ruleCard';

// NAVIGEN RuleCard Database v1.0
// Maritime compliance rules for worldwide operations

export const ruleCards: RuleCard[] = [
  {
    id: "POLAR_001",
    version: "1.0.0",
    status: "Active",
    severity: "MUST",
    statement: "Vessel operating within the IMO N60 Polar Area must comply with the Polar Code.",
    authority: {
      regime: "IMO",
      instrument: "Polar Code",
      reference: "SOLAS XIV / Polar Code Part I-A"
    },
    applicability: {
      areas: [{ areaId: "IMO_N60", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Polar Code applies to ships operating in polar waters; this card gates the polar compliance set.",
      actions: [
        { text: "Confirm Polar Ship Certificate available on bridge.", type: "CHECK" },
        { text: "Review PWOM limitations prior to entry.", type: "PROCEDURE" }
      ],
      exceptions: [],
      links: [],
      fullText: `SOLAS CHAPTER XIV - SAFETY MEASURES FOR SHIPS OPERATING IN POLAR WATERS`,
      procedures: [
        "Obtain and verify Polar Ship Certificate is valid and covers the intended operational area",
        "Review the Polar Water Operational Manual (PWOM) and confirm vessel is suitable for intended operations",
        "Verify crew training requirements for polar operations are met",
        "Confirm ice navigator qualifications if operating in ice-covered waters"
      ],
      complianceChecklist: [
        "Polar Ship Certificate on board and valid",
        "PWOM available on bridge and limitations understood by OOW",
        "Crew trained for polar operations",
        "Polar survival equipment checked and ready"
      ],
      documentation: [
        "Polar Ship Certificate",
        "Polar Water Operational Manual (PWOM)"
      ]
    },
    ops: {
      audience: ["BRIDGE", "MASTER"],
      module: "COMPLIANCE",
      tags: ["POLAR", "CERTIFICATES", "PWOM"]
    },
    ui: {
      title: "Polar Code applicability",
      compact: true,
      suppressible: false,
      priority: 900
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-02-09T00:00:00Z",
      updatedAt: "2026-02-09T00:00:00Z"
    }
  },

  {
    id: "POLAR_002",
    version: "1.0.0",
    status: "Active",
    severity: "MUST",
    statement: "Polar Water Operational Manual (PWOM) must be available and limitations observed.",
    authority: {
      regime: "IMO",
      instrument: "Polar Code",
      reference: "Polar Code Part I-A, Ch.2"
    },
    applicability: {
      areas: [{ areaId: "IMO_N60", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "PWOM defines vessel operational limitations in ice and low temperature conditions.",
      actions: [
        { text: "Verify PWOM on bridge and accessible to OOW.", type: "CHECK" },
        { text: "Confirm current environmental conditions within PWOM limitations.", type: "PROCEDURE" },
        { text: "Report any PWOM exceedances to Master immediately.", type: "LIMIT" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER"],
      module: "COMPLIANCE",
      tags: ["POLAR", "PWOM", "OPERATIONS"]
    },
    ui: {
      title: "PWOM compliance",
      compact: true,
      suppressible: false,
      priority: 850
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-02-09T00:00:00Z",
      updatedAt: "2026-02-09T00:00:00Z"
    }
  },

  {
    id: "SVALBARD_001",
    version: "1.0.0",
    status: "Active",
    severity: "MUST",
    statement: "All vessels within Svalbard territorial waters must comply with Svalbardmiljøloven.",
    authority: {
      regime: "National",
      instrument: "Svalbardmiljøloven",
      reference: "LOV-2001-06-15-79"
    },
    applicability: {
      areas: [{ areaId: "SVALBARD_12NM", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Norwegian environmental protection law for Svalbard archipelago with strict discharge and wildlife protection requirements.",
      actions: [
        { text: "Zero discharge policy in effect - no waste overboard.", type: "LIMIT" },
        { text: "Maintain 300m distance from polar bears, walrus colonies.", type: "LIMIT" },
        { text: "Heavy fuel oil (HFO) carriage and use prohibited.", type: "LIMIT" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER", "SAFETY"],
      module: "COMPLIANCE",
      tags: ["SVALBARD", "ENVIRONMENT", "DISCHARGE", "WILDLIFE"]
    },
    ui: {
      title: "Svalbard environmental protection",
      compact: false,
      suppressible: false,
      priority: 880
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-02-09T00:00:00Z",
      updatedAt: "2026-02-09T00:00:00Z"
    }
  },

  {
    id: "IAATO_001",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "IAATO member vessels should follow IAATO site-specific guidelines for Svalbard landings.",
    authority: {
      regime: "Company",
      instrument: "IAATO Guidelines",
      reference: "IAATO Svalbard Operational Guidelines 2025"
    },
    applicability: {
      areas: [{ areaId: "SVALBARD_12NM", condition: "INSIDE" }],
      vessel: { type: ["PASSENGER", "EXPEDITION"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "IAATO guidelines provide best-practice protocols for expedition vessel operations and guest landings.",
      actions: [
        { text: "Review site-specific landing guidelines before Zodiac operations.", type: "PROCEDURE" },
        { text: "Brief guests on wildlife approach distances and cultural site protocols.", type: "PROCEDURE" },
        { text: "Maintain maximum 100 guests ashore per site.", type: "LIMIT" }
      ],
      exceptions: ["Non-IAATO vessels are not bound but guidelines represent best practice"],
      links: []
    },
    ops: {
      audience: ["EXPEDITION", "BRIDGE"],
      module: "COMPLIANCE",
      tags: ["IAATO", "EXPEDITION", "LANDING", "GUESTS"]
    },
    ui: {
      title: "IAATO landing protocols",
      compact: true,
      suppressible: true,
      priority: 600
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-02-09T00:00:00Z",
      updatedAt: "2026-02-09T00:00:00Z"
    }
  },

  {
    id: "MARPOL_ANNEX_I",
    version: "1.0.0",
    status: "Active",
    severity: "MUST",
    statement: "Oil discharge within Special Areas (including Arctic) is prohibited except as permitted by MARPOL Annex I.",
    authority: {
      regime: "IMO",
      instrument: "MARPOL",
      reference: "MARPOL Annex I, Reg 15"
    },
    applicability: {
      areas: [{ areaId: "IMO_N60", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Arctic waters designated as Special Area under MARPOL with stricter discharge standards.",
      actions: [
        { text: "No oil or oily mixtures discharge permitted.", type: "LIMIT" },
        { text: "Ensure oily water separator secured or alarmed if not meeting requirements.", type: "CHECK" },
        { text: "Log all tank operations in Oil Record Book.", type: "PROCEDURE" }
      ],
      exceptions: ["Emergency discharge per MARPOL Annex I Reg 11"],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "SAFETY"],
      module: "COMPLIANCE",
      tags: ["MARPOL", "DISCHARGE", "OIL", "ENVIRONMENT"]
    },
    ui: {
      title: "MARPOL Annex I - Arctic Special Area",
      compact: true,
      suppressible: false,
      priority: 800
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-02-09T00:00:00Z",
      updatedAt: "2026-02-09T00:00:00Z"
    }
  },

  {
    id: "POLAR_003",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "Vessel should maintain ice navigation watch protocols when operating in ice-covered waters.",
    authority: {
      regime: "IMO",
      instrument: "Polar Code",
      reference: "Polar Code Part I-A, Ch.11 (Voyage Planning)"
    },
    applicability: {
      areas: [{ areaId: "IMO_N60", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Enhanced watchkeeping ensures safe navigation in challenging ice conditions.",
      actions: [
        { text: "Post dedicated ice lookout when ice concentration >1/10.", type: "PROCEDURE" },
        { text: "Maintain continuous ice radar monitoring.", type: "PROCEDURE" },
        { text: "Reduce speed appropriate to ice conditions and visibility.", type: "LIMIT" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE"],
      module: "COMPLIANCE",
      tags: ["POLAR", "WATCHKEEPING", "ICE", "NAVIGATION"]
    },
    ui: {
      title: "Ice navigation watch",
      compact: true,
      suppressible: false,
      priority: 700
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-02-09T00:00:00Z",
      updatedAt: "2026-02-09T00:00:00Z"
    }
  },

  {
    id: "CONSIDER_001",
    version: "1.0.0",
    status: "Active",
    severity: "CONSIDER",
    statement: "Consider filing voyage plan with Norwegian authorities when operating in Svalbard waters.",
    authority: {
      regime: "National",
      instrument: "Sysselmannen Guidelines",
      reference: "Voluntary reporting guideline"
    },
    applicability: {
      areas: [{ areaId: "SVALBARD_12NM", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "While not mandatory for all vessels, voyage plan sharing enhances SAR coordination and environmental monitoring.",
      actions: [
        { text: "Email voyage plan to Sysselmannen.", type: "NOTE" },
        { text: "Include ETA/ETD for major ports and landing sites.", type: "NOTE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["MASTER"],
      module: "COMPLIANCE",
      tags: ["SVALBARD", "SAR", "REPORTING"]
    },
    ui: {
      title: "Voluntary voyage reporting",
      compact: true,
      suppressible: true,
      priority: 300
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-02-09T00:00:00Z",
      updatedAt: "2026-02-09T00:00:00Z"
    }
  },

  {
    id: "SVALBARD_PROTECTED_001",
    version: "1.0.0",
    status: "Active",
    severity: "MUST",
    statement: "Vessel operations in Svalbard National Parks and Nature Reserves are strictly regulated under Svalbardmiljøloven.",
    authority: {
      regime: "National",
      instrument: "Svalbardmiljøloven",
      reference: "LOV-2001-06-15-79 §§26-30"
    },
    applicability: {
      areas: [{ areaId: "SVALBARD_PROTECTED", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "National parks and nature reserves require special permits and adherence to strict environmental protection rules.",
      actions: [
        { text: "Verify Governor's permit for entry into protected area.", type: "CHECK" },
        { text: "Strictly prohibited: landing, anchoring, or disturbance without permit.", type: "LIMIT" },
        { text: "All waste must be retained onboard - zero discharge.", type: "LIMIT" },
        { text: "Maintain minimum 300m distance from bird colonies and wildlife.", type: "LIMIT" }
      ],
      exceptions: ["Emergency situations per Governor's emergency regulations"],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER", "EXPEDITION"],
      module: "COMPLIANCE",
      tags: ["SVALBARD", "PROTECTED_AREA", "PERMIT", "WILDLIFE", "ENVIRONMENT"]
    },
    ui: {
      title: "Svalbard Protected Area - Permit Required",
      compact: false,
      suppressible: false,
      priority: 950
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-01T00:00:00Z",
      updatedAt: "2026-03-01T00:00:00Z"
    }
  },

  {
    id: "SVALBARD_PROTECTED_002",
    version: "1.0.0",
    status: "Active",
    severity: "MUST",
    statement: "Landing in Svalbard protected areas requires advance permit from the Governor of Svalbard.",
    authority: {
      regime: "National",
      instrument: "Forskrift om turismevirksomhet mv.",
      reference: "FOR-1991-05-31-581 §4"
    },
    applicability: {
      areas: [{ areaId: "SVALBARD_PROTECTED", condition: "INSIDE" }],
      vessel: { type: ["PASSENGER", "EXPEDITION"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Tourist landings in protected areas must be pre-approved by Sysselmannen to control environmental impact.",
      actions: [
        { text: "Confirm landing permit obtained from Governor's office.", type: "CHECK" },
        { text: "Adhere to permit conditions.", type: "PROCEDURE" },
        { text: "Brief expedition staff on site-specific restrictions.", type: "PROCEDURE" },
        { text: "No deviation from approved landing sites or routes.", type: "LIMIT" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["EXPEDITION", "MASTER"],
      module: "COMPLIANCE",
      tags: ["SVALBARD", "LANDING", "PERMIT", "EXPEDITION"]
    },
    ui: {
      title: "Protected Area Landing Permit",
      compact: false,
      suppressible: false,
      priority: 920
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-01T00:00:00Z",
      updatedAt: "2026-03-01T00:00:00Z"
    }
  },

  {
    id: "SVALBARD_PROTECTED_003",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "Vessels should maintain detailed wildlife observation logs when transiting protected areas.",
    authority: {
      regime: "National",
      instrument: "Governor's Guidelines",
      reference: "Sysselmannen Environmental Monitoring Program"
    },
    applicability: {
      areas: [{ areaId: "SVALBARD_PROTECTED", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Wildlife observations in protected areas contribute to scientific monitoring and help assess environmental impact.",
      actions: [
        { text: "Log all marine mammal sightings.", type: "PROCEDURE" },
        { text: "Report unusual wildlife behavior.", type: "PROCEDURE" },
        { text: "Photograph and document environmental concerns.", type: "PROCEDURE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "EXPEDITION"],
      module: "COMPLIANCE",
      tags: ["SVALBARD", "WILDLIFE", "MONITORING", "ENVIRONMENT"]
    },
    ui: {
      title: "Wildlife Monitoring in Protected Areas",
      compact: true,
      suppressible: true,
      priority: 500
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-01T00:00:00Z",
      updatedAt: "2026-03-01T00:00:00Z"
    }
  },

  {
    id: "SVALBARD_PROTECTED_004",
    version: "1.0.0",
    status: "Active",
    severity: "CONSIDER",
    statement: "Consider engaging certified Svalbard guide when operating in protected areas.",
    authority: {
      regime: "Best Practice",
      instrument: "Governor's Recommendations",
      reference: "Sysselmannen Tourism Guidelines 2025"
    },
    applicability: {
      areas: [{ areaId: "SVALBARD_PROTECTED", condition: "INSIDE" }],
      vessel: { type: ["PASSENGER", "EXPEDITION"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Local certified guides have specialized knowledge of protected area regulations and environmental sensitivities.",
      actions: [
        { text: "Consider hiring Svalbard-certified guide for enhanced compliance.", type: "PROCEDURE" },
        { text: "Guide can provide real-time interpretation of local conditions and restrictions.", type: "PROCEDURE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["EXPEDITION", "MASTER"],
      module: "COMPLIANCE",
      tags: ["SVALBARD", "GUIDE", "BEST_PRACTICE"]
    },
    ui: {
      title: "Certified Guide Recommendation",
      compact: true,
      suppressible: true,
      priority: 400
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-01T00:00:00Z",
      updatedAt: "2026-03-01T00:00:00Z"
    }
  },

  // ==========================
  // GREENLAND / SERMERSOOQ V1
  // ==========================

  {
    id: "GREENLAND_TASIILAQ_SERMILIK_001",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "Sermilik, Isittivaq and Kangittarpik should be treated as closed year-round for external vessels under the Tasiilaq zoning proposal.",
    authority: {
      regime: "Municipal Proposal",
      instrument: "Kommuneqarfik Sermersooq Zoning Proposal",
      reference: "Tasiilaq og omegn, point 1"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_TASIILAQ_SERMILIK", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Proposal describes the area as closed year-round for external vessels due to hunting interests and safety.",
      actions: [
        { text: "Avoid route planning through the area unless locally verified.", type: "NOTE" },
        { text: "Escalate to Master review before entry.", type: "PROCEDURE" },
        { text: "Treat as proposal-level restriction, not hard law.", type: "NOTE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER", "EXPEDITION"],
      module: "VOYAGE",
      tags: ["GREENLAND", "TASIILAQ", "PROPOSAL", "CLOSED"]
    },
    ui: {
      title: "Sermilik / Isittivaq / Kangittarpik",
      compact: true,
      suppressible: false,
      priority: 640
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-17T00:00:00Z",
      updatedAt: "2026-03-17T00:00:00Z"
    }
  },

  {
    id: "GREENLAND_TASIILAQ_JOHAN_PETERSEN_001",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "Johan Petersen Fjord should be treated as closed year-round for external vessels under the Tasiilaq zoning proposal.",
    authority: {
      regime: "Municipal Proposal",
      instrument: "Kommuneqarfik Sermersooq Zoning Proposal",
      reference: "Tasiilaq og omegn, point 2"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_TASIILAQ_JOHAN_PETERSEN", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Proposal closes Johan Petersen Fjord year-round due to hunting and safety considerations.",
      actions: [
        { text: "Flag route for bridge and expedition review.", type: "PROCEDURE" },
        { text: "Require local confirmation before planning operations.", type: "CHECK" },
        { text: "Do not classify as hard-law non-compliance.", type: "NOTE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER", "EXPEDITION"],
      module: "VOYAGE",
      tags: ["GREENLAND", "TASIILAQ", "PROPOSAL", "CLOSED"]
    },
    ui: {
      title: "Johan Petersen Fjord",
      compact: true,
      suppressible: false,
      priority: 635
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-17T00:00:00Z",
      updatedAt: "2026-03-17T00:00:00Z"
    }
  },

  {
    id: "GREENLAND_TASIILAQ_OUTER_SERMILIK_GLACIER_001",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "Outer Sermilik inward through Sermiligaap Qingertiva to Kaarali Glacier and Knud Rasmussen Glacier should be treated as closed year-round for external vessels.",
    authority: {
      regime: "Municipal Proposal",
      instrument: "Kommuneqarfik Sermersooq Zoning Proposal",
      reference: "Tasiilaq og omegn, point 3"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_TASIILAQ_OUTER_SERMILIK_GLACIER", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Proposal treats the outer Sermilik and inner glacier area as year-round closed due to hunting, fishery and safety.",
      actions: [
        { text: "Avoid routine expedition navigation into inner glacier area.", type: "NOTE" },
        { text: "Verify local access conditions before any planning.", type: "CHECK" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER"],
      module: "VOYAGE",
      tags: ["GREENLAND", "TASIILAQ", "GLACIER", "CLOSED"]
    },
    ui: {
      title: "Outer Sermilik to Glacier Area",
      compact: true,
      suppressible: false,
      priority: 630
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-17T00:00:00Z",
      updatedAt: "2026-03-17T00:00:00Z"
    }
  },

  {
    id: "GREENLAND_TASIILAQ_KUUMMIUT_FJORDS_001",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "The fjords inward from Kuummiut should be treated as closed year-round for external vessels.",
    authority: {
      regime: "Municipal Proposal",
      instrument: "Kommuneqarfik Sermersooq Zoning Proposal",
      reference: "Tasiilaq og omegn, point 4"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_TASIILAQ_KUUMMIUT_FJORDS", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Proposal closes fjords inward from Kuummiut year-round due to hunting and safety.",
      actions: [
        { text: "Treat route entry as restricted in planning stage.", type: "NOTE" },
        { text: "Require local verification before any operation.", type: "CHECK" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER"],
      module: "VOYAGE",
      tags: ["GREENLAND", "KUUMMIUT", "CLOSED"]
    },
    ui: {
      title: "Kuummiut Inward Fjords",
      compact: true,
      suppressible: false,
      priority: 620
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-17T00:00:00Z",
      updatedAt: "2026-03-17T00:00:00Z"
    }
  },

  {
    id: "GREENLAND_TASIILAQ_ISLANDS_001",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "The sea areas around Salisaalik, Ilittertivaq, Apuseeq and the northern part of Apusiaajiit should be treated as closed year-round for external vessels.",
    authority: {
      regime: "Municipal Proposal",
      instrument: "Kommuneqarfik Sermersooq Zoning Proposal",
      reference: "Tasiilaq og omegn, point 5"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_TASIILAQ_ISLANDS", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Proposal closes the sea areas around these islands year-round for external vessels due to hunting and safety.",
      actions: [
        { text: "Avoid planning operations around listed islands without local verification.", type: "NOTE" },
        { text: "Treat as proposal-level closure area.", type: "NOTE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER", "EXPEDITION"],
      module: "VOYAGE",
      tags: ["GREENLAND", "TASIILAQ", "ISLANDS", "CLOSED"]
    },
    ui: {
      title: "Salisaalik / Ilittertivaq / Apuseeq",
      compact: true,
      suppressible: false,
      priority: 615
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-17T00:00:00Z",
      updatedAt: "2026-03-17T00:00:00Z"
    }
  },

  {
    id: "GREENLAND_TASIILAQ_COAST_GUIDE_001",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "The remaining Tasiilaq coastal area should only be navigated by local residents or vessels with local knowledgeable guides or pilots.",
    authority: {
      regime: "Municipal Proposal",
      instrument: "Kommuneqarfik Sermersooq Zoning Proposal",
      reference: "Tasiilaq og omegn, point 6"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_TASIILAQ_COAST_GUIDE", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Proposal keeps wider Tasiilaq coast open only for locals or vessels with knowledgeable local guides/pilots.",
      actions: [
        { text: "Verify local guide / pilot arrangement before route approval.", type: "CHECK" },
        { text: "Do not treat as hard-law restriction.", type: "NOTE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER"],
      module: "VOYAGE",
      tags: ["GREENLAND", "GUIDE", "PILOT", "TASIILAQ"]
    },
    ui: {
      title: "Tasiilaq Coastal Guide Requirement",
      compact: true,
      suppressible: false,
      priority: 610
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-17T00:00:00Z",
      updatedAt: "2026-03-17T00:00:00Z"
    }
  },

  {
    id: "GREENLAND_TASIILAQ_FJORD_OPEN_001",
    version: "1.0.0",
    status: "Active",
    severity: "CONSIDER",
    statement: "Access to Tasiilaq Fjord itself should remain open for all to allow pilot embarkation according to the zoning proposal.",
    authority: {
      regime: "Municipal Proposal",
      instrument: "Kommuneqarfik Sermersooq Zoning Proposal",
      reference: "Tasiilaq og omegn, point 7"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_TASIILAQ_FJORD_OPEN", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Proposal explicitly keeps the Tasiilaq Fjord access corridor open in order to allow pilot embarkation.",
      actions: [
        { text: "Use corridor as open access route where operationally appropriate.", type: "NOTE" },
        { text: "Still verify local pilot arrangements as needed.", type: "CHECK" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE"],
      module: "VOYAGE",
      tags: ["GREENLAND", "OPEN", "CORRIDOR", "PILOT"]
    },
    ui: {
      title: "Tasiilaq Fjord Open Access",
      compact: true,
      suppressible: true,
      priority: 300
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-17T00:00:00Z",
      updatedAt: "2026-03-17T00:00:00Z"
    }
  },

  {
    id: "GREENLAND_TASIILAQ_SOUTH_GUIDE_001",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "The coast south of Tasiilaq from Ikkarteq to Qeertartivaq should only be navigated with local knowledgeable guides or pilots.",
    authority: {
      regime: "Municipal Proposal",
      instrument: "Kommuneqarfik Sermersooq Zoning Proposal",
      reference: "Tasiilaq og omegn, point 8"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_TASIILAQ_SOUTH_GUIDE", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Proposal requires local, knowledgeable guides/pilots for navigation in the coast area south of Tasiilaq.",
      actions: [
        { text: "Verify local guide / pilot support before entering area.", type: "CHECK" },
        { text: "Treat as proposal-level operational restriction.", type: "NOTE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER"],
      module: "VOYAGE",
      tags: ["GREENLAND", "SOUTH_COAST", "GUIDE"]
    },
    ui: {
      title: "Ikkarteq to Qeertartivaq Guide Area",
      compact: true,
      suppressible: false,
      priority: 605
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-17T00:00:00Z",
      updatedAt: "2026-03-17T00:00:00Z"
    }
  },

  {
    id: "GREENLAND_TASIILAQ_QEERTARTIVAQ_NUUP_001",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "The area from Qeertartivaq to Nuup Oqqummut Kangiat should be treated as closed year-round for external vessels.",
    authority: {
      regime: "Municipal Proposal",
      instrument: "Kommuneqarfik Sermersooq Zoning Proposal",
      reference: "Tasiilaq og omegn, point 9"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_TASIILAQ_QEERTARTIVAQ_NUUP", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Proposal closes the area year-round for external vessels due to hunting and safety concerns.",
      actions: [
        { text: "Flag area as closed in voyage planning.", type: "NOTE" },
        { text: "Escalate any intended operation for Master review.", type: "PROCEDURE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER"],
      module: "VOYAGE",
      tags: ["GREENLAND", "CLOSED", "TASIILAQ"]
    },
    ui: {
      title: "Qeertartivaq to Nuup Oqqummut Kangiat",
      compact: true,
      suppressible: false,
      priority: 625
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-17T00:00:00Z",
      updatedAt: "2026-03-17T00:00:00Z"
    }
  },

  {
    id: "GREENLAND_TASIILAQ_NUUP_TIMMIARMIUT_001",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "The coast from Nuup Oqqummut Kangiat to Timmiarmiut should only be navigated with local knowledgeable guides or pilots.",
    authority: {
      regime: "Municipal Proposal",
      instrument: "Kommuneqarfik Sermersooq Zoning Proposal",
      reference: "Tasiilaq og omegn, point 10"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_TASIILAQ_NUUP_TIMMIARMIUT", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Proposal requires local knowledgeable guides or pilots in this coastal stretch.",
      actions: [
        { text: "Verify local guide / pilot arrangement.", type: "CHECK" },
        { text: "Use as planning-level operational restriction.", type: "NOTE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER"],
      module: "VOYAGE",
      tags: ["GREENLAND", "GUIDE", "TIMMIARMIUT"]
    },
    ui: {
      title: "Nuup Oqqummut Kangiat to Timmiarmiut",
      compact: true,
      suppressible: false,
      priority: 600
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-17T00:00:00Z",
      updatedAt: "2026-03-17T00:00:00Z"
    }
  },

  {
    id: "GREENLAND_TASIILAQ_NANSEN_SIMILAAQ_001",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "The area north of Tasiilaq from Nansen Fjord to Similaaq should be treated as closed year-round for external vessels.",
    authority: {
      regime: "Municipal Proposal",
      instrument: "Kommuneqarfik Sermersooq Zoning Proposal",
      reference: "Tasiilaq og omegn, point 11"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_TASIILAQ_NANSEN_SIMILAAQ", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Proposal closes this northern area year-round for hunting, fishery and safety reasons.",
      actions: [
        { text: "Treat as closed area in planning and route review.", type: "NOTE" },
        { text: "Require local verification before any operation.", type: "CHECK" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER"],
      module: "VOYAGE",
      tags: ["GREENLAND", "NANSEN", "SIMILAAQ", "CLOSED"]
    },
    ui: {
      title: "Nansen Fjord to Similaaq",
      compact: true,
      suppressible: false,
      priority: 620
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-17T00:00:00Z",
      updatedAt: "2026-03-17T00:00:00Z"
    }
  },

  {
    id: "GREENLAND_ITTOQQORTOORMIIT_CLOSED_001",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "The area from Kap Brewster to Kap Lesley should be treated as closed year-round for foreign vessels under the Ittoqqortoormiit zoning proposal.",
    authority: {
      regime: "Municipal Proposal",
      instrument: "Kommuneqarfik Sermersooq Zoning Proposal",
      reference: "Ittoqqortoormiit, point 1"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_ITTOQQORTOORMIIT_CLOSED", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Proposal describes the area as closed year-round for foreign vessels because it is an important hunting area.",
      actions: [
        { text: "Treat as planning-level closure area.", type: "NOTE" },
        { text: "Escalate any intended transit for Master review.", type: "PROCEDURE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER", "EXPEDITION"],
      module: "VOYAGE",
      tags: ["GREENLAND", "ITTOQQORTOORMIIT", "CLOSED", "SEASONAL"]
    },
    ui: {
      title: "Kap Brewster to Kap Lesley",
      compact: true,
      suppressible: false,
      priority: 650
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-17T00:00:00Z",
      updatedAt: "2026-03-17T00:00:00Z"
    }
  },

  {
    id: "GREENLAND_ITTOQQORTOORMIIT_AUGUST_001",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "The broader Ittoqqortoormiit fjord area may be navigated by foreign vessels from 1 August to the end of the tourist season under the zoning proposal.",
    authority: {
      regime: "Municipal Proposal",
      instrument: "Kommuneqarfik Sermersooq Zoning Proposal",
      reference: "Ittoqqortoormiit, point 2"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_ITTOQQORTOORMIIT_AUGUST", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: "08-01", end: "10-31", season: "TOURIST_SEASON" }
    },
    content: {
      rationale: "Proposal opens the broader area from 1 August to the end of the annual tourist season.",
      actions: [
        { text: "Check season before approving route.", type: "CHECK" },
        { text: "Outside season, treat as restricted proposal area.", type: "NOTE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER"],
      module: "VOYAGE",
      tags: ["GREENLAND", "ITTOQQORTOORMIIT", "SEASONAL", "AUGUST"]
    },
    ui: {
      title: "Ittoqqortoormiit Seasonal Area (from 1 August)",
      compact: true,
      suppressible: false,
      priority: 610
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-17T00:00:00Z",
      updatedAt: "2026-03-17T00:00:00Z"
    }
  },

  {
    id: "GREENLAND_ITTOQQORTOORMIIT_SEPTEMBER_001",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "The area from Kap Brewster to Kap Ryder may be navigated by foreign vessels from 1 September to the end of the tourist season under the zoning proposal.",
    authority: {
      regime: "Municipal Proposal",
      instrument: "Kommuneqarfik Sermersooq Zoning Proposal",
      reference: "Ittoqqortoormiit, point 3"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_ITTOQQORTOORMIIT_SEPTEMBER", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: "09-01", end: "10-31", season: "TOURIST_SEASON" }
    },
    content: {
      rationale: "Proposal opens the Kap Brewster to Kap Ryder area from 1 September to the end of the annual tourist season.",
      actions: [
        { text: "Check intended date against seasonal access window.", type: "CHECK" },
        { text: "Outside window, treat as proposal-level restriction.", type: "NOTE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER"],
      module: "VOYAGE",
      tags: ["GREENLAND", "ITTOQQORTOORMIIT", "SEASONAL", "SEPTEMBER"]
    },
    ui: {
      title: "Kap Brewster to Kap Ryder (from 1 September)",
      compact: true,
      suppressible: false,
      priority: 600
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-17T00:00:00Z",
      updatedAt: "2026-03-17T00:00:00Z"
    }
  },

  // ==========================
  // GREENLAND PROTECTED AREAS
  // ==========================

  {
    id: "GREENLAND_PROTECTED_001",
    version: "1.0.0",
    status: "Active",
    severity: "MUST",
    statement: "Operations within Greenland protected areas must comply with applicable local environmental and landing restrictions.",
    authority: {
      regime: "National / Local",
      instrument: "Protected Area Restrictions",
      reference: "Greenland protected area operational control"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_PROTECTED", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Protected areas in Greenland may include wildlife sensitivity, landing controls, environmental restrictions and local operational limitations.",
      actions: [
        { text: "Verify whether landing, anchoring or close coastal operation is restricted in the protected area.", type: "CHECK" },
        { text: "Apply strict environmental protection measures while operating in the area.", type: "LIMIT" },
        { text: "Escalate intended operation to Master review before proceeding if local restrictions are unclear.", type: "PROCEDURE" }
      ],
      exceptions: [],
      links: [],
      fullText: `GREENLAND PROTECTED AREA - OPERATIONAL COMPLIANCE CARD`,
      procedures: [
        "Confirm whether the vessel is inside a protected area polygon",
        "Review local environmental or landing restrictions before continuing operations",
        "Assess whether landing, anchoring, close approach or wildlife disturbance limitations apply",
        "Escalate uncertain cases to Master / expedition leadership for operational decision"
      ],
      complianceChecklist: [
        "Protected area status verified",
        "Operational restrictions reviewed",
        "Master informed if local restriction status is unclear",
        "Environmental protection measures applied"
      ],
      documentation: [
        "Voyage planning notes",
        "Local operational guidance",
        "Protected area reference material if available"
      ]
    },
    ops: {
      audience: ["BRIDGE", "MASTER", "EXPEDITION"],
      module: "COMPLIANCE",
      tags: ["GREENLAND", "PROTECTED_AREA", "ENVIRONMENT", "LANDING"]
    },
    ui: {
      title: "Greenland Protected Area Compliance",
      compact: false,
      suppressible: false,
      priority: 910
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-18T00:00:00Z",
      updatedAt: "2026-03-18T00:00:00Z"
    }
  },

  {
    id: "GREENLAND_PROTECTED_002",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "Vessels should exercise enhanced caution regarding wildlife disturbance and environmentally sensitive operations inside Greenland protected areas.",
    authority: {
      regime: "Best Practice",
      instrument: "Environmental Operating Guidance",
      reference: "Protected area precautionary operating practice"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_PROTECTED", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Even where explicit local restriction text is limited, protected-area navigation should default to cautious operational behavior.",
      actions: [
        { text: "Minimize disturbance to wildlife and sensitive coastal areas.", type: "LIMIT" },
        { text: "Use conservative operational judgment for boat operations, landings and close inshore navigation.", type: "PROCEDURE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER", "EXPEDITION"],
      module: "COMPLIANCE",
      tags: ["GREENLAND", "PROTECTED_AREA", "WILDLIFE", "BEST_PRACTICE"]
    },
    ui: {
      title: "Protected Area Precautionary Operations",
      compact: true,
      suppressible: false,
      priority: 540
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-18T00:00:00Z",
      updatedAt: "2026-03-18T00:00:00Z"
    }
  },

  {
    id: "GREENLAND_PROTECTED_003",
    version: "1.0.0",
    status: "Active",
    severity: "CONSIDER",
    statement: "Consider applying an additional operational review before conducting landings or close coastal activity inside Greenland protected areas.",
    authority: {
      regime: "Best Practice",
      instrument: "NAVIGEN Operational Recommendation",
      reference: "Protected area planning advisory"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_PROTECTED", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "A protected-area trigger should prompt an additional check even where no specific prohibition is yet mapped in detail.",
      actions: [
        { text: "Consider conducting an additional bridge / expedition review before operations in the area.", type: "NOTE" },
        { text: "Consider treating unmapped local uncertainty as a caution flag in voyage execution.", type: "NOTE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["MASTER", "BRIDGE", "EXPEDITION"],
      module: "COMPLIANCE",
      tags: ["GREENLAND", "PROTECTED_AREA", "ADVISORY"]
    },
    ui: {
      title: "Protected Area Additional Review",
      compact: true,
      suppressible: true,
      priority: 320
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-18T00:00:00Z",
      updatedAt: "2026-03-18T00:00:00Z"
    }
  },

  {
    id: "GREENLAND_LOCAL_ILULISSAT_HARBOUR_001",
    version: "1.0.0",
    status: "Active",
    severity: "MUST",
    statement: "Vessels operating in Ilulissat harbour area must navigate with heightened caution due to local traffic, port activity and limited manoeuvring space.",
    authority: {
      regime: "Local Operational Guidance",
      instrument: "Ilulissat Harbour Local Restriction",
      reference: "Greenland local operating guidance"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_LOCAL_ILULISSAT_HARBOUR", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Harbour approaches and inner harbour waters may contain small craft, working traffic and constrained manoeuvring room.",
      actions: [
        { text: "Navigate with reduced speed appropriate to local traffic density and manoeuvring room.", type: "LIMIT" },
        { text: "Maintain enhanced bridge lookout during harbour approach and manoeuvring.", type: "PROCEDURE" },
        { text: "Treat harbour area as an active working zone with potential local traffic conflict.", type: "NOTE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER"],
      module: "VOYAGE",
      tags: ["GREENLAND", "LOCAL_RESTRICTION", "HARBOUR", "ILULISSAT"]
    },
    ui: {
      title: "Ilulissat Harbour Operational Restriction",
      compact: true,
      suppressible: false,
      priority: 740
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-18T00:00:00Z",
      updatedAt: "2026-03-18T00:00:00Z"
    }
  },

  {
    id: "GREENLAND_LOCAL_ILULISSAT_ICEFJORD_001",
    version: "1.0.0",
    status: "Active",
    severity: "MUST",
    statement: "Vessels operating near Ilulissat Icefjord must maintain conservative stand-off distance from shore and ice-affected areas due to calving and ice movement risk.",
    authority: {
      regime: "Local Operational Guidance",
      instrument: "Ilulissat Icefjord Local Restriction",
      reference: "Greenland local operating guidance"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_LOCAL_ILULISSAT_ICEFJORD", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Ice calving, wave generation and mobile ice hazards may affect safe vessel operation close to fjord and shore areas.",
      actions: [
        { text: "Maintain conservative stand-off distance from glacier-front / unstable ice influence area.", type: "LIMIT" },
        { text: "Monitor local ice movement continuously when operating in the area.", type: "PROCEDURE" },
        { text: "Do not plan close coastal approach without Master review.", type: "CHECK" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER", "EXPEDITION"],
      module: "VOYAGE",
      tags: ["GREENLAND", "LOCAL_RESTRICTION", "ICEFJORD", "ILULISSAT", "ICE"]
    },
    ui: {
      title: "Ilulissat Icefjord Stand-off Restriction",
      compact: true,
      suppressible: false,
      priority: 760
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-18T00:00:00Z",
      updatedAt: "2026-03-18T00:00:00Z"
    }
  },

  {
    id: "GREENLAND_LOCAL_TASIILAQ_APPROACH_001",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "Vessels approaching Tasiilaq should apply enhanced local navigation caution and verify any local pilot / guide requirement before operation.",
    authority: {
      regime: "Local Operational Guidance",
      instrument: "Tasiilaq Local Restriction",
      reference: "Greenland local operating guidance"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_LOCAL_TASIILAQ_APPROACH", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Tasiilaq approach areas may involve local traffic, constrained waters and practical need for local knowledge.",
      actions: [
        { text: "Verify whether local guide / pilot support is expected before final approach.", type: "CHECK" },
        { text: "Use conservative speed and enhanced bridge monitoring in local approach area.", type: "PROCEDURE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER"],
      module: "VOYAGE",
      tags: ["GREENLAND", "LOCAL_RESTRICTION", "TASIILAQ", "APPROACH", "GUIDE"]
    },
    ui: {
      title: "Tasiilaq Local Approach Guidance",
      compact: true,
      suppressible: false,
      priority: 680
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-18T00:00:00Z",
      updatedAt: "2026-03-18T00:00:00Z"
    }
  },

  {
    id: "GREENLAND_LOCAL_ITTOQQORTOORMIIT_APPROACH_001",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "Vessels approaching Ittoqqortoormiit should apply enhanced local caution due to remote operating conditions and local traffic/community sensitivity.",
    authority: {
      regime: "Local Regulation",
      instrument: "Ittoqqortoormiit Local Restriction",
      reference: "Greenland local operating guidance"
    },
    applicability: {
      areas: [{ areaId: "GREENLAND_LOCAL_ITTOQQORTOORMIIT_APPROACH", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Remote location, local conditions and operational sensitivity require conservative ship handling and planning discipline.",
      actions: [
        { text: "Apply heightened bridge awareness in local approach waters.", type: "PROCEDURE" },
        { text: "Verify any local operational expectations before conducting close coastal activity.", type: "CHECK" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER", "EXPEDITION"],
      module: "VOYAGE",
      tags: ["GREENLAND", "LOCAL_RESTRICTION", "ITTOQQORTOORMIIT", "APPROACH"]
    },
    ui: {
      title: "Ittoqqortoormiit Local Approach Guidance",
      compact: true,
      suppressible: false,
      priority: 670
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-18T00:00:00Z",
      updatedAt: "2026-03-18T00:00:00Z"
    }
  },

  {
    id: "POLAR_ICE_001",
    version: "1.0.0",
    status: "Active",
    severity: "MUST",
    statement: "Vessels without Polar Class PC1-PC5 or Ice Class 1A Super/1A MUST have qualified ice navigator when ice concentration exceeds 10%.",
    authority: {
      regime: "IMO",
      instrument: "Polar Code",
      reference: "Polar Code Part I-A, Ch.12 (Manning and Training)"
    },
    applicability: {
      areas: [{ areaId: "IMO_N60", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["1B", "1C", "II", "III", "NONE"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Vessels with lower ice class ratings require specialized ice navigation expertise.",
      actions: [
        { text: "Verify ice navigator certificate is valid and covers Arctic operations.", type: "CHECK" },
        { text: "Ice navigator must be on bridge when ice concentration >10%.", type: "PROCEDURE" }
      ],
      exceptions: ["Higher ice-class vessels may operate with standard bridge officers with polar training."],
      links: [],
      fullText: `POLAR CODE PART I-A - CHAPTER 12: MANNING AND TRAINING`,
      procedures: [
        "Verify ice navigator holds valid certificate",
        "Ensure ice charts are updated",
        "Brief ice navigator on vessel limits"
      ],
      complianceChecklist: [
        "Ice navigator certificate on board and valid",
        "Current ice charts available"
      ],
      documentation: [
        "Ice navigator certificate",
        "Current ice charts and forecasts"
      ]
    },
    ops: {
      audience: ["BRIDGE", "MASTER"],
      module: "COMPLIANCE",
      tags: ["POLAR", "ICE_NAVIGATOR", "MANNING", "ICE_CLASS"]
    },
    ui: {
      title: "Ice Navigator Requirement",
      compact: false,
      suppressible: false,
      priority: 870
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-09T00:00:00Z",
      updatedAt: "2026-03-09T00:00:00Z"
    }
  },

  {
    id: "POLAR_ICE_002",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "Vessels with Polar Class PC6-PC7 should reduce speed to 5 knots when ice concentration exceeds 40%.",
    authority: {
      regime: "Best Practice",
      instrument: "Polar Code Guidelines",
      reference: "IACS Polar Class Speed Recommendations"
    },
    applicability: {
      areas: [{ areaId: "IMO_N60", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Lower polar class vessels should reduce speed in heavier ice to prevent structural damage.",
      actions: [
        { text: "Monitor ice concentration continuously.", type: "PROCEDURE" },
        { text: "Reduce speed to 5 knots or less when ice concentration >40%.", type: "LIMIT" }
      ],
      exceptions: ["PC1-PC5 vessels may maintain higher speeds per PWOM."],
      links: []
    },
    ops: {
      audience: ["BRIDGE"],
      module: "COMPLIANCE",
      tags: ["POLAR", "SPEED", "ICE", "POLAR_CLASS"]
    },
    ui: {
      title: "Speed Reduction in Ice",
      compact: true,
      suppressible: false,
      priority: 720
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-09T00:00:00Z",
      updatedAt: "2026-03-09T00:00:00Z"
    }
  },

  {
    id: "POLAR_FUEL_001",
    version: "1.0.0",
    status: "Active",
    severity: "MUST",
    statement: "Heavy Fuel Oil (HFO) use and carriage prohibited in Arctic waters as of July 1, 2024.",
    authority: {
      regime: "IMO",
      instrument: "MARPOL Annex I",
      reference: "Regulation 43A - HFO Ban in Arctic"
    },
    applicability: {
      areas: [{ areaId: "IMO_N60", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "HFO ban reduces environmental risk from spills in Arctic waters.",
      actions: [
        { text: "Verify vessel is using compliant fuel.", type: "CHECK" },
        { text: "Confirm fuel changeover completed before entering Arctic waters.", type: "PROCEDURE" }
      ],
      exceptions: [
        "Protected fuel tank exemptions may apply until July 1, 2029."
      ],
      links: [],
      fullText: `MARPOL ANNEX I - REGULATION 43A`
    },
    ops: {
      audience: ["BRIDGE", "MASTER", "SAFETY"],
      module: "COMPLIANCE",
      tags: ["POLAR", "HFO", "FUEL", "MARPOL", "ENVIRONMENT"]
    },
    ui: {
      title: "HFO Ban - Arctic Waters",
      compact: false,
      suppressible: false,
      priority: 890
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-09T00:00:00Z",
      updatedAt: "2026-03-09T00:00:00Z"
    }
  },

  {
    id: "POLAR_COMMS_001",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "Ships operating above 75°N should carry redundant satellite communication systems due to limited GMDSS coverage.",
    authority: {
      regime: "Best Practice",
      instrument: "Polar Code Guidance",
      reference: "IMO MSC.1/Circ.1519 - Arctic Communication"
    },
    applicability: {
      areas: [{ areaId: "IMO_N60", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "High Arctic latitudes have limited Inmarsat coverage.",
      actions: [
        { text: "Test all satellite communication systems before entry.", type: "CHECK" },
        { text: "Carry backup Iridium or other polar-orbit satcom system.", type: "PROCEDURE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER"],
      module: "COMPLIANCE",
      tags: ["POLAR", "COMMUNICATION", "SAFETY", "GMDSS"]
    },
    ui: {
      title: "Redundant Comms - High Arctic",
      compact: true,
      suppressible: true,
      priority: 650
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-09T00:00:00Z",
      updatedAt: "2026-03-09T00:00:00Z"
    }
  },

  {
    id: "SOLAS_PASSENGER_001",
    version: "1.0.0",
    status: "Active",
    severity: "MUST",
    statement: "Passenger ships in polar waters must conduct mandatory polar-specific safety drills and briefings.",
    authority: {
      regime: "IMO",
      instrument: "SOLAS / Polar Code",
      reference: "SOLAS III/19 + Polar Code Part I-A Ch.12"
    },
    applicability: {
      areas: [{ areaId: "IMO_N60", condition: "INSIDE" }],
      vessel: { type: ["PASSENGER", "CRUISE"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Passenger vessels require enhanced safety procedures in polar waters.",
      actions: [
        { text: "Conduct polar safety briefing for passengers within 24h of Arctic entry.", type: "PROCEDURE" },
        { text: "Verify sufficient immersion suits for all persons on board.", type: "CHECK" }
      ],
      exceptions: [],
      links: [],
      fullText: `SOLAS CHAPTER III - LIFE-SAVING APPLIANCES AND ARRANGEMENTS`
    },
    ops: {
      audience: ["MASTER", "SAFETY", "EXPEDITION"],
      module: "COMPLIANCE",
      tags: ["SOLAS", "PASSENGER", "DRILLS", "SAFETY", "POLAR"]
    },
    ui: {
      title: "Passenger Safety Drills - Polar",
      compact: false,
      suppressible: false,
      priority: 860
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-09T00:00:00Z",
      updatedAt: "2026-03-09T00:00:00Z"
    }
  },

  {
    id: "MARPOL_SEWAGE_001",
    version: "1.0.0",
    status: "Active",
    severity: "MUST",
    statement: "Sewage discharge in Arctic waters prohibited unless treated by approved sewage treatment plant and vessel is >12nm from nearest ice shelf.",
    authority: {
      regime: "IMO",
      instrument: "MARPOL Annex IV",
      reference: "Regulation 11 - Sewage Discharge in Polar Waters"
    },
    applicability: {
      areas: [{ areaId: "IMO_N60", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Polar waters have stricter sewage discharge rules.",
      actions: [
        { text: "Verify sewage treatment plant operational and approved type.", type: "CHECK" },
        { text: "Retain untreated sewage in holding tanks for discharge outside polar waters.", type: "LIMIT" }
      ],
      exceptions: ["Emergency discharge permitted for safety of ship or persons."],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "SAFETY"],
      module: "COMPLIANCE",
      tags: ["MARPOL", "SEWAGE", "DISCHARGE", "ENVIRONMENT", "POLAR"]
    },
    ui: {
      title: "Sewage Discharge - Arctic",
      compact: true,
      suppressible: false,
      priority: 780
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-09T00:00:00Z",
      updatedAt: "2026-03-09T00:00:00Z"
    }
  },

  {
    id: "POLAR_MANNING_001",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "All deck officers should complete advanced polar navigation training before Arctic operations.",
    authority: {
      regime: "IMO",
      instrument: "STCW Convention",
      reference: "STCW Code Section V/4 - Polar Waters Training"
    },
    applicability: {
      areas: [{ areaId: "IMO_N60", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Specialized training ensures deck officers understand polar-specific challenges.",
      actions: [
        { text: "Verify all deck officers hold polar waters endorsement.", type: "CHECK" },
        { text: "Conduct pre-voyage polar navigation briefing.", type: "PROCEDURE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER"],
      module: "COMPLIANCE",
      tags: ["STCW", "TRAINING", "MANNING", "POLAR"]
    },
    ui: {
      title: "Crew Polar Training",
      compact: true,
      suppressible: false,
      priority: 680
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-09T00:00:00Z",
      updatedAt: "2026-03-09T00:00:00Z"
    }
  },

  {
    id: "NAVIGATION_001",
    version: "1.0.0",
    status: "Active",
    severity: "CONSIDER",
    statement: "Consider routing via IMO-recognized Arctic shipping routes for enhanced SAR coverage and traffic monitoring.",
    authority: {
      regime: "Best Practice",
      instrument: "IMO Arctic Guidelines",
      reference: "MSC.1/Circ.1519 - Arctic Route Planning"
    },
    applicability: {
      areas: [{ areaId: "IMO_N60", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Recognized Arctic routes have better SAR coverage and traffic monitoring.",
      actions: [
        { text: "Review recognized Arctic routes before voyage planning.", type: "PROCEDURE" },
        { text: "Consider SAR coverage when route planning.", type: "NOTE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER"],
      module: "COMPLIANCE",
      tags: ["NAVIGATION", "ROUTE_PLANNING", "SAR", "POLAR"]
    },
    ui: {
      title: "Arctic Route Recommendation",
      compact: true,
      suppressible: true,
      priority: 450
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-09T00:00:00Z",
      updatedAt: "2026-03-09T00:00:00Z"
    }
  },

  {
    id: "TERRITORIAL_001",
    version: "1.0.0",
    status: "Active",
    severity: "MUST",
    statement: "Vessel subject to coastal state laws within 12 nautical miles (Territorial Sea).",
    authority: {
      regime: "UNCLOS",
      instrument: "United Nations Convention on the Law of the Sea",
      reference: "UNCLOS Article 2-3"
    },
    applicability: {
      areas: [{ areaId: "TERRITORIAL_12NM", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Coastal states exercise sovereignty over their territorial sea.",
      actions: [
        { text: "Comply with applicable coastal state regulations.", type: "LIMIT" },
        { text: "Ensure vessel documentation available for inspection.", type: "CHECK" }
      ],
      exceptions: ["Right of innocent passage applies for transit."],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER"],
      module: "COMPLIANCE",
      tags: ["TERRITORIAL", "UNCLOS", "SOVEREIGNTY"]
    },
    ui: {
      title: "Coastal State Jurisdiction",
      compact: true,
      suppressible: false,
      priority: 800
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-02-28T00:00:00Z",
      updatedAt: "2026-02-28T00:00:00Z"
    }
  },

  {
    id: "TERRITORIAL_002",
    version: "1.0.0",
    status: "Active",
    severity: "SHOULD",
    statement: "Innocent passage through territorial waters should be continuous and expeditious.",
    authority: {
      regime: "UNCLOS",
      instrument: "United Nations Convention on the Law of the Sea",
      reference: "UNCLOS Article 18"
    },
    applicability: {
      areas: [{ areaId: "TERRITORIAL_12NM", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Innocent passage must not be prejudicial to the coastal state.",
      actions: [
        { text: "Avoid unnecessary stopping or anchoring.", type: "PROCEDURE" },
        { text: "Avoid fishing, research or survey activities while in passage.", type: "LIMIT" }
      ],
      exceptions: ["Stopping allowed for rendering assistance to persons in distress."],
      links: []
    },
    ops: {
      audience: ["BRIDGE", "MASTER"],
      module: "COMPLIANCE",
      tags: ["TERRITORIAL", "PASSAGE", "NAVIGATION"]
    },
    ui: {
      title: "Innocent Passage Guidelines",
      compact: true,
      suppressible: false,
      priority: 750
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-02-28T00:00:00Z",
      updatedAt: "2026-02-28T00:00:00Z"
    }
  },

  {
    id: "TERRITORIAL_003",
    version: "1.0.0",
    status: "Active",
    severity: "CONSIDER",
    statement: "Consider contacting coastal authority VTS when entering territorial waters.",
    authority: {
      regime: "Best Practice",
      instrument: "Maritime Domain Awareness",
      reference: "IALA VTS Manual"
    },
    applicability: {
      areas: [{ areaId: "TERRITORIAL_12NM", condition: "INSIDE" }],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: "Proactive communication with coastal VTS enhances situational awareness.",
      actions: [
        { text: "Identify appropriate VTS frequency.", type: "PROCEDURE" },
        { text: "Provide vessel name, position, course, speed and destination.", type: "PROCEDURE" }
      ],
      exceptions: [],
      links: []
    },
    ops: {
      audience: ["BRIDGE"],
      module: "COMPLIANCE",
      tags: ["TERRITORIAL", "VTS", "COMMUNICATION"]
    },
    ui: {
      title: "VTS Contact Recommended",
      compact: true,
      suppressible: true,
      priority: 700
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-02-28T00:00:00Z",
      updatedAt: "2026-02-28T00:00:00Z"
    }
  }
];

// Helper function to get rules applicable to specific area
export function getRulesForArea(areaId: string): RuleCard[] {
  return ruleCards
    .filter(card =>
      card.status === 'Active' &&
      card.applicability.areas.some(area => area.areaId === areaId)
    )
    .sort((a, b) => b.ui.priority - a.ui.priority);
}

// Helper function to get rules by severity
export function getRulesBySeverity(severity: 'MUST' | 'SHOULD' | 'CONSIDER'): RuleCard[] {
  return ruleCards
    .filter(card =>
      card.status === 'Active' && card.severity === severity
    )
    .sort((a, b) => b.ui.priority - a.ui.priority);
}

// Helper function to get all active rules (no filtering)
export function getAllActiveRules(): RuleCard[] {
  return ruleCards
    .filter(card => card.status === 'Active')
    .sort((a, b) => b.ui.priority - a.ui.priority);
}

export const RULECARD_REGISTRY: Record<string, RuleCard> = Object.fromEntries(
  ruleCards.map((card) => [card.id, card])
);