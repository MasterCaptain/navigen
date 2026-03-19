import type { PlannedOp } from '../types/plannedOps';

export interface Rule {
  id: string;
  level: 'MUST' | 'SHOULD' | 'CONSIDER';
  source: string;
  title: 'COLREG compliance';
  text: 'Comply with International Regulations for Preventing Collisions at Sea (COLREG) at all times.';
  
  // NEW: optional planned-ops tags
  tags?: PlannedOp[]; // e.g. ['HELICOPTER_OPS', 'BUNKERING']
}

export interface RuleSet {
  zone: string;
  activity: string;
  rules: Rule[];
}

export const ruleSets: RuleSet[] = [
  // HIGH SEAS - UNDERWAY
  {
    zone: 'HIGH SEAS',
    activity: 'UNDERWAY',
    rules: [
      // GENERAL RULES (always visible)
      {
        id: 'hs-uw-1',
        level: 'MUST',
        source: 'IMO',
        title: 'COLREG compliance',
        text: 'Comply with International Regulations for Preventing Collisions at Sea (COLREG) at all times.',
      },
      {
        id: 'hs-uw-2',
        level: 'MUST',
        source: 'SOLAS',
        title: 'Proper lookout',
        text: 'Maintain a proper lookout by sight, hearing, and all available means.',
      },
      {
        id: 'hs-uw-3',
        level: 'MUST',
        source: 'MARPOL',
        title: 'Discharge restrictions',
        text: 'No discharge of oil, noxious substances, or garbage in violation of MARPOL Annex I-V.',
      },
      {
        id: 'hs-uw-4',
        level: 'SHOULD',
        source: 'COMPANY',
        title: 'Weather routing',
        text: 'Follow recommended weather routing to avoid heavy weather when practicable.',
      },
      {
        id: 'hs-uw-5',
        level: 'SHOULD',
        source: 'IMO',
        title: 'Voyage planning',
        text: 'Maintain updated voyage plan with all waypoints logged and cross-checked.',
      },
      {
        id: 'hs-uw-6',
        level: 'CONSIDER',
        source: 'COMPANY',
        title: 'Fuel optimization',
        text: 'Consider route adjustments for fuel efficiency when safe to do so.',
      },

      // PLANNED OPS: HELICOPTER_OPS
      {
        id: 'hs-uw-helo-1',
        level: 'MUST',
        source: 'COMPANY',
        title: 'Helicopter deck status',
        text: 'Confirm helideck is certified, clear, lit as required, and declared ready before any helicopter operation.',
        tags: ['HELICOPTER_OPS'],
      },
      {
        id: 'hs-uw-helo-2',
        level: 'MUST',
        source: 'COMPANY',
        title: 'HLO and emergency party',
        text: 'Assign HLO and muster fire party/rescue team with communications established prior to helicopter landing or winching.',
        tags: ['HELICOPTER_OPS'],
      },
      {
        id: 'hs-uw-helo-3',
        level: 'SHOULD',
        source: 'COMPANY',
        title: 'Weather minima',
        text: 'Verify wind/visibility/sea state against agreed helicopter minima and suspend ops if conditions deteriorate.',
        tags: ['HELICOPTER_OPS'],
      },

      // PLANNED OPS: BUNKERING
      {
        id: 'hs-uw-bunk-1',
        level: 'MUST',
        source: 'COMPANY',
        title: 'Bunkering checklist',
        text: 'Complete bunkering checklist and establish stop signals, communications, and spill response readiness before transfer.',
        tags: ['BUNKERING'],
      },
      {
        id: 'hs-uw-bunk-2',
        level: 'MUST',
        source: 'MARPOL',
        title: 'Spill prevention',
        text: 'Rig drip trays, scuppers plugged as appropriate, and have containment/absorbents ready for any fuel transfer.',
        tags: ['BUNKERING'],
      },
      {
        id: 'hs-uw-bunk-3',
        level: 'SHOULD',
        source: 'COMPANY',
        title: 'Weather window for transfer',
        text: 'Conduct bunkering only within an agreed weather window to avoid hose/fender failure and loss of containment.',
        tags: ['BUNKERING'],
      },

      // PLANNED OPS: ANCHORING
      {
        id: 'hs-uw-anch-1',
        level: 'MUST',
        source: 'COMPANY',
        title: 'Anchor plan and checks',
        text: 'Prepare anchoring plan including depth, under-keel clearance, swing circle, and anchor equipment readiness before letting go.',
        tags: ['ANCHORING'],
      },
      {
        id: 'hs-uw-anch-2',
        level: 'MUST',
        source: 'COMPANY',
        title: 'Anchor watch',
        text: 'Establish anchor watch with position monitoring and defined limits for dragging alarm and engine readiness.',
        tags: ['ANCHORING'],
      },
      {
        id: 'hs-uw-anch-3',
        level: 'CONSIDER',
        source: 'COMPANY',
        title: 'Underwater obstructions',
        text: 'Consider seabed type, cables/pipelines, and restricted areas before selecting anchor position.',
        tags: ['ANCHORING'],
      },

      // PLANNED OPS: ICE_NAV
      {
        id: 'hs-uw-ice-1',
        level: 'MUST',
        source: 'IMO',
        title: 'Ice navigation procedures',
        text: 'Apply company ice navigation procedures including speed limits, lookout enhancement, and route monitoring when ice is present.',
        tags: ['ICE_NAV'],
      },
      {
        id: 'hs-uw-ice-2',
        level: 'SHOULD',
        source: 'COMPANY',
        title: 'Enhanced watch',
        text: 'Post an additional ice lookout and increase position fixing/monitoring frequency during ice navigation.',
        tags: ['ICE_NAV'],
      },
      {
        id: 'hs-uw-ice-3',
        level: 'CONSIDER',
        source: 'COMPANY',
        title: 'Ice imagery sources',
        text: 'Consider integrating the latest ice charts, satellite imagery, and local reports when planning ice routes.',
        tags: ['ICE_NAV'],
      },

      // PLANNED OPS: DIVING
      {
        id: 'hs-uw-dive-1',
        level: 'MUST',
        source: 'COMPANY',
        title: 'Diving safety zone',
        text: 'Establish and enforce a diving safety zone with clear marking, lookout, and traffic control while divers are in the water.',
        tags: ['DIVING'],
      },
      {
        id: 'hs-uw-dive-2',
        level: 'MUST',
        source: 'COMPANY',
        title: 'Propulsion restrictions',
        text: 'Apply propulsion/propeller restrictions and thruster limitations as per diving checklist while divers are deployed.',
        tags: ['DIVING'],
      },
      {
        id: 'hs-uw-dive-3',
        level: 'SHOULD',
        source: 'COMPANY',
        title: 'Emergency and medevac readiness',
        text: 'Ensure recompression/medical plan, recovery equipment, and communications are ready before commencing diving operations.',
        tags: ['DIVING'],
      },

      // PLANNED OPS: ZODIAC_OPS
      {
        id: 'hs-uw-zod-1',
        level: 'MUST',
        source: 'SOLAS',
        title: 'Lifejackets during zodiac ops',
        text: 'Ensure all persons involved in zodiac operations wear approved lifejackets and follow embarkation control.',
        tags: ['ZODIAC_OPS'],
      },
      {
        id: 'hs-uw-zod-2',
        level: 'SHOULD',
        source: 'COMPANY',
        title: 'VHF communications',
        text: 'Maintain dedicated VHF working channel and check-in intervals between mother vessel and all zodiacs.',
        tags: ['ZODIAC_OPS'],
      },

      // PLANNED OPS: DRONE_OPS
      {
        id: 'hs-uw-drone-1',
        level: 'MUST',
        source: 'COMPANY',
        title: 'Drone launch control',
        text: 'Establish controlled launch/recovery area, ensure separation from helideck ops, and assign a responsible drone operator.',
        tags: ['DRONE_OPS'],
      },
      {
        id: 'hs-uw-drone-2',
        level: 'SHOULD',
        source: 'COMPANY',
        title: 'Airspace and privacy checks',
        text: 'Verify local restrictions, privacy considerations, and safe operating conditions before flying drones near people or wildlife.',
        tags: ['DRONE_OPS'],
      },
    ],
  },

  // HIGH SEAS - ZODIAC OPS
  {
    zone: 'HIGH SEAS',
    activity: 'ZODIAC OPS',
    rules: [
      {
        id: 'hs-zo-1',
        level: 'MUST',
        source: 'SOLAS',
        title: 'Life jacket requirement',
        text: 'All passengers and crew must wear approved life jackets during zodiac operations.',
      },
      {
        id: 'hs-zo-2',
        level: 'MUST',
        source: 'COMPANY',
        title: 'Weather limits',
        text: 'Zodiac ops must be suspended if wind exceeds 25 knots or wave height exceeds 2.0m.',
      },
      {
        id: 'hs-zo-3',
        level: 'SHOULD',
        source: 'COMPANY',
        title: 'Crew briefing',
        text: 'Brief all zodiac drivers on current sea state and emergency procedures.',
      },
      {
        id: 'hs-zo-4',
        level: 'SHOULD',
        source: 'IMO',
        title: 'Radio contact',
        text: 'Maintain VHF radio contact between zodiacs and mother vessel.',
      },
      {
        id: 'hs-zo-5',
        level: 'CONSIDER',
        source: 'COMPANY',
        title: 'Passenger briefing',
        text: 'Consider additional safety briefing for first-time zodiac passengers.',
      },
    ],
  },

  // EXPEDITION - UNDERWAY
  {
    zone: 'EXPEDITION',
    activity: 'UNDERWAY',
    rules: [
      {
        id: 'ant-uw-1',
        level: 'MUST',
        source: 'Polar Code',
        title: 'Polar Code navigation',
        text: 'Comply with Polar Code requirements for navigation in ice-covered waters.',
      },
      {
        id: 'ant-uw-2',
        level: 'MUST',
        source: 'IAATO',
        title: 'Protected area restrictions',
        text: 'Do not enter Antarctic Specially Protected Areas (ASPA) without permit.',
      },
      {
        id: 'ant-uw-3',
        level: 'MUST',
        source: 'MARPOL',
        title: 'Discharge prohibition',
        text: 'Absolute prohibition on discharge of oil, sewage, or waste in Antarctic waters.',
      },
      {
        id: 'ant-uw-4',
        level: 'SHOULD',
        source: 'IAATO',
        title: 'Wildlife approach distance',
        text: 'Maintain minimum 200m distance from marine mammals when vessel is underway.',
      },
      {
        id: 'ant-uw-5',
        level: 'SHOULD',
        source: 'COMPANY',
        title: 'Ice navigation',
        text: 'Reduce speed to safe maneuvering speed when navigating in pack ice.',
      },
      {
        id: 'ant-uw-6',
        level: 'CONSIDER',
        source: 'IAATO',
        title: 'Scientific coordination',
        text: 'Consider coordinating with nearby research stations for ice condition updates.',
      },
    ],
  },

  // EXPEDITION - ZODIAC OPS
  {
    zone: 'EXPEDITION',
    activity: 'ZODIAC OPS',
    rules: [
      {
        id: 'ant-zo-1',
        level: 'MUST',
        source: 'IAATO',
        title: 'Zodiac pax limit',
        text: 'Maximum 12 passengers per zodiac during landing operations in Antarctica.',
      },
      {
        id: 'ant-zo-2',
        level: 'MUST',
        source: 'SOLAS',
        title: 'Life jacket requirement',
        text: 'All passengers must wear approved life jackets during zodiac transit.',
      },
      {
        id: 'ant-zo-3',
        level: 'MUST',
        source: 'IAATO',
        title: 'Wildlife distance minimum',
        text: 'Maintain minimum 5m distance from wildlife at all times during landings.',
      },
      {
        id: 'ant-zo-4',
        level: 'SHOULD',
        source: 'COMPANY',
        title: 'Weather threshold',
        text: 'Zodiac ops should be suspended if wave height exceeds 1.5m in Antarctic waters.',
      },
      {
        id: 'ant-zo-5',
        level: 'SHOULD',
        source: 'IAATO',
        title: 'Landing group size',
        text: 'Landing groups should not exceed 100 persons ashore at any time.',
      },
      {
        id: 'ant-zo-6',
        level: 'SHOULD',
        source: 'COMPANY',
        title: 'Crew safety briefing',
        text: 'Brief all zodiac drivers on current conditions and wildlife activity before deployment.',
      },
      {
        id: 'ant-zo-7',
        level: 'CONSIDER',
        source: 'IAATO',
        title: 'Photo briefing',
        text: 'Consider providing wildlife photography etiquette briefing to minimize disturbance.',
      },
    ],
  },

  // EXPEDITION - PORT OPS (e.g., research station)
  {
    zone: 'EXPEDITION',
    activity: 'PORT OPS',
    rules: [
      {
        id: 'ant-po-1',
        level: 'MUST',
        source: 'IAATO',
        title: 'Station coordination',
        text: 'All operations must be coordinated with research station management.',
      },
      {
        id: 'ant-po-2',
        level: 'MUST',
        source: 'PORT',
        title: 'Environmental protocol',
        text: 'Strict adherence to Antarctic Treaty environmental protection protocols.',
      },
      {
        id: 'ant-po-3',
        level: 'MUST',
        source: 'IAATO',
        title: 'Biosecurity measures',
        text: 'All personnel and equipment must undergo biosecurity inspection before landing.',
      },
      {
        id: 'ant-po-4',
        level: 'SHOULD',
        source: 'COMPANY',
        title: 'Waste management',
        text: 'All waste generated must be returned to vessel; no disposal ashore.',
      },
      {
        id: 'ant-po-5',
        level: 'CONSIDER',
        source: 'IAATO',
        title: 'Station support',
        text: 'Consider offering medical or supply support to research station if requested.',
      },
    ],
  },

  // PORT - UNDERWAY
  {
    zone: 'PORT',
    activity: 'UNDERWAY',
    rules: [
      {
        id: 'port-uw-1',
        level: 'MUST',
        source: 'PORT',
        title: 'Speed limit',
        text: 'Do not exceed port speed limit of 5 knots within harbor limits.',
      },
      {
        id: 'port-uw-2',
        level: 'MUST',
        source: 'PORT',
        title: 'VTS communication',
        text: 'Maintain continuous VHF communication with Vessel Traffic Service (VTS).',
      },
      {
        id: 'port-uw-3',
        level: 'MUST',
        source: 'IMO',
        title: 'Pilot onboard',
        text: 'Pilot must be onboard for all movements within pilotage district.',
      },
      {
        id: 'port-uw-4',
        level: 'SHOULD',
        source: 'PORT',
        title: 'Designated channels',
        text: 'Use designated traffic lanes and avoid crossing shipping channels.',
      },
      {
        id: 'port-uw-5',
        level: 'SHOULD',
        source: 'COMPANY',
        title: 'Tug assistance',
        text: 'Consider tug assistance for vessels over 10,000 GT in confined waters.',
      },
    ],
  },

  // PORT - PORT OPS
  {
    zone: 'PORT',
    activity: 'PORT OPS',
    rules: [
      // GENERAL RULES (always visible)
      {
        id: 'port-po-1',
        level: 'MUST',
        source: 'PORT',
        title: 'Berthing plan approval',
        text: 'Berthing plan must be approved by port authority before commencing operations.',
      },
      {
        id: 'port-po-2',
        level: 'MUST',
        source: 'ISPS',
        title: 'Security declaration',
        text: 'Complete ISPS security declaration and submit to port facility security officer.',
      },
      {
        id: 'port-po-3',
        level: 'MUST',
        source: 'PORT',
        title: 'Waste disposal',
        text: 'All waste must be disposed through approved port reception facilities.',
      },
      {
        id: 'port-po-4',
        level: 'SHOULD',
        source: 'COMPANY',
        title: 'Gangway safety',
        text: 'Ensure gangway is properly rigged with safety net and illuminated.',
      },
      {
        id: 'port-po-5',
        level: 'SHOULD',
        source: 'PORT',
        title: 'Shore power',
        text: 'Connect to shore power within 2 hours of berthing to reduce emissions.',
      },
      {
        id: 'port-po-6',
        level: 'CONSIDER',
        source: 'COMPANY',
        title: 'Crew welfare',
        text: 'Consider shore leave rotation for crew welfare during port stay.',
      },

      // PLANNED OPS: BUNKERING
      {
        id: 'port-po-bunk-1',
        level: 'MUST',
        source: 'PORT',
        title: 'Port bunkering requirements',
        text: 'Comply with port bunkering permits, notifications, and designated transfer procedures before commencing fuel transfer.',
        tags: ['BUNKERING'],
      },

      // PLANNED OPS: ANCHORING
      {
        id: 'port-po-anch-1',
        level: 'MUST',
        source: 'PORT',
        title: 'Anchorage regulations',
        text: 'Use only designated anchorage areas and comply with reporting/VTS requirements when anchoring within port limits.',
        tags: ['ANCHORING'],
      },

      // PLANNED OPS: DRONE_OPS
      {
        id: 'port-po-drone-1',
        level: 'MUST',
        source: 'PORT',
        title: 'Drone restrictions in port',
        text: 'Do not operate drones in port areas unless explicitly permitted and risk assessed with port security considerations.',
        tags: ['DRONE_OPS'],
      },

      // PLANNED OPS: HELICOPTER_OPS
      {
        id: 'port-po-helo-1',
        level: 'SHOULD',
        source: 'PORT',
        title: 'Helicopter coordination',
        text: 'Coordinate any helicopter operation with port authority and ensure compatibility with local air traffic restrictions.',
        tags: ['HELICOPTER_OPS'],
      },
    ],
  },

  // HIGH SEAS - PORT OPS (offshore operations)
  {
    zone: 'HIGH SEAS',
    activity: 'PORT OPS',
    rules: [
      {
        id: 'hs-po-1',
        level: 'MUST',
        source: 'IMO',
        title: 'DP operations',
        text: 'Dynamic positioning (DP) system must be active during offshore operations.',
      },
      {
        id: 'hs-po-2',
        level: 'MUST',
        source: 'COMPANY',
        title: 'Weather window',
        text: 'Operations must only proceed within approved weather window parameters.',
      },
      {
        id: 'hs-po-3',
        level: 'SHOULD',
        source: 'COMPANY',
        title: 'Offshore safety zone',
        text: 'Establish and broadcast 500m safety zone around operations area.',
      },
      {
        id: 'hs-po-4',
        level: 'CONSIDER',
        source: 'COMPANY',
        title: 'Personnel transfer',
        text: 'Consider suspending personnel transfers if motion exceeds 2m significant wave height.',
      },
    ],
  },

  // SVALBARD - UNDERWAY
  {
    zone: 'SVALBARD',
    activity: 'UNDERWAY',
    rules: [
      {
        id: 'svb-uw-1',
        level: 'MUST',
        source: 'SVALBARD',
        title: 'Svalbardmiljøloven § 4',
        text: 'Prohibited to cause harm or disturbance to fauna, flora, or natural environment without permit.',
      },
      {
        id: 'svb-uw-2',
        level: 'MUST',
        source: 'SVALBARD',
        title: 'Discharge ban § 26',
        text: 'Absolute prohibition on discharge of oil, sewage, waste, or pollutants in Svalbard waters.',
      },
      {
        id: 'svb-uw-3',
        level: 'MUST',
        source: 'SVALBARD',
        title: 'Protected areas § 29',
        text: 'Entry to nature reserves and national parks prohibited without permit from Sysselmannen.',
      },
      {
        id: 'svb-uw-4',
        level: 'MUST',
        source: 'Polar Code',
        title: 'Polar Code compliance',
        text: 'Full compliance with Polar Code Part I-A (safety) and Part II-A (pollution prevention).',
      },
      {
        id: 'svb-uw-5',
        level: 'SHOULD',
        source: 'SVALBARD',
        title: 'Wildlife approach § 30',
        text: 'Maintain minimum 30m from walrus, 150m from polar bears, and follow approach guidelines.',
      },
      {
        id: 'svb-uw-6',
        level: 'SHOULD',
        source: 'SVALBARD',
        title: 'Speed restrictions',
        text: 'Reduce speed to 10 knots or less in areas with high wildlife activity or ice presence.',
      },
      {
        id: 'svb-uw-7',
        level: 'SHOULD',
        source: 'SOLAS',
        title: 'Ice navigation watch',
        text: 'Maintain enhanced bridge watch with dedicated ice observer when ice coverage exceeds 10%.',
      },
      {
        id: 'svb-uw-8',
        level: 'CONSIDER',
        source: 'SVALBARD',
        title: 'Sysselmannen reporting',
        text: 'Consider reporting vessel position and itinerary to Sysselmannen for safety coordination.',
      },
      {
        id: 'svb-uw-9',
        level: 'CONSIDER',
        source: 'COMPANY',
        title: 'Cultural heritage sites',
        text: 'Be aware of and avoid anchoring near protected cultural heritage sites (100m buffer).',
      },
    ],
  },

  // SVALBARD - ZODIAC OPS
  {
    zone: 'SVALBARD',
    activity: 'ZODIAC OPS',
    rules: [
      {
        id: 'svb-zo-1',
        level: 'MUST',
        source: 'SVALBARD',
        title: 'Landing permit § 73',
        text: 'All landings in protected areas require advance permit from Sysselmannen.',
      },
      {
        id: 'svb-zo-2',
        level: 'MUST',
        source: 'SVALBARD',
        title: 'Firearms requirement',
        text: 'All zodiac crew and shore parties must carry firearms for polar bear protection.',
      },
      {
        id: 'svb-zo-3',
        level: 'MUST',
        source: 'SVALBARD',
        title: 'Wildlife distance § 30',
        text: 'Minimum 30m from walrus, 150m from polar bears. Never position between animal and escape route.',
      },
      {
        id: 'svb-zo-4',
        level: 'MUST',
        source: 'SOLAS',
        title: 'Life jacket compliance',
        text: 'All passengers and crew must wear approved life jackets during zodiac operations.',
      },
      {
        id: 'svb-zo-5',
        level: 'MUST',
        source: 'SVALBARD',
        title: 'Vegetation protection § 23',
        text: 'Avoid damage to vegetation. No walking on moss, lichen, or fragile tundra plants.',
      },
      {
        id: 'svb-zo-6',
        level: 'SHOULD',
        source: 'SVALBARD',
        title: 'Group size limits',
        text: 'Landing groups should not exceed 50 persons ashore simultaneously in sensitive areas.',
      },
      {
        id: 'svb-zo-7',
        level: 'SHOULD',
        source: 'COMPANY',
        title: 'Polar bear watch',
        text: 'Assign dedicated polar bear guard with binoculars and rifle during all shore activities.',
      },
      {
        id: 'svb-zo-8',
        level: 'SHOULD',
        source: 'SVALBARD',
        title: 'Cultural site buffer',
        text: 'Maintain 100m distance from historical buildings, trappers huts, and archaeological sites.',
      },
      {
        id: 'svb-zo-9',
        level: 'CONSIDER',
        source: 'COMPANY',
        title: 'Leave no trace',
        text: 'Brief all passengers on leave-no-trace principles and proper Arctic etiquette.',
      },
      {
        id: 'svb-zo-10',
        level: 'CONSIDER',
        source: 'SVALBARD',
        title: 'Bird nesting season',
        text: 'During June-August, consider avoiding areas with active bird colonies (500m buffer).',
      },
    ],
  },

  // SVALBARD - PORT OPS (Longyearbyen, Ny-Ålesund)
  {
    zone: 'SVALBARD',
    activity: 'PORT OPS',
    rules: [
      {
        id: 'svb-po-1',
        level: 'MUST',
        source: 'PORT',
        title: 'Port notification',
        text: 'Notify Longyearbyen Port Authority 24 hours prior to arrival with full vessel details.',
      },
      {
        id: 'svb-po-2',
        level: 'MUST',
        source: 'SVALBARD',
        title: 'Waste retention § 26',
        text: 'All waste must be retained onboard or disposed through approved reception facilities only.',
      },
      {
        id: 'svb-po-3',
        level: 'MUST',
        source: 'PORT',
        title: 'Pilotage compliance',
        text: 'Pilotage is mandatory for vessels over 5,000 GT entering Longyearbyen harbor.',
      },
      {
        id: 'svb-po-4',
        level: 'MUST',
        source: 'SVALBARD',
        title: 'Ballast water § 28',
        text: 'No ballast water discharge without prior approval. Risk of invasive species introduction.',
      },
      {
        id: 'svb-po-4b',
        level: 'MUST',
        source: 'Polar Code',
        title: 'Polar Code compliance in port',
        text: 'Vessel must be equipped and operated according to Polar Code requirements while in Svalbard ports.',
      },
      {
        id: 'svb-po-5',
        level: 'SHOULD',
        source: 'PORT',
        title: 'Shore power connection',
        text: 'Connect to shore power within 2 hours to minimize air and noise pollution.',
      },
      {
        id: 'svb-po-6',
        level: 'SHOULD',
        source: 'SVALBARD',
        title: 'Fuel transfer protocol',
        text: 'Follow strict fuel transfer protocols with spill containment equipment ready.',
      },
      {
        id: 'svb-po-7',
        level: 'SHOULD',
        source: 'COMPANY',
        title: 'Crew briefing',
        text: 'Brief crew on local regulations, polar bear awareness, and emergency procedures ashore.',
      },
      {
        id: 'svb-po-8',
        level: 'CONSIDER',
        source: 'PORT',
        title: 'Local supply support',
        text: 'Consider sourcing provisions locally to support Longyearbyen community economy.',
      },
      
      // PLANNED OPS: HELICOPTER_OPS
      {
        id: 'svb-po-helo-1',
        level: 'MUST',
        source: 'COMPANY',
        title: 'HLO & deck readiness',
        text: 'Establish HLO, fire party and clear deck prior to helicopter operations.',
        tags: ['HELICOPTER_OPS'],
      },
      {
        id: 'svb-po-helo-2',
        level: 'MUST',
        source: 'AVIATION',
        title: 'Weather minima for helo ops',
        text: 'Helicopter operations require visibility min 5 NM, cloud base min 500ft, wind max 35 knots.',
        tags: ['HELICOPTER_OPS'],
      },
      {
        id: 'svb-po-helo-3',
        level: 'SHOULD',
        source: 'COMPANY',
        title: 'FOD walk-down',
        text: 'Conduct Foreign Object Debris (FOD) walk-down on helideck before operations.',
        tags: ['HELICOPTER_OPS'],
      },
      
      // PLANNED OPS: BUNKERING
      {
        id: 'svb-po-bunk-1',
        level: 'MUST',
        source: 'MARPOL',
        title: 'Bunkering plan approval',
        text: 'Submit bunkering plan to port authority and obtain approval before commencing fuel transfer.',
        tags: ['BUNKERING'],
      },
      {
        id: 'svb-po-bunk-2',
        level: 'MUST',
        source: 'COMPANY',
        title: 'Spill containment readiness',
        text: 'Spill containment equipment and boom must be rigged and ready before fuel hose connection.',
        tags: ['BUNKERING'],
      },
      {
        id: 'svb-po-bunk-3',
        level: 'SHOULD',
        source: 'SVALBARD',
        title: 'Arctic bunkering supervision',
        text: 'Maintain continuous deck supervision during all bunkering operations in Svalbard waters.',
        tags: ['BUNKERING'],
      },
    ],
  },
];

// =============================================================================
// SVALBARD VERNOMRÅDE-SPESIFIKKE REGLER
// Forskrift 4. april 2014 nr. 377
// =============================================================================

export const SVALBARD_PROTECTED_AREA_RULES: Record<string, Rule[]> = {
  // NATIONAL PARKS - General rules (§ 5-7)
  'NASJONALPARK': [
    {
      id: 'np-gen-1',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'Travel regulations in national parks § 5',
      text: 'Travel on foot and by small craft is permitted. Motorized travel, camping and other activities require permit from Sysselmannen.',
    },
    {
      id: 'np-gen-2',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'Disturbance prohibition § 6',
      text: 'Any form of disturbance to the natural environment, wildlife, plant life or cultural monuments is prohibited without permit.',
    },
    {
      id: 'np-gen-3',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'Waste management § 7',
      text: 'All waste must be removed from the area. No garbage, objects or pollution may be left behind.',
    },
  ],

  // NORDAUST-SVALBARD NATIONAL PARK - Strictest protection
  'PROTECTED_NORDAUST_SVALBARD': [
    {
      id: 'na-np-1',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'Nordaust-Svalbard strict protection § 15',
      text: 'Nordaust-Svalbard National Park (18,520 km²) - Norway\'s largest national park. Strict protection of pristine Arctic wilderness. Landing only with special permit.',
    },
    {
      id: 'na-np-2',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'Walrus protection § 16',
      text: 'Special protection of walrus colonies on Nordaustlandet and Kvitøya. Minimum 500m distance from colonies.',
    },
    {
      id: 'na-np-3',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'Polar bear protection § 17',
      text: 'This is core habitat for the polar bear population. Extra vigilance required. 300m minimum distance.',
    },
  ],

  // NORDVEST-SPITSBERGEN NATIONAL PARK
  'PROTECTED_NORDVEST_SPITSBERGEN': [
    {
      id: 'nv-np-1',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'Northwest Spitsbergen regulations § 18',
      text: 'Northwest Spitsbergen National Park (9,914 km²). Includes Kongsfjorden and Krossfjorden. Landing permitted at designated sites only.',
    },
    {
      id: 'nv-np-2',
      level: 'SHOULD',
      source: 'Svalbardmiljøvernloven',
      title: 'Cultural heritage protection § 19',
      text: 'Area contains many historic whaling stations and trapping huts. 100m distance from cultural monuments.',
    },
  ],

  // SØR-SPITSBERGEN NATIONAL PARK
  'PROTECTED_SOR_SPITSBERGEN': [
    {
      id: 'so-np-1',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'South Spitsbergen regulations § 20',
      text: 'South Spitsbergen National Park (5,030 km²). Encompasses Hornsund and southern part of the island. Regulated landing and travel.',
    },
    {
      id: 'so-np-2',
      level: 'SHOULD',
      source: 'Svalbardmiljøvernloven',
      title: 'Bird colony protection § 21',
      text: 'Large bird colonies along the coast. 500m minimum distance to active bird cliffs during June-August period.',
    },
  ],

  // FORLANDET NATIONAL PARK
  'PROTECTED_FORLANDET': [
    {
      id: 'fo-np-1',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'Prins Karls Forland regulations § 22',
      text: 'Forlandet National Park (640 km²). Walrus reserve on west coast. Landing strictly regulated.',
    },
    {
      id: 'fo-np-2',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'West coast walrus protection § 23',
      text: 'West coast is important resting area for walrus. Absolute landing prohibition west of island during period 15 May - 15 September.',
    },
  ],

  // NORDRE ISFJORDEN NATIONAL PARK
  'PROTECTED_NORDRE_ISFJORDEN': [
    {
      id: 'ni-np-1',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'North Isfjorden regulations § 24',
      text: 'North Isfjorden National Park (2,954 km²). Covers areas north of Isfjorden with several inlets and fjord arms.',
    },
  ],

  // BIRD RESERVES - Extra strict rules
  'PROTECTED_MOFFEN': [
    {
      id: 'mo-fr-1',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'Moffen bird reserve § 30',
      text: 'Moffen is walrus reserve and bird reserve. Absolute prohibition against landing and travel within 300m of island (1 May - 15 September).',
    },
    {
      id: 'mo-fr-2',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'Moffen seasonal prohibition',
      text: 'Enhanced protection during period 1 May to 15 September due to walrus colony. Not permitted to travel within 300m.',
    },
  ],

  'PROTECTED_DUNOYANE': [
    {
      id: 'du-fr-1',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'Dunøyane bird reserve § 31',
      text: 'Dunøyane bird reserve northeast of Spitsbergen. Important breeding area for glaucous gull and eider duck. Landing prohibited May-August.',
    },
  ],

  'PROTECTED_KONGSFJORDEN_BIRD': [
    {
      id: 'ko-fr-1',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'Kongsfjorden bird reserve § 32',
      text: 'Bird reserve in Kongsfjorden. Breeding area for seabirds. Landing prohibited on selected islets and skerries.',
    },
  ],

  // NATURE RESERVES - Strictest protection category
  'PROTECTED_BJORNOYA': [
    {
      id: 'bj-nr-1',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'Bjørnøya nature reserve § 35',
      text: 'Bjørnøya nature reserve - strictly protected. One of Norway\'s most important bird cliffs with over 100,000 seabirds. Landing only with special permit.',
    },
    {
      id: 'bj-nr-2',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'Bjørnøya bird cliff protection',
      text: 'Strict prohibition against landing and travel during period 1 May - 31 August due to breeding season.',
    },
  ],

  'PROTECTED_HOPEN': [
    {
      id: 'ho-nr-1',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'Hopen nature reserve § 36',
      text: 'Hopen nature reserve - isolated island southeast of Spitsbergen. Strict protection of pristine nature. Landing only with permit from Sysselmannen.',
    },
  ],

  // GEOTOPE PROTECTED AREA
  'PROTECTED_FESTNINGEN_GEOTOP': [
    {
      id: 'fe-geo-1',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'Festningen geotope protected area § 40',
      text: 'Festningen geotope protected area near Longyearbyen. Protects geological formations and fossils. Prohibition against terrain interventions.',
    },
    {
      id: 'fe-geo-2',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'Fossil protection',
      text: 'Absolute prohibition against removing fossils, rocks or geological samples from the area.',
    },
  ],

  // PLANT PROTECTED AREAS
  'PROTECTED_BJORNDALEN_PLANT': [
    {
      id: 'bd-pv-1',
      level: 'MUST',
      source: 'Svalbardmiljøvernloven',
      title: 'Bjørndalen plant protected area § 41',
      text: 'Bjørndalen plant protected area - protects rich polar vegetation. Absolute prohibition against trampling vegetation or picking plants.',
    },
  ],
};

export function getRulesForModule(
  zone: string,
  activity: string,
  plannedOps: PlannedOp[] = []
): Rule[] {
  // Handle multiple zones (e.g., "SVALBARD + HIGH SEAS")
  const zones = zone.split(' + ').map(z => z.trim());
  
  // Collect rules from all active zones
  const allRules: Rule[] = [];
  const seenIds = new Set<string>();
  
  const opSet = new Set(plannedOps);

  const shouldInclude = (rule: Rule) => {
    const tags = rule.tags ?? [];
    const isGeneral = tags.length === 0;
    if (isGeneral) return true; // alltid med
    // planned rule: må matche minst én valgt op
    return tags.some(t => opSet.has(t));
  };
  
  for (const z of zones) {
    // Try exact match first
    let ruleSet = ruleSets.find(
      rs => rs.zone === z && rs.activity === activity
    );
    
    // FALLBACK: If no exact match, try UNDERWAY as default activity
    if (!ruleSet && activity !== 'UNDERWAY') {
      console.log(`⚠️ No ruleset for ${z} + ${activity}, falling back to UNDERWAY`);
      ruleSet = ruleSets.find(
        rs => rs.zone === z && rs.activity === 'UNDERWAY'
      );
    }
    
    if (ruleSet) {
      // Add rules, avoiding duplicates by ID
      for (const rule of ruleSet.rules) {
        if (!shouldInclude(rule)) continue;
        if (!seenIds.has(rule.id)) {
          allRules.push(rule);
          seenIds.add(rule.id);
        }
      }
    } else {
      console.warn(`⚠️ No ruleset found for zone: ${z}, activity: ${activity}`);
    }
  }
  
  // Optional: stable order MUST -> SHOULD -> CONSIDER
  const rank = { MUST: 0, SHOULD: 1, CONSIDER: 2 } as const;
  allRules.sort((a, b) => rank[a.level] - rank[b.level]);
  
  return allRules;
}