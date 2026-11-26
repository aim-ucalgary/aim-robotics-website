// Shared TypeScript definitions for all YAML-driven content.
// Keep these in sync with the structure of the files in /content.

export interface SiteContent {
  name: string;
  fullName: string;
  acronymExpansion: string;
  motto: string;
  university: string;
  location: string;
  locationShort: string;
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
}

export interface NavigationContent {
  brand: string;
  links: NavLink[];
  menuOpenLabel: string;
  menuCloseLabel: string;
}

export interface HeroContent {
  eyebrow: string;
  headingLines: string[];
  subheading: string;
  tags: string[];
  scrollLabel: string;
  scrollText: string;
  mediaAlt: string;
}

export interface Goal {
  number: string;
  title: string;
  description: string;
}

export interface AboutContent {
  sectionLabel: string;
  heading: string;
  mission: string;
  goals: Goal[];
}

export interface Domain {
  id: string;
  title: string;
  description: string;
  tag: string;
}

export interface Trait {
  id: string;
  title: string;
  description: string;
  relatedDomains: string[];
}

export interface CtaLink {
  label: string;
  href: string;
}

export interface WhatWeDoContent {
  sectionLabel: string;
  heading: string;
  domains: Domain[];
  joinSectionLabel: string;
  joinHeading: string;
  joinIntro: string;
  traits: Trait[];
  joinCta: CtaLink;
}

export interface EngineeringProject {
  id: string;
  number: string;
  tag: string;
  title: string;
  description: string;
  mediaLabel: string;
  mediaImage?: string;
  mediaFit?: "cover" | "contain";
  mediaSource?: {
    label: string;
    href: string;
  };
}

export interface EngineeringContent {
  sectionLabel: string;
  heading: string;
  roboCupLabel: string;
  roboCupIntro: string;
  roboCupDetail: string;
  pipeline: string[];
  projects: EngineeringProject[];
}

export interface ResearchTopic {
  id: string;
  title: string;
  image?: string;
  imageAlt?: string;
  /** Optional short category shown in the caption, e.g. "MECHANICAL" → "FIG. 01 · MECHANICAL". */
  tag?: string;
  /** Optional link. "https://…" opens in a new tab; "/…" stays on the AIM site. */
  href?: string;
}

export interface ResearchContent {
  sectionLabel: string;
  heading: string;
  intro: string;
  topics: ResearchTopic[];
}

export interface SubTeam {
  id: string;
  title: string;
  description: string;
  tag: string;
}

export interface TeamsContent {
  sectionLabel: string;
  heading: string;
  intro: string;
  subteams: SubTeam[];
  centerLabel: string;
}

//Sponsor
export interface SponsorObjective {
  id: string;
  tag: string;
  title: string;
  description: string;
}

export interface Sponsor {
  name: string;
  logo: string;
  /** Fill the tile edge to edge, for logos that include their own margin or background. */
  fullBleed?: boolean;
}

export interface SponsorTier {
  id: string;
  name: string;
  price: string;
  description: string;
  sponsors?: Sponsor[];
}

export interface SponsorBenefit {
  label: string;
  tiers: string[];
}

export interface BudgetItem {
  label: string;
  percent: number;
}

export interface SponsorsContent {
  sectionLabel: string;
  heading: string;
  intro: string;
  primaryCta: CtaLink;
  packageCta: CtaLink;
  supportText: string;
  objectivesLabel: string;
  objectives: SponsorObjective[];
  tiersLabel: string;
  tiers: SponsorTier[];
  benefitsLabel: string;
  benefitsHeading: string;
  benefitColumns: string[];
  benefits: SponsorBenefit[];
  budgetLabel: string;
  budgetTotal: string;
  budgetTotalLabel: string;
  budget: BudgetItem[];
  inKindHeading: string;
  inKindText: string;
}
//Sponsor

export interface ContactChannel {
  id: string;
  label: string;
  value: string;
  href: string;
}

export interface ContactContent {
  sectionLabel: string;
  heading: string;
  intro: string;
  channels: ContactChannel[];
  affiliation: string;
}

export interface SocialLink {
  id: string;
  label: string;
  href: string;
}

export interface FooterContent {
  brand: string;
  acronymExpansion: string;
  university: string;
  location: string;
  socialLinks: SocialLink[];
  motto: string;
  copyrightHolder: string;
  startYear: number;
}
