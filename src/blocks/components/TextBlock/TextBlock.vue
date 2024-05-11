<template>
  <component :is="component.tag" v-if="textType === TextType.Plain && block.styledText?.text" :class="cssClass">
    <LottieIcon v-if="isLottieAnimation(prefixIcon)" :animation="prefixIcon" height="32px" width="32px" />
    {{ block.styledText?.text }}
    <LottieIcon v-if="isLottieAnimation(suffixIcon)" :animation="suffixIcon" height="32px" width="32px" />
  </component>
  <div v-else-if="textType === TextType.RestrictedHtml" :class="cssClass" v-html="block.styledText?.text" />
</template>

<script setup lang="ts">
import { isIconTextFlavor, isLottieAnimation, TextBlock, TextRole, TextType } from 'perfapi';
import { computed } from 'vue';

import LottieIcon from '@/components/icons/LottieIcon.vue';

type TextHtml = {
  tag: string;
  className?: string;
  props?: { [key: string]: string };
};

const props = defineProps<{
  block: TextBlock;
}>();

const iconTextFlavor = computed(() => (isIconTextFlavor(props.block.textFlavor) ? props.block.textFlavor : undefined));
const prefixIcon = computed(() => iconTextFlavor.value?.prefixIcon || undefined);
const suffixIcon = computed(() => iconTextFlavor.value?.suffixIcon || undefined);

const rolesMap: { [key: string]: TextHtml } = {
  default: { tag: 'span' },
  [TextRole.ArticleBody]: { tag: 'p', className: 'paragraph' },
  [TextRole.ArticleExcerpt]: { tag: 'p', className: 'paragraph paragraph--lead' },
  [TextRole.ArticleAuthor]: { tag: 'address', className: 'author' },
  [TextRole.ArticleQuoteBody]: { tag: 'blockquote', className: 'quote' },
  [TextRole.ArticleQuoteAuthor]: { tag: 'span', className: 'quote__author' },
  [TextRole.ArticleHeader]: { tag: 'h2', className: 'heading' },
  [TextRole.ArticleSubheader]: { tag: 'h2', className: 'heading' },
  [TextRole.ArticleSummaryTitle]: { tag: 'h2', className: 'heading heading--contextualblock' },
  [TextRole.ArticleTagTitle]: { tag: 'h2', className: 'heading--tags' },
  [TextRole.ArticleSummaryItem]: { tag: 'div', className: 'summary__body' },
  [TextRole.LiveblogHeader]: { tag: 'h2', className: 'heading heading--liveblog' },
  [TextRole.LiveblogTimestamp]: { tag: 'h3', className: 'timestamp' },
  [TextRole.LiveblogTimestampNew]: { tag: 'h3', className: 'timestamp timestamp--unread' },
  [TextRole.LiveblogLastseen]: { tag: 'div', className: 'separator separator--grey' },
};

const component = computed(() => (props.block.textRole && rolesMap[props.block.textRole]) ?? rolesMap.default);
const textType = computed(() => props.block.styledText?.textType || TextType.Plain);
const cssClass = component.value.className ? `textblock ${component.value.className}` : undefined;
</script>

<style lang="postcss">
.textblock {
  margin: 0;

  p {
    margin: 0;
  }

  a {
    color: var(--brand-color);
    text-decoration: underline;

    &:hover,
    &:active {
      color: var(--brand-color-hover);
    }

    &:visited {
      color: var(--color-grey-five);
    }
  }

  ul,
  ol {
    margin: 0;

    li {
      &::before,
      &::marker {
        color: var(--brand-color);
      }
    }
  }

  ul {
    li {
      list-style-type: disc;
    }
  }

  ul,
  ol,
  p,
  h1,
  h2,
  h3 {
    &:nth-child(n + 2) {
      margin-top: var(--grid-base--x4);
    }
  }

  &.timestamp {
    position: relative;
    padding-left: 1.5em;
    color: var(--color-caption-one);

    &::first-letter {
      text-transform: capitalize;
    }

    &::before {
      position: absolute;
      top: 50%;
      left: 0;
      font-size: 2em;
      content: '\2022'; /* Bullet symbol */
      transform: translateY(-50%);
    }

    &--unread {
      color: var(--color-label-one);
    }
  }

  &.paragraph,
  &.summary__body {
    font-size: var(--font-size-body--s1);
    line-height: var(--line-height-body--s1);

    &--lead {
      font-weight: var(--font-weight-semi-bold);
    }
  }

  &.summary__body {
    h1,
    h2,
    h3 {
      color: var(--brand-color);
    }

    h3 {
      font-size: var(--font-size-article-sub-sub-heading);
    }

    ul,
    ol {
      padding-left: var(--grid-base--x4);

      * + * {
        margin-top: var(--grid-base--x3);
      }
    }
  }

  &.heading {
    font-size: var(--font-size-article-sub-heading);
    font-weight: var(--font-weight-semi-bold);
    line-height: var(--line-height-article-sub-heading);
    color: var(--brand-color);

    &--contextualblock {
      padding: 0;
      margin: 0 0 var(--grid-base--x4) 0;

      &:not(:first-of-type) {
        color: var(--color-body-base);
      }
    }

    &--liveblog {
      display: flex;
      align-items: center;
      font-size: var(--font-size-heading--s2);
      font-weight: var(--font-weight-bold);
      line-height: var(--line-height-body--s1);
      color: var(--color-red-two);
    }

    &--tags {
      display: block;
      padding: 0;
      margin: 0;
      font-size: var(--font-size-body--s0);
      font-weight: var(--font-weight-semi-bold);
      line-height: var(--line-height-body--s0);
      color: var(--brand-color);
    }
  }

  &.author {
    font-size: var(--font-size-body--s0);
    font-style: normal;
    line-height: var(--line-height-body--s0);
    text-decoration: none;
  }

  &.quote,
  &.quote__author {
    text-align: center;
  }

  &.quote {
    font-size: var(--font-size-blockquote);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-height-blockquote);

    &::before {
      content: '“';
    }

    &::after {
      content: '”';
    }

    &__author {
      display: block;
      font-size: var(--font-size-body--s1);
      line-height: var(--line-height-body--s1);
    }
  }
}

.separator {
  padding: var(--grid-base--x2);
  text-align: center;

  &--grey {
    color: var(--color-grey-six);
    background-color: var(--color-grey-one);
  }
}

[data-theme='dark'] {
  .textblock.heading--liveblog {
    color: var(--color-white);
  }

  .separator--grey {
    background-color: var(--color-darkgrey-one);
  }
}
</style>
