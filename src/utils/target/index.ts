import {
  isAudioTarget,
  isJWPlayerVideoTarget,
  isScreenTarget,
  isUrlTarget,
  isVideoTarget,
  Target,
  UrlRelation,
} from 'perfapi';

export const resolveTargetUrl = (target: Target | undefined): URL | undefined => {
  if (!target) return undefined;

  let url: string | undefined;
  if (isUrlTarget(target) || isScreenTarget(target)) {
    url = target.url;
  }
  if (isVideoTarget(target) || isJWPlayerVideoTarget(target) || isAudioTarget(target)) {
    url = target.shareUrl;
  }

  return url ? new URL(url) : undefined;
};

const relMapper = (relation: UrlRelation): string =>
  ({
    [UrlRelation.Nofollow]: 'nofollow',
    [UrlRelation.Noopener]: 'noopener',
    [UrlRelation.Noreferrer]: 'noreferrer',
  })[relation];

export const resolveTargetRel = (target: Target) => {
  if (isUrlTarget(target)) {
    const rels = target.relation?.map(relMapper) || [];
    if (!isNunlDomain(target.url)) {
      rels.push('sponsored');
    }
    return rels.length ? rels.join(' ') : undefined;
  }
};

export const isNunlDomain = (url: string) => {
  const regex = new RegExp('https?://(www.|www.test.|www.staging.)?(?=nu.nl)', 'i');
  return regex.test(url);
};

export const idFromPath = (path: string): string => /\/(\d+)\//.exec(path)?.[1] || '';
