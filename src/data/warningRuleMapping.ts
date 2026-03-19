import type { RuleReference } from '../components/RuleDetailOverlay';

/**
 * Maps warning patterns to detailed rule references
 * This allows clicking on waypoint warnings to show detailed rule information
 */

export const RULE_DATABASE: Record<string, RuleReference> = {
  // Protected Area Rules
  'protected_area': {
    id: 'svalbard_protected_area_30',
    category: 'SVALBARD_ENV',
    title: 'Protected Area Access and Wildlife Distance Requirements',
    description: 'Entry into protected areas around Svalbard requires special permits and adherence to strict wildlife protection zones. Minimum 300m distance must be maintained from polar bears, walrus, and bird colonies.',
    reference: 'Svalbardmiljøloven § 30',
    fullText: `SVALBARDMILJØLOVEN § 30 - PROTECTED AREAS

§ 30. Conduct in protected areas
In national parks, nature reserves, and protected areas, the following restrictions apply:

1. ENTRY RESTRICTIONS
   - Special permits may be required for certain areas
   - Landing restrictions apply in specific zones
   - Seasonal closures during breeding periods (May-August)

2. WILDLIFE PROTECTION DISTANCE
   - Minimum 300 meters from polar bears at all times
   - Minimum 300 meters from walrus colonies
   - Minimum 300 meters from bird cliffs and breeding colonies
   - Use binoculars/telephoto lenses for observation

3. PROHIBITED ACTIVITIES
   - Disturbance of wildlife or their habitats
   - Collection of flora, fauna, or geological specimens
   - Camping without permits in designated areas
   - Use of motorized vehicles except in permitted corridors

4. ENFORCEMENT
   - Sysselmannen (Governor of Svalbard) enforces regulations
   - Violations subject to fines and vessel detention
   - Criminal penalties for serious breaches

OPERATIONAL GUIDANCE:
- Plan routes to avoid protected area boundaries
- Maintain continuous watch for wildlife when in vicinity
- Document all sightings in ship's log
- Train crew on identification and response procedures`,
    procedures: [
      'Check updated protected area boundaries before voyage (www.npolar.no)',
      'File expedition plan with Sysselmannen if entering protected areas',
      'Maintain 300m+ distance from all wildlife - use radar/visual range estimation',
      'Post wildlife lookouts when operating near known colonies or feeding areas',
      'Have bridge team brief all passengers on wildlife regulations before any landing',
      'Document all wildlife encounters in ship\'s log with time, position, species, and distance'
    ],
    complianceChecklist: [
      'Protected area maps downloaded and loaded into ECDIS',
      'Crew briefed on § 30 requirements and wildlife identification',
      'Binoculars and range-finding equipment available on bridge wings',
      'Governor notification filed (if required for planned landing)',
      'Passengers briefed on 300m rule and "no approach" policy',
      'Wildlife encounter protocol posted in public areas'
    ],
    relatedRules: [
      'Svalbardmiljøloven § 26 - Zero Discharge Requirements',
      'Svalbardmiljøloven § 51 - Cultural Heritage Protection',
      'IAATO Wildlife Guidelines - Arctic Operations'
    ]
  },

  // Svalbard Protected Area (Combined)
  'svalbard_protected': {
    id: 'svalbard_combined_regulations',
    category: 'SVALBARD_ENV',
    title: 'Svalbard Protected Area - Comprehensive Regulations',
    description: 'Strict environmental protection regulations apply in Svalbard protected areas, covering wildlife protection, zero discharge requirements, and low-sulfur fuel mandates.',
    reference: 'Svalbardmiljøloven §§ 26, 26a, 30',
    fullText: `SVALBARD ENVIRONMENTAL PROTECTION ACT - COMPREHENSIVE REQUIREMENTS

§ 26 - ZERO DISCHARGE REQUIREMENTS
All discharge of the following substances is STRICTLY PROHIBITED:
- Oil and oily mixtures (MARPOL Annex I)
- Sewage and grey water (MARPOL Annex IV)
- Garbage and food waste (MARPOL Annex V)
- Noxious liquid substances (MARPOL Annex II)

No exceptions apply, regardless of vessel type or distance from shore.

§ 26a - LOW SULFUR FUEL MANDATE
- Only fuel with sulfur content <0.1% may be used or carried
- Applies to main engines, auxiliary engines, and boilers
- Fuel samples must be available for inspection
- Violations result in immediate port state control action

§ 30 - WILDLIFE PROTECTION
- 300m minimum distance from polar bears, walrus, bird colonies
- No harassment, feeding, or intentional disturbance
- Seasonal restrictions during breeding (May-August)
- Protected areas require special permits

§ 51 - CULTURAL HERITAGE
- All cultural heritage sites protected (buildings, graves, artifacts)
- No landing without permission at historical sites
- No removal or disturbance of artifacts

ENFORCEMENT AUTHORITY: Sysselmannen (Governor of Svalbard)
PENALTIES: Fines, vessel detention, criminal charges for serious violations`,
    procedures: [
      'Activate zero-discharge mode: close all overboard valves, retain all waste onboard',
      'Verify fuel bunker certificates show <0.1% sulfur content',
      'Maintain 300m+ distance from all wildlife - use radar and visual confirmation',
      'Post dedicated wildlife lookouts when in Svalbard waters',
      'Prohibit any discharge operations - sewage, grey water, galley waste, or garbage',
      'Keep all fuel samples from bunker operations for inspection'
    ],
    complianceChecklist: [
      'All overboard discharge valves sealed/logged closed',
      'Sewage holding tanks capacity confirmed for voyage duration',
      'Garbage compactor/storage capacity verified',
      'Fuel bunker certificates showing <0.1% sulfur onboard and verified',
      'Wildlife observation protocol briefed to bridge team',
      'Cultural heritage site locations marked on charts',
      'Emergency response plan for wildlife encounters prepared'
    ],
    relatedRules: [
      'MARPOL Annex I - Oil Pollution Prevention',
      'MARPOL Annex IV - Sewage Pollution Prevention',
      'MARPOL Annex V - Garbage Pollution Prevention',
      'IMO Polar Code Chapter 1 - Environmental Protection'
    ]
  },

  // IMO Polar Code
  'polar_code': {
    id: 'polar_code_comprehensive',
    category: 'POLAR_CODE',
    title: 'IMO Polar Code Compliance Requirements',
    description: 'Vessels operating in polar waters beyond 60°N or 60°S must comply with the International Code for Ships Operating in Polar Waters (Polar Code), including certification, training, and operational requirements.',
    reference: 'IMO Polar Code (Resolution MSC.385(94) / MEPC.264(68))',
    fullText: `INTERNATIONAL CODE FOR SHIPS OPERATING IN POLAR WATERS (POLAR CODE)

PART I - SAFETY MEASURES (SOLAS)

CHAPTER I - GENERAL
1.3.1 Polar Ship Certificate
- Required for all vessels operating beyond 60°N or 60°S
- Categorizes vessel as A, B, or C based on ice capability
- Valid for 5 years, subject to annual and intermediate surveys
- Must be carried onboard and available for inspection

1.3.2 Polar Water Operational Manual (PWOM)
- Vessel-specific manual required
- Contains operational limitations and procedures
- Covers ice operations, low temperature operations, crew protection
- Must be accessible to all crew members

CHAPTER VIII - NAVIGATION
8.1 Ice navigation equipment required:
- Ice radar with ice detection capability
- Searchlights for ice observation
- Means of assessing ice thickness and concentration
- Communication with ice information services

CHAPTER XII - MANNING AND TRAINING
12.3 Polar waters training certificates required for:
- Master
- Chief Mate
- Officers in Charge of Navigation Watch
Content: ice navigation, cold weather operations, emergency response

PART II - POLLUTION PREVENTION (MARPOL)

CHAPTER 1 - ENVIRONMENTAL PROTECTION
- Enhanced discharge restrictions in polar waters
- Oil discharge prohibited (stricter than MARPOL Annex I)
- Sewage discharge restrictions
- Garbage discharge prohibited
- Monitoring and reporting requirements`,
    procedures: [
      'Verify Polar Ship Certificate validity and category matches intended operations',
      'Ensure PWOM is current and crew has reviewed operational limitations',
      'Confirm Master and navigating officers hold valid polar waters training certificates',
      'Test ice navigation equipment (ice radar, searchlights) before entering polar waters',
      'Establish daily ice reports and route monitoring procedures',
      'Brief crew on cold weather emergency procedures and equipment',
      'Activate enhanced environmental protection mode (stricter than MARPOL baseline)'
    ],
    complianceChecklist: [
      'Polar Ship Certificate valid and category appropriate (A/B/C)',
      'Polar Water Operational Manual (PWOM) current version onboard',
      'Master and deck officers hold polar waters certificates (STCW)',
      'Ice radar and navigation equipment operational and tested',
      'Searchlights for ice observation functional',
      'Cold weather emergency equipment ready (immersion suits, thermal protection)',
      'Enhanced pollution prevention measures activated',
      'Ice information service contacts programmed (AARI, NIS, CIS)',
      'Daily ice routing and monitoring procedures established'
    ],
    relatedRules: [
      'SOLAS Chapter V - Safety of Navigation',
      'STCW Chapter V - Special Training Requirements',
      'MARPOL - Enhanced Polar Requirements'
    ]
  },

  // SOLAS Voyage Planning
  'solas_voyage_planning': {
    id: 'solas_voyage_planning_reg34',
    category: 'SOLAS',
    title: 'Voyage Planning and Passage Plan Requirements',
    description: 'SOLAS requires a comprehensive passage plan covering the entire voyage from berth to berth, including appraisal, planning, execution, and monitoring phases.',
    reference: 'SOLAS Chapter V, Regulation 34',
    fullText: `SOLAS CHAPTER V - REGULATION 34: SAFE NAVIGATION AND AVOIDANCE OF DANGEROUS SITUATIONS

Regulation 34 mandates:

Prior to proceeding to sea, the master shall ensure that the intended voyage has been planned using the appropriate nautical charts and nautical publications for the area concerned, taking into account the guidelines and recommendations developed by the Organization (IMO Resolution A.893(21)).

FOUR PHASES OF PASSAGE PLANNING:

1. APPRAISAL
   - Gather all information relevant to the passage
   - Charts, publications, pilot books, sailing directions
   - Weather forecasts, ice reports, current information
   - Port information, tides, traffic schemes

2. PLANNING
   - Plot the intended track on appropriate charts
   - Identify hazards along the route (shoals, rocks, traffic)
   - Determine safe speeds, wheel-over points
   - Identify abort points and contingency plans
   - Calculate ETA and fuel requirements

3. EXECUTION
   - Brief bridge team on passage plan
   - Follow planned track, use appropriate charts
   - Maintain proper lookout and safe speed
   - Monitor position continuously

4. MONITORING
   - Continuous verification of ship's position
   - Compare actual vs. planned progress
   - Assess developing situations
   - Update plan as necessary

The passage plan shall:
- Cover the entire voyage from berth to berth
- Be approved by the Master
- Be clearly documented and available to bridge team
- Include contingency plans for emergencies`,
    procedures: [
      'Prepare passage plan before departure using all available information',
      'Plot full route on paper/ECDIS charts with all waypoints clearly marked',
      'Identify all hazards, no-go areas, traffic separation schemes along route',
      'Calculate safe speeds, UKC requirements, and abort/contingency points',
      'Brief entire bridge team on passage plan before departure',
      'Monitor position continuously during execution',
      'Update passage plan when weather/ice/operational changes require'
    ],
    complianceChecklist: [
      'Full passage plan prepared from departure berth to arrival berth',
      'All charts, publications, and NOTMs reviewed and current',
      'Route plotted on approved ECDIS/paper charts',
      'All hazards, restricted areas, and traffic schemes identified',
      'Safe speeds, wheel-over points, and abort points documented',
      'Master has reviewed and signed passage plan',
      'Bridge team briefed on passage plan details',
      'Contingency plans prepared for adverse weather, equipment failure'
    ],
    relatedRules: [
      'SOLAS Chapter V, Reg 14 - Watchkeeping',
      'SOLAS Chapter V, Reg 19 - Carriage of ECDIS',
      'STCW Code Section A-VIII/2 - Watchkeeping Principles'
    ]
  },

  // MARPOL Discharge Restrictions
  'marpol_discharge': {
    id: 'marpol_discharge_restrictions',
    category: 'MARPOL',
    title: 'MARPOL Discharge Restrictions in Special Areas',
    description: 'Strict regulations govern discharge of oil, sewage, and garbage in special areas and polar waters. Enhanced requirements apply beyond baseline MARPOL annexes.',
    reference: 'MARPOL Annexes I, IV, V',
    fullText: `MARPOL - INTERNATIONAL CONVENTION FOR THE PREVENTION OF POLLUTION FROM SHIPS

ANNEX I - OIL POLLUTION
Special Areas (including Arctic):
- Oil or oily mixtures discharge prohibited
- Oil Record Book (ORB) must document all operations
- Violations subject to port state control and penalties

ANNEX IV - SEWAGE POLLUTION
Discharge restrictions:
- <3nm from shore: No discharge
- 3-12nm from shore: Discharge only if treated and vessel underway >4 knots
- >12nm from shore: Untreated sewage allowed if vessel underway >4 knots
- Special Areas (Svalbard): Zero discharge regardless of distance

ANNEX V - GARBAGE POLLUTION
Discharge prohibitions:
- Plastics: NEVER allowed anywhere
- Food waste: >12nm from shore (comminuted >3nm)
- Other garbage: >12nm from shore
- Special Areas: Stricter restrictions apply
- Polar waters: Zero discharge of all garbage

RECORD KEEPING:
- Oil Record Book (ORB) Part I: All oil operations
- Garbage Record Book (GRB): All garbage disposal/discharge
- Records must be maintained for 3 years
- Available for inspection by port state control`,
    procedures: [
      'Maintain Oil Record Book (ORB) - record all tank operations, bunkering, discharge',
      'Maintain Garbage Record Book (GRB) - record all garbage disposal operations',
      'In polar/special areas: Seal all overboard discharge valves, zero discharge mode',
      'Monitor distance from shore continuously when considering sewage discharge',
      'Separate plastics from all other garbage - never discharge overboard',
      'Comminute food waste when >3nm, discharge when >12nm (outside special areas)',
      'Retain all garbage for shore disposal when in Svalbard or Arctic special areas'
    ],
    complianceChecklist: [
      'Oil Record Book (ORB) Part I current and up to date',
      'Garbage Record Book (GRB) current and up to date',
      'All discharge valves identified and logged (open/closed status)',
      'Sewage treatment plant operational (if discharging in 3-12nm range)',
      'Garbage separation system in place (plastics, food, operational waste)',
      'Food waste comminutor operational',
      'Sufficient storage capacity for zero discharge in special areas',
      'Crew briefed on discharge restrictions and record-keeping requirements'
    ],
    relatedRules: [
      'MARPOL Annex II - Noxious Liquid Substances',
      'MARPOL Annex VI - Air Pollution (SOx/NOx)',
      'Svalbardmiljøloven § 26 - Enhanced Svalbard Requirements'
    ]
  }
};

/**
 * Maps warning message patterns to rule IDs
 * Returns the appropriate rule based on warning content
 */
export function getWarningRule(warningMessage: string): RuleReference | null {
  const msg = warningMessage.toLowerCase();

  // Protected area warnings
  if (msg.includes('protected area') && msg.includes('svalbard')) {
    return RULE_DATABASE['svalbard_protected'];
  }
  if (msg.includes('protected area')) {
    return RULE_DATABASE['protected_area'];
  }

  // Polar code warnings
  if (msg.includes('polar') || msg.includes('ice') || msg.includes('60°n') || msg.includes('60°s')) {
    return RULE_DATABASE['polar_code'];
  }

  // Voyage planning warnings
  if (msg.includes('voyage plan') || msg.includes('passage plan')) {
    return RULE_DATABASE['solas_voyage_planning'];
  }

  // Discharge warnings
  if (msg.includes('discharge') || msg.includes('marpol')) {
    return RULE_DATABASE['marpol_discharge'];
  }

  return null;
}
