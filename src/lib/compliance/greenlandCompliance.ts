// src/lib/compliance/greenlandCompliance.ts

export type OperationMode =
  | 'TRANSIT'
  | 'AT_ANCHOR'
  | 'LANDING'
  | 'CRUISING'
  | 'UNKNOWN';

export type VesselProfile = {
  flagState?: string;
  hasLocalGuide?: boolean;
  passengerCount?: number;
  iceClass?: string | null;
};

export type ComplianceContext = {
  activeAreaIds: string[];
  operationMode: OperationMode;
  currentDate?: Date;
  vesselProfile?: VesselProfile;
};

export type EvaluatedComplianceRule = {
  id: string;
  title: string;
  category: 'MUST' | 'SHOULD' | 'CONSIDER';
  source: 'GREENLAND_PROPOSAL' | 'GREENLAND_LOCAL' | 'IMO_POLAR' | 'SOLAS' | 'MARPOL';
  description: string;
  reference?: string;
  evaluationStatus: 'ACTIVE' | 'CONDITIONAL' | 'INACTIVE';
  reason?: string;
  areaId?: string;
};

function getMonthDay(date: Date) {
  return {
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function isOnOrAfter(date: Date, month: number, day: number): boolean {
  const md = getMonthDay(date);
  if (md.month > month) return true;
  if (md.month < month) return false;
  return md.day >= day;
}

function hasArea(activeAreaIds: string[], areaId: string): boolean {
  return activeAreaIds.includes(areaId);
}

function hasAnyArea(activeAreaIds: string[], prefix: string): boolean {
  return activeAreaIds.some((id) => id.startsWith(prefix));
}

function getMatchingAreaIds(activeAreaIds: string[], prefix: string): string[] {
  return activeAreaIds.filter((id) => id.startsWith(prefix));
}

export function evaluateGreenlandCompliance(
  context: ComplianceContext
): EvaluatedComplianceRule[] {
  const {
    activeAreaIds,
    operationMode,
    currentDate = new Date(),
    vesselProfile = {},
  } = context;

  const results: EvaluatedComplianceRule[] = [];
  const seen = new Set<string>();

  const pushRule = (rule: EvaluatedComplianceRule) => {
    const dedupeKey = `${rule.id}::${rule.areaId ?? 'GLOBAL'}`;
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    results.push(rule);
  };

  const inIMO = activeAreaIds.includes('IMO_N60');
  const inSermersooq = activeAreaIds.some((id) => id.startsWith('GREENLAND_TASIILAQ_'));
  const inIttoqqortoormiit = activeAreaIds.some((id) => id.startsWith('GREENLAND_ITTOQQORTOORMIIT_'));

  const protectedAreaIds = [
    ...getMatchingAreaIds(activeAreaIds, 'GREENLAND_PROTECTED_'),
    ...activeAreaIds.filter((id) => id === 'GREENLAND_PROTECTED'),
  ];

  const localAreaIds = getMatchingAreaIds(activeAreaIds, 'GREENLAND_LOCAL_');

  const inProtected = protectedAreaIds.length > 0;
  const inLocal = localAreaIds.length > 0;

  // =====================
  // IMO / POLAR BASELINE
  // =====================
  if (inIMO) {
    pushRule({
      id: 'EVAL_IMO_POLAR_001',
      title: 'Polar Code applicability',
      category: 'MUST',
      source: 'IMO_POLAR',
      description: 'Vessel operating within the IMO N60 Polar Area must comply with the Polar Code.',
      reference: 'SOLAS XIV / Polar Code Part I-A',
      evaluationStatus: 'ACTIVE',
      areaId: 'IMO_N60',
    });

    pushRule({
      id: 'EVAL_IMO_POLAR_002',
      title: 'Ice navigation watch',
      category: 'SHOULD',
      source: 'IMO_POLAR',
      description: 'Maintain enhanced bridge watch and conservative route evaluation in polar conditions.',
      reference: 'Polar operational practice',
      evaluationStatus: 'ACTIVE',
      areaId: 'IMO_N60',
    });
  }

  // =====================
  // TASIILAQ / EAST GREENLAND
  // =====================
  if (inSermersooq) {
    pushRule({
      id: 'EVAL_GREENLAND_TASIILAQ_BASE_001',
      title: 'Tasiilaq / East Greenland zoning proposal applies',
      category: 'SHOULD',
      source: 'GREENLAND_PROPOSAL',
      description: 'Voyage should be reviewed against the AECO / Sermersooq zoning proposal before local operation.',
      reference: 'AECO / Sermersooq zoning proposal',
      evaluationStatus: 'ACTIVE',
    });

    const closedTasiilaqZones = [
      'GREENLAND_TASIILAQ_SERMILIK',
      'GREENLAND_TASIILAQ_JOHAN_PETERSEN',
      'GREENLAND_TASIILAQ_OUTER_SERMILIK_GLACIER',
      'GREENLAND_TASIILAQ_KUUMMIUT_FJORDS',
      'GREENLAND_TASIILAQ_ISLANDS',
      'GREENLAND_TASIILAQ_QEERTARTIVAQ_NUUP',
      'GREENLAND_TASIILAQ_NANSEN_SIMILAAQ',
    ];

    closedTasiilaqZones.forEach((areaId) => {
      if (hasArea(activeAreaIds, areaId)) {
        pushRule({
          id: 'EVAL_GREENLAND_TASIILAQ_CLOSED',
          title: 'Closed area proposal',
          category: 'MUST',
          source: 'GREENLAND_PROPOSAL',
          description: 'This proposal zone is designated as closed year-round in the Sermersooq zoning framework.',
          reference: 'AECO / Sermersooq zoning proposal',
          evaluationStatus: 'ACTIVE',
          areaId,
        });
      }
    });

    const guideZones = [
      'GREENLAND_TASIILAQ_COAST_GUIDE',
      'GREENLAND_TASIILAQ_SOUTH_GUIDE',
      'GREENLAND_TASIILAQ_NUUP_TIMMIARMIUT',
    ];

    guideZones.forEach((areaId) => {
      if (hasArea(activeAreaIds, areaId)) {
        pushRule({
          id: 'EVAL_GREENLAND_TASIILAQ_GUIDE',
          title: 'Local guide / pilot recommended',
          category: 'SHOULD',
          source: 'GREENLAND_PROPOSAL',
          description:
            'Operation in this coastal zone should only be conducted with local knowledge, guide or pilot support.',
          reference: 'Sermersooq zoning proposal',
          evaluationStatus: vesselProfile.hasLocalGuide ? 'ACTIVE' : 'CONDITIONAL',
          reason: vesselProfile.hasLocalGuide
            ? 'Local guide indicated in vessel profile.'
            : 'No local guide indicated in vessel profile.',
          areaId,
        });
      }
    });

    if (hasArea(activeAreaIds, 'GREENLAND_TASIILAQ_FJORD_OPEN')) {
      pushRule({
        id: 'EVAL_GREENLAND_TASIILAQ_FJORD_OPEN',
        title: 'Open access corridor',
        category: 'CONSIDER',
        source: 'GREENLAND_PROPOSAL',
        description: 'This corridor is proposed as open access, but navigation should still remain conservative.',
        reference: 'Sermersooq zoning proposal',
        evaluationStatus: 'ACTIVE',
        areaId: 'GREENLAND_TASIILAQ_FJORD_OPEN',
      });
    }
  }

  // =====================
  // ITTOQQORTOORMIIT
  // =====================
  if (inIttoqqortoormiit) {
    pushRule({
      id: 'EVAL_GREENLAND_ITTOQQORTOORMIIT_BASE_001',
      title: 'Ittoqqortoormiit zoning proposal applies',
      category: 'SHOULD',
      source: 'GREENLAND_PROPOSAL',
      description: 'Voyage should be assessed against the Ittoqqortoormiit part of the Sermersooq zoning proposal.',
      reference: 'AECO / Sermersooq zoning proposal',
      evaluationStatus: 'ACTIVE',
    });

    if (hasArea(activeAreaIds, 'GREENLAND_ITTOQQORTOORMIIT_CLOSED')) {
      pushRule({
        id: 'EVAL_GREENLAND_ITTOQQORTOORMIIT_CLOSED',
        title: 'Kap Brewster to Kap Lesley closed area',
        category: 'MUST',
        source: 'GREENLAND_PROPOSAL',
        description: 'This area is proposed closed year-round.',
        reference: 'AECO / Sermersooq zoning proposal',
        evaluationStatus: 'ACTIVE',
        areaId: 'GREENLAND_ITTOQQORTOORMIIT_CLOSED',
      });
    }

    if (hasArea(activeAreaIds, 'GREENLAND_ITTOQQORTOORMIIT_AUGUST')) {
      const open = isOnOrAfter(currentDate, 8, 1);

      pushRule({
        id: 'EVAL_GREENLAND_ITTOQQORTOORMIIT_AUGUST',
        title: 'Seasonal opening from 1 August',
        category: 'MUST',
        source: 'GREENLAND_PROPOSAL',
        description: 'Operation in this area is only intended after 1 August and until end of tourist season.',
        reference: 'AECO / Sermersooq zoning proposal',
        evaluationStatus: open ? 'ACTIVE' : 'CONDITIONAL',
        reason: open
          ? 'Current date is within or after the seasonal opening window.'
          : 'Current date is before 1 August.',
        areaId: 'GREENLAND_ITTOQQORTOORMIIT_AUGUST',
      });
    }

    if (hasArea(activeAreaIds, 'GREENLAND_ITTOQQORTOORMIIT_SEPTEMBER')) {
      const open = isOnOrAfter(currentDate, 9, 1);

      pushRule({
        id: 'EVAL_GREENLAND_ITTOQQORTOORMIIT_SEPTEMBER',
        title: 'Seasonal opening from 1 September',
        category: 'MUST',
        source: 'GREENLAND_PROPOSAL',
        description: 'Operation in this area is only intended after 1 September and until end of tourist season.',
        reference: 'AECO / Sermersooq zoning proposal',
        evaluationStatus: open ? 'ACTIVE' : 'CONDITIONAL',
        reason: open
          ? 'Current date is within or after the seasonal opening window.'
          : 'Current date is before 1 September.',
        areaId: 'GREENLAND_ITTOQQORTOORMIIT_SEPTEMBER',
      });
    }
  }

  // =====================
  // PROTECTED AREAS
  // =====================
  if (inProtected) {
    pushRule({
      id: 'EVAL_GREENLAND_PROTECTED_BASE_001',
      title: 'Protected area environmental caution applies',
      category: 'MUST',
      source: 'GREENLAND_LOCAL',
      description:
        'Protected area operation requires conservative navigation, wildlife sensitivity and avoidance of unnecessary disturbance.',
      reference: 'Protected area operating principles',
      evaluationStatus: 'ACTIVE',
    });

    protectedAreaIds.forEach((areaId) => {
      pushRule({
        id: 'EVAL_GREENLAND_PROTECTED_AREA_ACTIVE',
        title: 'Protected area operational sensitivity',
        category: 'MUST',
        source: 'GREENLAND_LOCAL',
        description:
          'The vessel is operating within a Greenland protected area and must apply heightened environmental and operational caution.',
        reference: 'Protected area operating principles',
        evaluationStatus: 'ACTIVE',
        areaId,
      });

      pushRule({
        id: 'EVAL_GREENLAND_PROTECTED_AREA_DISTURBANCE',
        title: 'Avoid unnecessary disturbance',
        category: 'SHOULD',
        source: 'GREENLAND_LOCAL',
        description:
          'Bridge team should minimise wake, noise, route deviation and proximity-driven disturbance while inside protected areas.',
        reference: 'Protected area operating principles',
        evaluationStatus: 'ACTIVE',
        areaId,
      });

      if (operationMode === 'LANDING') {
        pushRule({
          id: 'EVAL_GREENLAND_PROTECTED_LANDING_REVIEW',
          title: 'Landing in protected area requires special review',
          category: 'MUST',
          source: 'GREENLAND_LOCAL',
          description:
            'Landing activity inside a protected area requires specific review of local restrictions, wildlife sensitivity and landing controls before execution.',
          reference: 'Protected area landing caution',
          evaluationStatus: 'ACTIVE',
          areaId,
        });

        pushRule({
          id: 'EVAL_GREENLAND_PROTECTED_LANDING_CONTROL',
          title: 'Protected area landing control measures',
          category: 'MUST',
          source: 'GREENLAND_LOCAL',
          description:
            'Landing party size, approach profile, timing and site conduct should be tightly controlled when operating inside protected areas.',
          reference: 'Protected area landing caution',
          evaluationStatus: 'ACTIVE',
          areaId,
        });
      } else if (operationMode === 'CRUISING' || operationMode === 'TRANSIT') {
        pushRule({
          id: 'EVAL_GREENLAND_PROTECTED_TRANSIT_CONSERVATIVE',
          title: 'Conservative transit profile in protected area',
          category: 'SHOULD',
          source: 'GREENLAND_LOCAL',
          description:
            'Transit or cruising inside protected areas should remain conservative with unnecessary close-in manoeuvring avoided.',
          reference: 'Protected area operating principles',
          evaluationStatus: 'ACTIVE',
          areaId,
        });
      } else if (operationMode === 'AT_ANCHOR') {
        pushRule({
          id: 'EVAL_GREENLAND_PROTECTED_ANCHOR_REVIEW',
          title: 'Anchoring in protected area requires caution',
          category: 'SHOULD',
          source: 'GREENLAND_LOCAL',
          description:
            'Anchoring or prolonged station-keeping in protected areas should be reviewed carefully against environmental sensitivity and local constraints.',
          reference: 'Protected area operating principles',
          evaluationStatus: 'ACTIVE',
          areaId,
        });
      }
    });
  }

  // =====================
  // LOCAL RESTRICTIONS
  // =====================
  if (inLocal) {
    if (hasArea(activeAreaIds, 'GREENLAND_LOCAL_ILULISSAT_ICEFJORD')) {
      pushRule({
        id: 'EVAL_GREENLAND_LOCAL_ILULISSAT_ICEFJORD',
        title: 'Ilulissat Icefjord stand-off restriction',
        category: 'MUST',
        source: 'GREENLAND_LOCAL',
        description:
          'Vessels operating near Ilulissat Icefjord must maintain conservative stand-off distance from shore and ice-affected areas due to calving and ice movement risk.',
        reference: 'Greenland local operating guidance',
        evaluationStatus: 'ACTIVE',
        areaId: 'GREENLAND_LOCAL_ILULISSAT_ICEFJORD',
      });

      if (operationMode === 'LANDING') {
        pushRule({
          id: 'EVAL_GREENLAND_LOCAL_ILULISSAT_ICEFJORD_LANDING',
          title: 'Landing operation requires additional Ilulissat review',
          category: 'MUST',
          source: 'GREENLAND_LOCAL',
          description:
            'Landing or close-in small boat activity in the Ilulissat area requires heightened local assessment and conservative controls.',
          reference: 'Local operational restriction',
          evaluationStatus: 'ACTIVE',
          areaId: 'GREENLAND_LOCAL_ILULISSAT_ICEFJORD',
        });
      }
    }

    if (hasArea(activeAreaIds, 'GREENLAND_LOCAL_ILULISSAT_HARBOUR')) {
      pushRule({
        id: 'EVAL_GREENLAND_LOCAL_ILULISSAT_HARBOUR',
        title: 'Ilulissat harbour operational restriction',
        category: 'MUST',
        source: 'GREENLAND_LOCAL',
        description:
          'Vessels operating in Ilulissat harbour area must navigate with heightened caution due to local traffic, port activity and limited manoeuvring space.',
        reference: 'Greenland local operating guidance',
        evaluationStatus: 'ACTIVE',
        areaId: 'GREENLAND_LOCAL_ILULISSAT_HARBOUR',
      });
    }

    if (hasArea(activeAreaIds, 'GREENLAND_LOCAL_TASIILAQ_APPROACH')) {
      pushRule({
        id: 'EVAL_GREENLAND_LOCAL_TASIILAQ_APPROACH',
        title: 'Tasiilaq local approach guidance',
        category: 'SHOULD',
        source: 'GREENLAND_LOCAL',
        description:
          'Vessels approaching Tasiilaq should apply enhanced local navigation caution and verify any local pilot / guide requirement before operation.',
        reference: 'Greenland local operating guidance',
        evaluationStatus: vesselProfile.hasLocalGuide ? 'ACTIVE' : 'CONDITIONAL',
        reason: vesselProfile.hasLocalGuide
          ? 'Local guide indicated in vessel profile.'
          : 'Local knowledge / guide status should be verified before operation.',
        areaId: 'GREENLAND_LOCAL_TASIILAQ_APPROACH',
      });
    }

    if (hasArea(activeAreaIds, 'GREENLAND_LOCAL_ITTOQQORTOORMIIT_APPROACH')) {
      pushRule({
        id: 'EVAL_GREENLAND_LOCAL_ITTOQQORTOORMIIT_APPROACH',
        title: 'Ittoqqortoormiit local approach guidance',
        category: 'SHOULD',
        source: 'GREENLAND_LOCAL',
        description:
          'Vessels approaching Ittoqqortoormiit should apply enhanced local caution due to remote operating conditions and local traffic/community sensitivity.',
        reference: 'Greenland local operating guidance',
        evaluationStatus: 'ACTIVE',
        areaId: 'GREENLAND_LOCAL_ITTOQQORTOORMIIT_APPROACH',
      });
    }
  }

  return results;
}