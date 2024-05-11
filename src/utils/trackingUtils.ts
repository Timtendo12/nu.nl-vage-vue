import { isAudioTarget, isJWPlayerVideoTarget, isVideoTarget, Target } from 'perfapi';

export const getTrackingItemType = (target: Target | undefined): string => {
  if (target) {
    if (isAudioTarget(target)) return 'audio';
    if (isVideoTarget(target) || isJWPlayerVideoTarget(target)) return 'video';
  }
  return 'article';
};
