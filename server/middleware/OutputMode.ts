/* More modes can be added by simply defining an enum member */
export enum OutputMode {
  /* Default behaviour */
  DEFAULT = 'default',
  /* Fallback mode disables a lot of components in case of emergencies (e.g. personalisation/cookies, external dependencies) */
  FALLBACK = 'fallback',
}
