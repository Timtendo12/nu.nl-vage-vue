import {
  Block,
  BlockReplacementByIdActionResponse,
  ContainerBlock,
  isContainerBlock,
  isPlaceholderBlock,
} from 'perfapi';

import { Sentry } from '@/utils/sentry';

import { ExtendedContainerBlock, isExtendedContainerBlock } from '../../stores/content/index';

export const handleContainerBlocks = (blocks: Block[], sideLoadedBlocks: Block[]): Block[] =>
  blocks.filter((b) => {
    if (isContainerBlock(b)) {
      if (hasSelfReference(b) || hasSelfCircularDependency(b, sideLoadedBlocks)) {
        return false;
      }

      // Transform block B to ExtendedContainerBlock by adding blocks property
      (b as ExtendedContainerBlock).blocks = sideLoadedBlocks.filter((sideLoadedBlock) =>
        b.sideLoadedBlockIds?.includes(sideLoadedBlock.id),
      );
      return handleContainerBlocks((b as ExtendedContainerBlock).blocks, sideLoadedBlocks);
    }
    return true;
  });

/**
 * Check if there is a container block in the list with side-loaded blocks with the same id
 */
export const hasSelfReference = (block: ContainerBlock): boolean => {
  if (block.sideLoadedBlockIds?.includes(block.id)) {
    Sentry.captureException({
      message: 'An invalid block with a (side-loaded) reference to itself was found.',
      blockId: block.id,
      sideloadedBlockIds: block.sideLoadedBlockIds,
    });
    return true;
  }
  return false;
};

/**
 * Check if there is a circular dependency in the container and side loaded blocks
 */
export const hasSelfCircularDependency = (
  containerBlock: ContainerBlock,
  sideLoadedBlocks: Block[],
  visited: string[] = [],
): boolean => {
  if (visited.includes(containerBlock.id)) {
    Sentry.captureException({
      message: 'A container block with circular reference was found.',
      blockId: containerBlock.id,
      path: visited.join(' -> '),
    });
    return true;
  }

  visited.push(containerBlock.id);

  if (containerBlock.sideLoadedBlockIds) {
    return containerBlock.sideLoadedBlockIds?.some((sideLoadedBlockId) =>
      sideLoadedBlocks
        .filter(isContainerBlock)
        .filter((sideLoadedBlock) => sideLoadedBlock.id == sideLoadedBlockId)
        .some((sideLoadedContainerBlock) =>
          hasSelfCircularDependency(sideLoadedContainerBlock, sideLoadedBlocks, visited),
        ),
    );
  }
  return false;
};

export const recursiveBlockRemovalByGroupId = (blocks: Block[], groupIds: string[]): Block[] =>
  blocks.filter((block) => {
    if (isExtendedContainerBlock(block)) {
      block.blocks = recursiveBlockRemovalByGroupId(block.blocks, groupIds);
    }
    return !block.groupIds || !block.groupIds.some((id) => groupIds.includes(id));
  });

export const recursiveBlockReplacementById = (
  blocks: Block[],
  modification: BlockReplacementByIdActionResponse,
): Block[] => {
  if (modification.blocks) {
    return blocks
      .map((block) => {
        if (isPlaceholderBlock(block) && modification.blocks && block.id === modification.blockId) {
          return modification.blocks;
        } else if (isExtendedContainerBlock(block)) {
          return {
            ...block,
            blocks: recursiveBlockReplacementById(block.blocks, modification),
          };
        } else {
          return block;
        }
      })
      .flat();
  } else {
    return blocks;
  }
};
