// Maritime Compliance Rules
// Structured according to MUST / SHOULD / CONSIDER framework

export type ComplianceSeverity = 'MUST' | 'SHOULD' | 'CONSIDER';

export interface ComplianceRule {
  id: string;
  title: string;
  description: string;
  severity: ComplianceSeverity;
  category: string;
  regulation: string;
  applicableZones?: string[];
  icon?: string;
  details?: string[];
}

// SOLAS Navigation Safety (relevant for voyage, not equipment onboard)
const solasNavigationRules: ComplianceRule[] = [
  {
    id: 'solas-nav-watchkeeping',
    title: 'Navigation Watch Requirements',
    description: 'Proper bridge manning and watchkeeping in polar waters',
    severity: 'MUST',
    category: 'SOLAS Chapter V',
    regulation: 'SOLAS V/14 - Safe Navigation',
    details: [
      'Qualified Officer of the Watch at all times',
      'Extra lookout in ice/restricted visibility',
      'Bridge resource management'
    ]
  }
];

// MARPOL Environmental Rules (voyage-specific)
const marpolRules: ComplianceRule[] = [
  {
    id: 'marpol-special-area',
    title: 'Arctic Special Area - Discharge Restrictions',
    description: 'Svalbard waters are within Arctic Special Area under MARPOL',
    severity: 'MUST',
    category: 'MARPOL Annex I, IV, V',
    regulation: 'MARPOL Special Areas',
    applicableZones: ['svalbard', 'arctic'],
    details: [
      'Zero discharge of oil/oily mixtures',
      'No garbage discharge except food waste >12nm',
      'Sewage discharge restrictions apply',
      'Keep records in Oil Record Book'
    ]
  },
  {
    id: 'marpol-nox-eca',
    title: 'NOx Emission Control Area',
    description: 'NOx Tier II or III requirements may apply',
    severity: 'SHOULD',
    category: 'MARPOL Annex VI',
    regulation: 'MARPOL VI/13 - NOx Technical Code',
    details: [
      'Check if vessel complies with Tier II/III',
      'Monitor fuel consumption',
      'Record in engine logbook'
    ]
  }
];

// COLREG - Meeting and Navigation
const colregRules: ComplianceRule[] = [
  {
    id: 'colreg-restricted-visibility',
    title: 'Safe Speed in Restricted Visibility',
    description: 'Moderate speed appropriate to visibility conditions',
    severity: 'MUST',
    category: 'COLREG',
    regulation: 'COLREG Rule 6, 19',
    details: [
      'Reduce speed in fog/snow',
      'Sound fog signals',
      'Post extra lookouts',
      'Radar and AIS monitoring'
    ]
  }
];

// Polar Code - Safety and Environmental
const polarCodeRules: ComplianceRule[] = [
  {
    id: 'polar-code-ice-certificate',
    title: 'Polar Ship Certificate Required',
    description: 'Valid Polar Ship Certificate for operations in polar waters',
    severity: 'MUST',
    category: 'Polar Code Part I-A',
    regulation: 'Polar Code Safety Requirements',
    applicableZones: ['svalbard', 'arctic'],
    details: [
      'Vessel must hold Polar Ship Certificate',
      'Check ice class and operational limitations',
      'Polar Water Operational Manual (PWOM) onboard',
      'Crew trained for polar operations'
    ]
  },
  {
    id: 'polar-code-env-protection',
    title: 'Enhanced Environmental Protection',
    description: 'Additional discharge and emission requirements in polar waters',
    severity: 'MUST',
    category: 'Polar Code Part II-A',
    regulation: 'Polar Code Environmental Requirements',
    applicableZones: ['svalbard', 'arctic'],
    details: [
      'No discharge of oil or oily mixtures',
      'No garbage discharge (except as permitted)',
      'Sewage treatment or holding required',
      'Minimize grey water discharge'
    ]
  }
];

// ISM Code - Operational
const ismCodeRules: ComplianceRule[] = [
  {
    id: 'ism-risk-assessment',
    title: 'Voyage Risk Assessment',
    description: 'Conduct risk assessment for polar voyage operations',
    severity: 'MUST',
    category: 'ISM Code',
    regulation: 'ISM Code 1.2.2 - Safety Management',
    details: [
      'Identify hazards for this specific voyage',
      'Ice navigation risks',
      'Wildlife encounter procedures',
      'Emergency response preparedness'
    ]
  }
];

// Svalbardmiljøvernloven - Norwegian Arctic Law
const svalbardEnvironmentRules: ComplianceRule[] = [
  {
    id: 'svalbard-nature-reserves',
    title: 'Nature Reserve Entry Restrictions',
    description: 'Entry into nature reserves requires special permit from Sysselmannen',
    severity: 'MUST',
    category: 'Svalbardmiljøvernloven § 30',
    regulation: 'Nature Reserve Regulations',
    applicableZones: ['svalbard'],
    details: [
      'No entry without permit to nature reserves',
      'Forbidden to land or anchor in restricted areas',
      'No disturbance to wildlife',
      'Zero waste policy'
    ]
  },
  {
    id: 'svalbard-bird-reserves',
    title: 'Bird Reserve Seasonal Restrictions',
    description: 'No entry during bird nesting season (15 May - 15 August)',
    severity: 'MUST',
    category: 'Svalbardmiljøvernloven § 31',
    regulation: 'Bird Protection Regulations',
    applicableZones: ['svalbard'],
    details: [
      'Entry forbidden 15 May - 15 August',
      'Keep distance from bird cliffs year-round',
      'No drones or loud noises',
      'Observe from safe distance'
    ]
  },
  {
    id: 'svalbard-anchoring',
    title: 'Anchoring in Protected Areas',
    description: 'Anchoring prohibited or restricted in protected seagrass/coral areas',
    severity: 'MUST',
    category: 'Svalbardmiljøvernloven',
    regulation: 'Marine Protection Regulations',
    applicableZones: ['svalbard'],
    details: [
      'No anchoring within seagrass/coral protection zones',
      'Use designated anchorages when available',
      'Check local restrictions before anchoring',
      'Report to Sysselmannen if damage occurs'
    ]
  }
];

// IAATO Guidelines - Expedition Operations
const iaatoRules: ComplianceRule[] = [
  {
    id: 'iaato-wildlife-distance',
    title: 'Wildlife Distance Requirements',
    description: 'Maintain minimum distances from wildlife',
    severity: 'SHOULD',
    category: 'IAATO Guidelines',
    regulation: 'Wildlife Watching Guidelines',
    details: [
      'Polar bears: 250m minimum (or as directed)',
      'Walrus: 30m minimum distance',
      'Seabirds on land: 5m minimum',
      'Whales: 100m minimum',
      'Never approach or feed wildlife'
    ]
  },
  {
    id: 'iaato-zodiac-ops',
    title: 'Zodiac Operations Safety',
    description: 'Follow IAATO guidelines for small boat operations',
    severity: 'SHOULD',
    category: 'IAATO Guidelines',
    regulation: 'Small Boat Operations',
    details: [
      'Qualified drivers only',
      'Passenger briefing before departure',
      'Weather and ice assessment',
      'Emergency equipment onboard',
      'Wildlife avoidance protocols'
    ]
  },
  {
    id: 'iaato-landing-sites',
    title: 'Landing Site Protocols',
    description: 'Use designated landing sites and follow site guidelines',
    severity: 'SHOULD',
    category: 'IAATO Guidelines',
    regulation: 'Visitor Site Guidelines',
    applicableZones: ['svalbard'],
    details: [
      'Check landing site restrictions',
      'Stay on marked paths where present',
      'Group size limitations',
      'No disturbance to cultural sites',
      'Leave no trace principles'
    ]
  }
];

// Port State and Local Requirements
const portStateRules: ComplianceRule[] = [
  {
    id: 'norway-vts-reporting',
    title: 'VTS Reporting to Norwegian Authorities',
    description: 'Mandatory reporting to Norwegian Coastal Administration',
    severity: 'MUST',
    category: 'Norwegian Maritime Regulations',
    regulation: 'Norwegian Ship Reporting System',
    applicableZones: ['svalbard', 'norway'],
    details: [
      'Report to NORCA VTS before entering Norwegian waters',
      'Provide voyage plan and cargo information',
      'Report position updates as required',
      'Maintain VHF watch on designated channels'
    ]
  },
  {
    id: 'svalbard-sysselmannen-permit',
    title: 'Sysselmannen Activity Permit',
    description: 'Certain activities require advance permit from Sysselmannen',
    severity: 'MUST',
    category: 'Svalbard Regulations',
    regulation: 'Governor of Svalbard Requirements',
    applicableZones: ['svalbard'],
    details: [
      'Research activities require permit',
      'Protected area entry requires permit',
      'Report itinerary to Sysselmannen',
      'Emergency contact established'
    ]
  }
];

// Best Practices and Recommendations
const bestPracticeRules: ComplianceRule[] = [
  {
    id: 'best-ice-navigation',
    title: 'Ice Navigation Best Practices',
    description: 'Recommended practices for safe navigation in ice',
    severity: 'CONSIDER',
    category: 'Industry Best Practice',
    regulation: 'IMO Polar Code Guidance',
    details: [
      'Monitor ice charts and forecasts',
      'Reduce speed in ice',
      'Avoid multi-year ice',
      'Post ice lookout',
      'Have ice pilot if conditions warrant'
    ]
  },
  {
    id: 'best-emergency-preparedness',
    title: 'Enhanced Emergency Preparedness',
    description: 'Additional emergency equipment and procedures for remote areas',
    severity: 'CONSIDER',
    category: 'Safety Best Practice',
    regulation: 'Company Safety Management',
    details: [
      'Extra emergency rations and survival equipment',
      'Satellite communications backup',
      'Medical supplies for extended rescue times',
      'SAR coordination plan',
      'Crew briefings on polar survival'
    ]
  },
  {
    id: 'best-weather-monitoring',
    title: 'Enhanced Weather Monitoring',
    description: 'Continuous monitoring of Arctic weather conditions',
    severity: 'CONSIDER',
    category: 'Operational Best Practice',
    regulation: 'Voyage Planning Best Practice',
    details: [
      'Subscribe to Arctic weather services',
      'Monitor local weather stations',
      'Plan for rapid weather changes',
      'Have alternate sheltered anchorages identified',
      'Communicate weather plans to shore'
    ]
  },
  {
    id: 'best-fuel-reserve',
    title: 'Extra Fuel Reserve',
    description: 'Maintain higher fuel reserves for Arctic operations',
    severity: 'CONSIDER',
    category: 'Operational Best Practice',
    regulation: 'Company Policy / Industry Standard',
    details: [
      'Carry 30% extra fuel vs. calculated requirement',
      'Account for ice navigation fuel consumption',
      'Plan refueling opportunities carefully',
      'Monitor consumption rates closely'
    ]
  }
];

// Aggregate all rules
const allRules: ComplianceRule[] = [
  ...solasNavigationRules,
  ...marpolRules,
  ...colregRules,
  ...polarCodeRules,
  ...ismCodeRules,
  ...svalbardEnvironmentRules,
  ...iaatoRules,
  ...portStateRules,
  ...bestPracticeRules
];

export interface RouteComplianceResult {
  must: ComplianceRule[];
  should: ComplianceRule[];
  consider: ComplianceRule[];
  totalRules: number;
}

export function checkRouteCompliance(
  route: Array<{ lat: number; lng: number }>,
  ship: any
): RouteComplianceResult {
  // Check if route passes through Svalbard area (simplified)
  const inSvalbard = route.some(
    point => point.lat > 76 && point.lat < 81 && point.lng > 10 && point.lng < 35
  );

  // Filter rules based on context
  const applicableRules = allRules.filter(rule => {
    // If rule has zone restrictions, check if we're in those zones
    if (rule.applicableZones) {
      if (inSvalbard && rule.applicableZones.includes('svalbard')) {
        return true;
      }
      if (rule.applicableZones.includes('arctic')) {
        return true;
      }
      return false;
    }
    // Rules without zone restrictions always apply
    return true;
  });

  // Categorize by severity
  const must = applicableRules.filter(r => r.severity === 'MUST');
  const should = applicableRules.filter(r => r.severity === 'SHOULD');
  const consider = applicableRules.filter(r => r.severity === 'CONSIDER');

  return {
    must,
    should,
    consider,
    totalRules: applicableRules.length
  };
}

export { allRules };
