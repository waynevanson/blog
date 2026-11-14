import { reader } from './cms';

export interface SocialLink {
  label: string;
  url: string;
}

export interface Home {
  heading: string;
  intro: string;
  socials: SocialLink[];
}

const fallback: Home = {
  heading: 'Wayne Van Son',
  intro: '',
  socials: [],
};

export async function getHome(): Promise<Home> {
  const home = await reader.singletons.home.read();

  if (!home) {
    return fallback;
  }

  return {
    heading: home.heading || fallback.heading,
    intro: home.intro ?? '',
    socials: home.socials.filter((social) => social.label && social.url),
  };
}
