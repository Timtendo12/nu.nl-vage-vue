import { ScreenEntryPoint } from 'perfapi';

// Current font-end is operating slugs which are dutch words
// so it can be part of easy to remember url while Performance API
// is using english words for screen names. So for now we are using mapping
// from slug to screen name and back.
const screens = [
  { screen: ScreenEntryPoint.Frontpage, slug: 'voorpagina' },
  { screen: ScreenEntryPoint.Traffic, slug: 'verkeer' },
  { screen: ScreenEntryPoint.Trains, slug: 'trein' },
  { screen: ScreenEntryPoint.Gasprices, slug: 'brandstof' },
  { screen: ScreenEntryPoint.Weather, slug: 'weer' },
];

const screenToSlug: Map<ScreenEntryPoint, string> = new Map(screens.map((x) => [x.screen, x.slug]));

const slugToScreen: Map<string, ScreenEntryPoint> = new Map(screens.map((x) => [x.slug, x.screen]));

// Returns screen name enum value for a given slug
export const getScreenEntryPointBySlug = (slug: string): ScreenEntryPoint | undefined => slugToScreen.get(slug);

// Returns slug for a give screen name
export const getSlugByScreenEntryPoint = (screenEntryPoint: ScreenEntryPoint): string | undefined =>
  screenToSlug.get(screenEntryPoint);
