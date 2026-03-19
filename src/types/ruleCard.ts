// RuleCard v1.0 TypeScript Schema
// Maritime compliance rule representation for NAVIGEN

export type RuleStatus = 'Draft' | 'Active' | 'Deprecated';
export type RuleSeverity = 'MUST' | 'SHOULD' | 'CONSIDER';
export type AreaCondition = 'INSIDE' | 'OUTSIDE' | 'INTERSECTS';
export type ActionType = 'CHECK' | 'PROCEDURE' | 'LIMIT' | 'NOTE';
export type Audience = 'BRIDGE' | 'MASTER' | 'SAFETY' | 'EXPEDITION' | 'GUEST';
export type Regime = 'IMO' | 'Flag' | 'Class' | 'Company' | 'National';

export interface RuleAuthority {
  regime: Regime;
  instrument: string;
  reference: string;
}

export interface RuleArea {
  areaId: string;
  condition: AreaCondition;
}

export interface RuleVessel {
  type: string[];
  iceClass: string[];
  flag: string[];
}

export interface RuleTime {
  start: string | null;
  end: string | null;
  season: string | null;
}

export interface RuleApplicability {
  areas: RuleArea[];
  vessel: RuleVessel;
  time: RuleTime;
}

export interface RuleAction {
  text: string;
  type: ActionType;
}

export interface RuleContent {
  rationale: string;
  actions: RuleAction[];
  exceptions: string[];
  links: string[];
  fullText?: string;  // Full regulatory text from IMO/MARPOL/SOLAS
  procedures?: string[];  // Detailed procedures
  complianceChecklist?: string[];  // Checklist items
  documentation?: string[];  // Required documents
}

export interface RuleOps {
  audience: Audience[];
  module: string;
  tags: string[];
}

export interface RuleUI {
  title: string;
  compact: boolean;
  suppressible: boolean;
  priority: number;
}

export interface RuleMetadata {
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RuleCard {
  id: string;
  version: string;
  status: RuleStatus;
  severity: RuleSeverity;
  statement: string;
  authority: RuleAuthority;
  applicability: RuleApplicability;
  content: RuleContent;
  ops: RuleOps;
  ui: RuleUI;
  metadata: RuleMetadata;
}