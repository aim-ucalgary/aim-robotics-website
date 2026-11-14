// Loads and type-checks the static YAML content bundled at build time.
import { load } from "js-yaml";

import siteRaw from "../../content/site.yaml?raw";
import navigationRaw from "../../content/navigation.yaml?raw";
import heroRaw from "../../content/hero.yaml?raw";
import aboutRaw from "../../content/about.yaml?raw";
import whatWeDoRaw from "../../content/what-we-do.yaml?raw";
import engineeringRaw from "../../content/engineering.yaml?raw";
import researchRaw from "../../content/research.yaml?raw";
import teamsRaw from "../../content/teams.yaml?raw";
import membersRaw from "../../content/members.yaml?raw";
import sponsorsRaw from "../../content/sponsors.yaml?raw";
import contactRaw from "../../content/contact.yaml?raw";
import footerRaw from "../../content/footer.yaml?raw";

import type {
  SiteContent,
  NavigationContent,
  HeroContent,
  AboutContent,
  WhatWeDoContent,
  EngineeringContent,
  ResearchContent,
  TeamsContent,
  MembersContent,
  SponsorsContent,
  ContactContent,
  FooterContent,
} from "./types";

export const site = load(siteRaw) as SiteContent;
export const navigation = load(navigationRaw) as NavigationContent;
export const hero = load(heroRaw) as HeroContent;
export const about = load(aboutRaw) as AboutContent;
export const whatWeDo = load(whatWeDoRaw) as WhatWeDoContent;
export const engineering = load(engineeringRaw) as EngineeringContent;
export const research = load(researchRaw) as ResearchContent;
export const teams = load(teamsRaw) as TeamsContent;
export const members = load(membersRaw) as MembersContent;
export const sponsors = load(sponsorsRaw) as SponsorsContent;
export const contact =load(contactRaw) as ContactContent;
export const footer = load(footerRaw) as FooterContent;
