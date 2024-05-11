import {
  ActionData,
  Block,
  BlockModification,
  BlockPage,
  Client,
  ContainerBlock,
  isBlockRemovalByGroupIdActionResponse,
  isBlockReplacementActionResponse,
  isBlockReplacementByIdActionResponse,
  isCompoundBlockModificationActionResponse,
  isContainerBlock,
  Screen,
  ScreenActions,
  ScreenEntryPoint,
  ScreenMetadataKeyValue,
  ScreenOgDataKeyValue,
  ScreenTrackers,
  TwitterCardDataKeyValue,
  Variable,
} from 'perfapi';
import { defineStore } from 'pinia';
import { inject, Ref, ref } from 'vue';
import { LocationQueryValue, RouteLocationNormalizedLoaded } from 'vue-router';

import {
  handleContainerBlocks,
  recursiveBlockRemovalByGroupId,
  recursiveBlockReplacementById,
} from '@/stores/content/contentUtils';
import { getErrorScreen } from '@/stores/content/errorScreen';
import { getScreenEntryPointBySlug } from '@/utils/screen';
import { idFromPath } from '@/utils/target';

import { useErrorStore } from '../errors';
import { useNuJijStore } from '../nujij';

export enum ContentCacheKeys {
  menus = 'BFF_MENUS',
}

export interface ExtendedContainerBlock extends ContainerBlock {
  blocks: Block[];
}

export const isExtendedContainerBlock = (block: Block): block is ExtendedContainerBlock =>
  isContainerBlock(block) && 'blocks' in block;

export const useContentStore = defineStore('content', () => {
  const bffClient = inject('bffClient') as Client;

  const blocksMain: Ref<Block[]> = ref([]);
  const blocksSidebar: Ref<Block[]> = ref([]);
  const blocksTopzone: Ref<Block[]> = ref([]);
  const httpStatusCode: Ref<number | undefined> = ref();
  const redirectUrl: Ref<string | undefined> = ref();
  const screenActions: Ref<ScreenActions | undefined> = ref();
  const screenCanonicalUrl: Ref<string | undefined> = ref();
  const screenId: Ref<string | undefined> = ref();
  const screenOgData: Ref<ScreenOgDataKeyValue[]> = ref([]);
  const screenSchemaOrg: Ref<string | undefined> = ref();
  const screenScreenMetadata: Ref<ScreenMetadataKeyValue[]> = ref([]);
  const screenTitle: Ref<string> = ref('NU.nl');
  const screenTrackers: Ref<ScreenTrackers | undefined> = ref();
  const screenTwitterCardData: Ref<TwitterCardDataKeyValue[]> = ref([]);
  const screenUpdatedAt: Ref<string | undefined> = ref();
  const screenVariables: Ref<Record<string, string>> = ref({});
  const sectionTheme: Ref<string | undefined> = ref();
  const sideLoadedBlocks: Ref<Block[]> = ref([]);

  const getScreenByEntryPoint = async (slug: string): Promise<void> => {
    const screenEntryPoint: ScreenEntryPoint | undefined = getScreenEntryPointBySlug(slug);
    const errorsStore = useErrorStore();
    if (!screenEntryPoint) {
      return Promise.reject(`unknown slug: ${slug}`);
    }
    try {
      let screen: Screen;
      try {
        screen = await bffClient.screenByEntryPoint(screenEntryPoint);
      } catch (e) {
        screen = getErrorScreen({ reason: e });
      }

      screen.schemaOrgString && setScreenSchemaOrg(screen.schemaOrgString);
      screen.screenMetadata && setScreenScreenMetadata(screen.screenMetadata);
      screen.screenOgData && setScreenOgData(screen.screenOgData);
      screen.sectionTheme && setSectionTheme(screen.sectionTheme);
      screen.title && setScreenTitle(screen.title);
      screen.trackers && setScreenTrackers(screen.trackers);
      screen.twitterCardData && setScreenTwitterCardData(screen.twitterCardData);
      screen.updatedAt && setScreenUpdatedAt(screen.updatedAt);
      setBlockParents(screen);
      setScreenId(screen.id);
    } catch (error) {
      errorsStore.handleError(error);
    }
  };

  const getScreenByPath = async ({ path, query }: RouteLocationNormalizedLoaded): Promise<void> => {
    const nujijStore = useNuJijStore();
    const errorsStore = useErrorStore();
    try {
      const url = new URL(path, 'https://www.nu.nl');
      if (query?.token) {
        const previewtoken = query?.token;
        url.searchParams.set('previewtoken', previewtoken as string);
      }
      if (query?.q) {
        const searchQuery = query.q;
        url.searchParams.set('searchQuery', searchQuery as string);
      }

      let screen: Screen;
      try {
        screen = await bffClient.screenByUrl(url.toString());
      } catch (e) {
        screen = getErrorScreen({ reason: e });
      }

      if (screen.httpResponse?.statusCode === 404) {
        screen = getErrorScreen({
          screen,
          safeReason: '404: De inhoud die je zocht is niet (of niet meer) beschikbaar.',
        });
      }

      const redirectUrl = screen.httpResponse?.redirectUrl || screen.screenCanonicalUrl;
      if (redirectUrl) {
        let parsedRedirectUrl;
        try {
          parsedRedirectUrl = new URL(redirectUrl);
        } catch (e) {
          parsedRedirectUrl = new URL(redirectUrl, 'https://www.nu.nl');
        }

        if (parsedRedirectUrl.pathname !== url.pathname && url.pathname.indexOf('preview') === -1) {
          const allowedQueryParams = ['commentId', 'commentID'];
          const filteredQueryParams = allowedQueryParams.reduce<
            Record<string, LocationQueryValue | LocationQueryValue[]>
          >((prev, curr) => {
            prev[curr] = (query || {})[curr];
            return prev;
          }, {});

          const queryString = Object.keys(filteredQueryParams)
            .filter((key) => !!filteredQueryParams[key])
            .map((key) => `${key}=${filteredQueryParams[key]}`)
            .join('&');

          setRedirectUrl(
            queryString.length > 0 ? parsedRedirectUrl.toString() + '?' + queryString : parsedRedirectUrl.toString(),
          );
          setHttpStatusCode(screen.httpResponse?.statusCode || 301);
          return;
        }
      }

      nujijStore.setScreenCommentsMetadata(screen);
      screen.actions && setScreenActions(screen.actions);
      screen.httpResponse?.statusCode && setHttpStatusCode(screen.httpResponse?.statusCode);
      screen.id && setScreenId(screen.id);
      screen.schemaOrgString && setScreenSchemaOrg(screen.schemaOrgString);
      screen.screenCanonicalUrl && setScreenCanonicalUrl(screen.screenCanonicalUrl);
      screen.screenMetadata && setScreenScreenMetadata(screen.screenMetadata);
      screen.screenOgData && setScreenOgData(screen.screenOgData);
      screen.title && setScreenTitle(screen.title);
      screen.trackers && setScreenTrackers(screen.trackers);
      screen.twitterCardData && setScreenTwitterCardData(screen.twitterCardData);
      screen.updatedAt && setScreenUpdatedAt(screen.updatedAt);
      screen.variables && setScreenVariables(screen.variables);
      setBlockParents(screen);
      screen.sectionTheme && setSectionTheme(screen.sectionTheme);
    } catch (error) {
      errorsStore.handleError(error);
    }
  };

  const setBlockParents = (screen: Screen): void => {
    sideLoadedBlocks.value = screen.firstBlockPage?.sideLoadedBlocks || [];
    const main = screen.firstBlockPage?.blocks || [];
    const sidebar = screen.firstBlockPage?.sidebarBlocks || [];
    const topZone = screen.firstBlockPage?.topzoneBlocks || [];

    blocksMain.value = handleContainerBlocks(main, sideLoadedBlocks.value);
    blocksSidebar.value = handleContainerBlocks(sidebar, sideLoadedBlocks.value);
    blocksTopzone.value = handleContainerBlocks(topZone, sideLoadedBlocks.value);
  };

  const setScreenCanonicalUrl = (url?: string): void => {
    screenCanonicalUrl.value = url;
  };

  const setRedirectUrl = (url: string): void => {
    redirectUrl.value = url;
  };

  const setScreenActions = (actions: ScreenActions): void => {
    screenActions.value = actions;
  };

  const setScreenId = (id: string): void => {
    screenId.value = id;
  };

  const setScreenTrackers = (trackers: ScreenTrackers): void => {
    screenTrackers.value = trackers;
  };

  const setScreenTitle = (title: string): void => {
    try {
      document.title = title || 'NU.nl';
    } catch (e) {
      if (!(e instanceof ReferenceError)) throw e; // document does not exist server side
    }
    screenTitle.value = title || 'NU.nl';
  };

  const setScreenScreenMetadata = (metadata: ScreenMetadataKeyValue[]): void => {
    screenScreenMetadata.value = metadata;
  };

  const setScreenOgData = (data: ScreenOgDataKeyValue[]): void => {
    screenOgData.value = data;
  };

  const setScreenTwitterCardData = (data: TwitterCardDataKeyValue[]): void => {
    screenTwitterCardData.value = data;
  };

  const setScreenSchemaOrg = (data: string): void => {
    screenSchemaOrg.value = data;
  };

  const setScreenUpdatedAt = (updatedAt: string): void => {
    screenUpdatedAt.value = updatedAt;
  };

  const setSectionTheme = (theme: string): void => {
    sectionTheme.value = theme;
  };

  const setHttpStatusCode = (code?: number): void => {
    httpStatusCode.value = code || 200;
  };

  const updateScreenVariables = (variables?: Variable[]): void => {
    if (variables) {
      variables.forEach((variable) => {
        if (variable.name) screenVariables.value[variable.name] = variable.value || '';
      });
    }
  };

  const setScreenVariables = (variables: Variable[]): void => {
    screenVariables.value = {};
    if (variables && variables.length) {
      variables.forEach((variable: Variable) => {
        if (variable.name) screenVariables.value[variable.name] = variable.value || '';
      });
    }
  };

  const getRecommendedArticles = async (path: string) => {
    try {
      let result: BlockPage;

      if (window?.getRecommendedByID) {
        result = await bffClient.recommendationsByArticleID(idFromPath(path));
      } else {
        result = await bffClient.recommendedArticles(`https://www.nu.nl/${path}`);
      }

      if (result.blocks && result.sideLoadedBlocks) {
        const blocks = handleContainerBlocks(result.blocks, result.sideLoadedBlocks);
        return blocks.find(isContainerBlock);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleAction = async (payload: {
    actionData: ActionData;
    id?: string;
    originalBlock?: Block;
  }): Promise<void> => {
    if (payload.id) {
      const result = await bffClient.handleAction(payload.actionData, payload.id);

      if (isBlockReplacementActionResponse(result) && !!result.blocks?.length) {
        replaceBlock({ originalBlock: payload.originalBlock, newBlock: result.blocks[0] });
      }
      if (isCompoundBlockModificationActionResponse(result) && !!result.modifications?.length) {
        compoundBlockModification({ modifications: result.modifications });
      }
    }
  };

  const replaceBlock = ({ originalBlock, newBlock }: { originalBlock?: Block; newBlock: Block }): void => {
    if (originalBlock) {
      const recursiveReplaceBlock = (blocks: Block[]) => {
        blocks.forEach((block, i) => {
          if (block.id === originalBlock.id) {
            blocks[i] = newBlock;
            return;
          }
          if (isContainerBlock(block)) {
            recursiveReplaceBlock((block as ExtendedContainerBlock).blocks);
          }
        });
        return blocks;
      };
      recursiveReplaceBlock(blocksMain.value);
      recursiveReplaceBlock(blocksSidebar.value);
    }
  };

  const compoundBlockModification = ({ modifications }: { modifications: Array<BlockModification> }): void => {
    modifications.forEach((modification) => {
      // match the modifications to their response
      if (isBlockRemovalByGroupIdActionResponse(modification) && modification.groupIds) {
        blocksMain.value = recursiveBlockRemovalByGroupId(blocksMain.value, modification.groupIds);
      }
      if (isBlockReplacementByIdActionResponse(modification)) {
        const newBlocks = recursiveBlockReplacementById(blocksMain.value, modification);
        blocksMain.value = newBlocks;
      }
    });
  };

  return {
    blocksMain,
    blocksSidebar,
    blocksTopzone,
    compoundBlockModification,
    getRecommendedArticles,
    getScreenByEntryPoint,
    getScreenByPath,
    handleAction,
    httpStatusCode,
    redirectUrl,
    replaceBlock,
    screenActions,
    screenCanonicalUrl,
    screenId,
    screenOgData,
    screenSchemaOrg,
    screenScreenMetadata,
    screenTitle,
    screenTrackers,
    screenTwitterCardData,
    screenUpdatedAt,
    screenVariables,
    sectionTheme,
    setBlockParents,
    setHttpStatusCode,
    setRedirectUrl,
    setScreenActions,
    setScreenCanonicalUrl,
    setScreenId,
    setScreenOgData,
    setScreenSchemaOrg,
    setScreenScreenMetadata,
    setScreenTitle,
    setScreenTrackers,
    setScreenTwitterCardData,
    setScreenUpdatedAt,
    setScreenVariables,
    setSectionTheme,
    sideLoadedBlocks,
    updateScreenVariables,
  };
});
