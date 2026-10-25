export interface SocialLinksMap {
  facebook: string;
  instagram: string;
  whatsapp: string;
  github?: string;
  email?: string;
}

export interface SiteConfig {
  name: string;
  domain: string;
  email: string;
  github: string;
  socialLinks: SocialLinksMap;
}

export declare const siteConfig: SiteConfig;
export default siteConfig;
