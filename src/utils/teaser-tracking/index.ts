import { GTMLinkAttributes, isScreenTarget, Target } from 'perfapi';
import { inject } from 'vue';

import { getTrackingItemType } from '../trackingUtils';

export type TeaserImpression = {
  position: string;
  list: string;
  type?: string;
  contentId?: string;
};

export interface ITeaserImpressionTracking {
  add(link?: GTMLinkAttributes, target?: Target): void;
}

export class TeaserImpressionTracking implements ITeaserImpressionTracking {
  public teaserInViewList: TeaserImpression[];

  constructor() {
    window.teaserInViewList = window.teaserInViewList || [];
    this.teaserInViewList = window.teaserInViewList;
  }

  public add(link?: GTMLinkAttributes, target?: Target): void {
    if (link) {
      this.teaserInViewList.push({
        position: link.position,
        list: link.list,
        type: getTrackingItemType(target),
        contentId: isScreenTarget(target) ? target.targetId : '',
      } as TeaserImpression);
    }
  }
}

class ServerTeaserImpressionTracking implements ITeaserImpressionTracking {
  public add(): void {
    throw new Error(`Can't call Teaser impressions add during server rendering!`);
  }
}

export const useTeaserImpressionTracking = (): ITeaserImpressionTracking => {
  if (typeof window === 'undefined') {
    return inject<ITeaserImpressionTracking>('TeaserTracking', new ServerTeaserImpressionTracking());
  }
  return inject<ITeaserImpressionTracking>('TeaserTracking', new TeaserImpressionTracking());
};
