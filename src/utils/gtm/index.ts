import {
  GTMLinkAttributes,
  isLargeArticleLinkFlavor,
  isMoreLinkFlavor,
  isScreenTarget,
  LinkBlock,
  SmallArticleLinkFlavor,
} from 'perfapi';
import { App, inject } from 'vue';

import { getEnvVariable } from '@/utils/config';
import { Environment, environment } from '@/utils/environment';
import { resolveTargetUrl } from '@/utils/target';

import { getTrackingItemType } from '../trackingUtils';

/******************
 *** Type exports  ***
 ******************/
export type Payload = {
  [key: string]: string | number | boolean | unknown;
};

export type GTMStartTag = {
  [key: string]: string | number | boolean | unknown;
};

export type GTMVideoPlayerTag = {
  event: string;
  video: Payload;
};

export type GTMGenericTag = {
  event: string;
  'nujij-data': Payload;
};

export type NuVoorJouDataLayerEvent = {
  category: string;
  action?: string;
  label?: string;
  event?: string;
};

export type GTMTag = GTMGenericTag | GTMStartTag | GTMVideoPlayerTag;

export interface IGtm {
  add(tag: GTMTag): void;
  containerId?: string;
}

/******************
 ****** Class  ******
 ******************/
export class Gtm implements IGtm {
  public dataLayer: GTMTag[];
  public containerId?: string;

  constructor() {
    window.dataLayer = window.dataLayer || [];
    this.dataLayer = window.dataLayer;
    this.containerId = getEnvVariable('VITE_GTM_CONTAINER');
  }

  public install(app: App): void {
    if (environment === Environment.Server) {
      throw new Error('Gtm is a client-side only module');
    }
    app.provide('Gtm', this);
  }

  /**
   * Add an event/tag to the datalayer
   * @param {GTMTag} tag - gtm formatted tag
   */
  public add(tag: GTMTag): void {
    this.dataLayer.push(tag);
  }
}

class ServerGtm implements IGtm {
  public add(): void {
    throw new Error(`Can't call Gtm add during server rendering!`);
  }
}

export const useGtm = (): IGtm => {
  if (typeof window === 'undefined') {
    return inject<IGtm>('Gtm', new ServerGtm());
  }
  return inject<IGtm>('Gtm', new Gtm());
};

export const getGtmListLinkAttributes = ({
  block,
  index,
  title,
}: {
  block: LinkBlock;
  index: number;
  title: string;
}): GTMLinkAttributes => ({
  __typename: 'GTMLinkAttributes',
  list: title,
  category: 'teaser',
  teaserType: getTrackingItemType(block.link?.target),
  itemUrl: resolveTargetUrl(block.link?.target)?.href,
  position: (index + 1).toString(),
  contentId: isScreenTarget(block.link?.target) ? block.link.target.targetId : '',
  itemLabel: (block.link?.linkFlavor as SmallArticleLinkFlavor)?.label?.text,
  teaserTitle: block.link?.title?.text,
  element: isLargeArticleLinkFlavor(block.link?.linkFlavor) ? 'headline-image' : 'list-item',
});

export const getGtmLinkAttributes = ({
  block,
  linkType,
}: {
  block: LinkBlock;
  linkType: string;
}): GTMLinkAttributes => ({
  __typename: 'GTMLinkAttributes',
  action:
    isMoreLinkFlavor(block.link?.linkFlavor) && isScreenTarget(block.link.target)
      ? `click-more_${block.link.target.targetId}`
      : 'link-click',
  category: isMoreLinkFlavor(block.link?.linkFlavor) ? 'list-block' : 'article',
  label: `${linkType}_${resolveTargetUrl(block.link?.target)}`,
});

const camelToHyphenated = (string: string) =>
  string
    .split('')
    .map((c) => (c === c.toUpperCase() ? `-${c.toLocaleLowerCase()}` : c))
    .join('');

export const createDataLinkAttributes = (linkAttributes?: GTMLinkAttributes) =>
  linkAttributes
    ? Object.entries(linkAttributes).reduce((accumulator, [key, value]) => {
        if (key === '__typename') return accumulator;
        return { ...accumulator, [`data-${camelToHyphenated(key)}`]: value };
      }, {})
    : '';
