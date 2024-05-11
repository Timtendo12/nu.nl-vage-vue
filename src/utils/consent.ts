export const consentHasPersonalisation = (dpgConsentString: string | undefined) =>
  String(dpgConsentString).includes('personalisation');
