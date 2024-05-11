<template>
  <div class="jw-player" :class="classList">
    <VideoPreview
      v-if="showPreview"
      :title="title"
      :image-url="previewImageUrl"
      :image-alt="previewImageAlt"
      :duration="formattedDuration"
      :is-vertical="isVertical"
      :video-id="mediaId"
      @click="hidePreview"
    />
    <div v-else :id="mediaId" class="player">
      <AppImage v-if="previewImageUrl" class="player__preview-image" :url="previewImageUrl" :alt="previewImageAlt" />
    </div>
  </div>
  <ErrorBlock v-if="jwReady === false">
    De video speler is incorrect geladen. Dit kan een gevolg zijn van uw browser instellingen of eventuele plugins en
    extensies. Mocht dit probleem zich blijven voordoen verwijzen we u graag naar
    <a href="/klachten.html">klachten en feedback</a>.
  </ErrorBlock>
</template>

<script setup lang="ts" scoped>
import Cookies from 'js-cookie';
import { StyledText } from 'perfapi';
import { computed, inject, onMounted, ref, toRefs } from 'vue';
import { useHybridScripts } from 'vue3-hybrid-scripts';

import ErrorBlock from '@/blocks/components/ErrorBlock.vue';
import { formatDuration } from '@/blocks/utils';
import AppImage from '@/components/AppImage.vue';
import {
  JWAdErrorParam,
  JWAdSchedule,
  JWPlayerSetup,
  JWPlayerStatic,
  JWPlaylistItemParam,
  JWPlayParam,
  JWTimeParam,
} from '@/components/JWVideoPlayer';
import VideoPreview from '@/components/Video/VideoPreview.vue';
import { getEnvVariable } from '@/utils/config';
import { isInAppViewKey } from '@/utils/environment';
import { GTMTag, useGtm } from '@/utils/gtm';

declare const jwplayer: JWPlayerStatic;

type AnaliticsEventParams = {
  [key: string]: string | number | boolean;
};

const jwReady = ref<boolean | undefined>();
const props = withDefaults(
  defineProps<{
    adSectionName?: string;
    disableAds: boolean;
    duration?: number;
    isLivestream: boolean;
    mediaId?: string;
    playlist?: string;
    previewImageAlt?: string;
    previewImageUrl?: string;
    title?: StyledText;
    isInline: boolean;
    isVertical: boolean;
  }>(),
  {
    adSectionName: undefined,
    disableAds: false,
    duration: undefined,
    mediaId: undefined,
    playlist: undefined,
    previewImageAlt: undefined,
    previewImageUrl: undefined,
    title: () => ({}) as StyledText,
  },
);

const { disableAds, duration, isLivestream, mediaId, playlist, previewImageAlt, previewImageUrl, title } =
  toRefs(props);
const pubdate = ref<Date | undefined>(undefined);
const description = ref<string | undefined>(undefined);
const showPreview = ref(props.isInline);

let extra: AnaliticsEventParams = {};
let isFirstVideo = true;
const formattedDuration = ref(formatDuration(props.duration));
const classList = computed(() => (props.isInline ? ['jw-player--inline'] : []));
const gtm = useGtm();
const isInAppView = inject(isInAppViewKey, false);

onMounted(() => {
  if (!props.isInline) {
    setupPlayer();
  }
});

const hidePreview = () => {
  showPreview.value = false;
  setupPlayer();
};

const loadPlayer = (callback: () => void) => {
  const libraryURL = getEnvVariable('VITE_JWPLAYER_SCRIPT_URL');
  if (!libraryURL) {
    return;
  }
  useHybridScripts([libraryURL], () => callback());
};

const setupPlayer = () => {
  const createTag = (params: AnaliticsEventParams): GTMTag => ({
    event: 'player',
    id: mediaId.value,
    title: title.value?.text,
    ...extra,
    ...params,
  });

  const addSimpleTag = (playerEventAction: string, params?: AnaliticsEventParams) => {
    gtm.add(createTag({ playerEventAction, ...params }));
  };

  // Guards to report event once since JWPlayer can send
  // some events severlal times
  let reportedAt: number | null = null;
  let addStarted = false;
  let isProductionStartReported = false;
  let isItemStartReported = false;

  /**
   * This function will be called every time player is going to play a new video
   * it could be first video or video selected from related list within the player
   * @param: event: JWPlaylistItemParam
   * @returns: void
   **/
  const onPlaylistItem = (event: JWPlaylistItemParam): void => {
    // it should identify that a new item is loaded
    if (event.item.mediaid !== undefined && event.item.mediaid !== mediaId.value) {
      mediaId.value = event.item.mediaid;
      title.value.text = event.item.title;

      // also resetting guards
      reportedAt = null;
      addStarted = false;
      isProductionStartReported = false;
      isItemStartReported = false;
      isFirstVideo = false;
    }
    pubdate.value = new Date(event.item.pubdate * 1000);
    description.value = event.item.description;

    const isPartOfFeed = event.item.feedData.kind === 'FEED';
    // Converting date to string in format: 2019-10-21 11:14:41
    const pubDateString = pubdate.value.toJSON().replace('T', ' ').slice(0, 19);

    extra = {
      channelId: isPartOfFeed ? event.item.feedData.feedid : '',
      channelTitle: isPartOfFeed ? event.item.feedData.title : '',
      productionId: event.item.mediaid,
      productionTitle: event.item.title,
      productionDuration: event.item.duration,
      productionPublicationDate: pubDateString,
      productionOrigin: '', // video origin, for example if provided by external organisation
      productionTheme: '', // [theme value] // indien aanwezigrelevant
      theme: '', // [thema van video] // bijv News
      playerName: 'JW player',
      isPlaylist: !isFirstVideo, // if user play anoter video from the same page we report it from playlist
      liveBroadcast: isLivestream.value,
      audio: jwplayer().getVolume() !== 0,
      audioLevel: jwplayer().getVolume(), // volume van audio (0 = uit, 100 = maximaal)
      isMuted: jwplayer().getMute(),
      quality: jwplayer().getQualityLevels()[jwplayer().getCurrentQuality()]?.label,
      viewingMode: 'default', // indien er meerdere viewing modes zijn
      visible: !!jwplayer().getViewable(), // visible: [true/false] // is video ook in beeld bij laden?
      isInAppView, // [true/false] //alleen true bij app, op web dus false
      platform: 'nu.nl',
      isIframe: jwplayer().getEnvironment().Features.iframe,
    };
  };

  const onTime = (event: JWTimeParam): void => {
    const duration = event.duration;
    const position = event.position;
    if (duration !== Infinity) {
      const percentageWatched = Math.floor((position / duration) * 10);
      if (reportedAt === null) {
        addSimpleTag('progress', { playThrough: 0 });
        reportedAt = 0;
      } else if (percentageWatched > reportedAt) {
        addSimpleTag('progress', {
          playThrough: percentageWatched * 10,
        });
        reportedAt++;
      }
    }
  };

  const reportItemStartOnce = () => {
    if (!isItemStartReported) {
      addSimpleTag('itemstarted');
      isItemStartReported = true;
    }
  };

  const onPlay = (event: JWPlayParam): void => {
    if (isProductionStartReported) {
      return;
    }
    extra.startingMethod = event.playReason;
    reportItemStartOnce();
    if (event.playReason === 'interaction') {
      addSimpleTag('itemplay');
    }
    addSimpleTag('productionstarted');
    isProductionStartReported = true;
  };

  const onAdError = (event: JWAdErrorParam): void => {
    // Expected errors which can be caused by not filled bid:
    // https://developer.jwplayer.com/jwplayer/docs/jw8-ad-errors-reference
    const expectedErrors = [10101, 10303, 11000, 20101, 20303, 21009, 60001, 60005];
    if (!expectedErrors.includes(event.adErrorCode)) {
      gtm.add(createTag({ action: 'adError' }));
    }
  };

  const onAdStarted = (): void => {
    reportItemStartOnce();
    if (!addStarted) {
      addSimpleTag('advertstarted');
      addStarted = true;
    }
  };

  const processAdvertisingSchedule = (schedules: JWAdSchedule[]): JWAdSchedule[] =>
    schedules.map((schedule) => ({
      ...schedule,
      tag: schedule.tag?.map((tag) => {
        const suppliers: { [key: string]: Record<string, string> } = {
          ziggo: { ang_cntp: 'ZiggoSport', source: 'nu.web/ziggosport' },
          viaplay: { ang_cntp: 'NENT', source: 'nu.web/nent' },
          formule1: { ang_cntp: 'NENT', source: 'nu.web/nent' },
          default: { ang_cntp: 'DPG', source: 'nu.web' },
        };
        const supplier = suppliers[String(props.adSectionName)] ?? suppliers.default;
        return tag
          .replace('__item-duration__', String(duration.value))
          .replace('__item-mediaid__', mediaId.value || '')
          .replace('__fwd_adsenabled__', String(disableAds.value ? 0 : 1))
          .replace('__fwd_contenttype__', isLivestream.value ? 'livestream' : 'vod')
          .replace('__gdpr_consent__', window._privacy?.consentString || Cookies.get('CookieConsent') || '')
          .replace('__page-url__', window.location.href)
          .replace('__random-number__', Math.random().toString())
          .replace('__source__', supplier.source)
          .replace('__ang_cntp__', supplier.ang_cntp);
      }),
    }));

  const processDefaultSettings = (settings: JWPlayerSetup): JWPlayerSetup => {
    const config = JSON.parse(JSON.stringify(settings)) as JWPlayerSetup;
    const dpgConsentString = Cookies.get('dpg-consent-string');

    config.mediaId = mediaId.value;
    config.doNotTrackCookies = !dpgConsentString?.includes('marketing');

    if (config.related) {
      config.related.onclick = 'link';
      config.related.file = '/rss/videopages/nieuwsvideos.rss';
    }

    if (config.advertising?.schedule) {
      config.advertising.schedule = processAdvertisingSchedule(config.advertising.schedule);
    }

    return config;
  };

  loadPlayer(() => {
    if (!props.mediaId) {
      return;
    }
    const expandedSettings = processDefaultSettings(window.jwDefaults || {});
    const player = window.jwplayer(props.mediaId);
    if (typeof player.setup !== 'function') {
      jwReady.value = false;
      return;
    }
    jwReady.value = true;
    player
      .setup({
        ...expandedSettings,
        playlist: playlist?.value || '',
        nextUpDisplay: false,
        autostart: 'viewable',
      })
      // Handle video events
      .on('play', onPlay)
      .on('complete', () => addSimpleTag('itemended'))
      .on('pause', () => addSimpleTag('itempause'))
      .on('time', onTime)
      .on('playlistItem', onPlaylistItem)
      // Handle advertisement events
      .on('adError', onAdError)
      .on('adClick', () => addSimpleTag('clickout'))
      .on('adStarted', onAdStarted)
      .on('adTime', onAdStarted) // since the started event sometimes doesn't appear, this is a workaround
      .on('adSkipped', () => addSimpleTag('adSkipped'))
      .on('adComplete', () => addSimpleTag('adend'));
  });
};
</script>

<style lang="postcss">
.player {
  width: 100%;
  background-color: black;

  &::before {
    display: block;
    float: left;
    width: 1px;
    padding: 0 0 var(--ratio-16-9);
    margin: 0 0 0 -1px;
    content: '';
  }

  &::after {
    display: block;
    content: '';
  }

  &__preview-image {
    display: block;
    width: 100%;
  }
}

.jw-player {
  position: relative;
  width: 100%;
  background-color: black;

  &::before {
    display: block;
    float: left;
    width: 1px;
    padding: 0 0 var(--ratio-16-9);
    margin: 0 0 0 -1px;
    content: '';
  }

  &::after {
    display: block;
    content: '';
  }
}

@media (--two-columns-fit) {
  .jw-player {
    &--inline {
      border-radius: var(--border-radius);

      .jwplayer,
      .player,
      .player__preview-image {
        border-radius: var(--border-radius);
      }
    }
  }
}
</style>
