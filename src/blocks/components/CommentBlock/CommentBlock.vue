<template>
  <div class="comment-block">
    <div class="comment-block__header">
      <div class="username">
        {{ usernameText }}
      </div>
      <span v-if="usernameLabel" class="username__label">{{ usernameLabel }}</span>
      <div class="when">
        {{ whenText }}
      </div>
    </div>
    <div
      ref="commentBody"
      class="comment-block__body"
      :class="{
        'comment-block__body--truncated': isTruncated,
        'comment-block__body--short': !isLongComment,
      }"
    >
      {{ bodyText }}
    </div>
    <app-button
      v-if="isTruncated && isLongComment"
      button-type="inline"
      class="comment-block__readmore"
      @click="expandComment"
      >Toon meer <AppIcon embed embed-alt="neerwaarts-caret-icoon" width="16" height="16"> <IconCaretDown /> </AppIcon
    ></app-button>
    <div class="comment-block__footer">
      <div class="left">
        <a
          href="#nujij"
          class="likes"
          data-category="nujij"
          data-action="click"
          data-label="respect_highlight-block"
          @click="handleCommentClicked"
        >
          {{ likesText }}
        </a>
        <a
          href="#nujij"
          class="replies"
          data-category="nujij"
          data-action="click"
          data-label="reactions_highlight-block"
          @click="handleCommentClicked"
        >
          {{ repliesText }}
        </a>
      </div>
      <div>
        <a
          href="#nujij"
          class="reaction-button"
          data-category="nujij"
          data-action="click"
          data-label="respond_highlight-block"
          @click="handleCommentClicked"
        >
          Reageer
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CommentBlock, isUrlTarget } from 'perfapi';
import type { Ref } from 'vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import AppButton from '@/components/AppButton.vue';
import AppIcon from '@/components/AppIcon.vue';
import IconCaretDown from '@/components/icons/IconCaretDown.vue';

const props = defineProps<{
  block: CommentBlock;
}>();

const commentBody: Ref<HTMLDivElement | null> = ref(null);
const isLongComment = computed(
  () => commentBody.value && commentBody.value.scrollHeight > commentBody.value.clientHeight,
);
const isTruncated = ref(true);

const usernameText = computed(() => props.block.username?.text);
const bodyText = computed(() => props.block.commentText?.text);
const repliesText = computed(() => props.block.repliesText?.text);
const likesText = computed(() => props.block.likesText?.text);
const whenText = computed(() => props.block.dateLabel?.text);
const usernameLabel = computed(() => props.block.usernameLabel?.text?.text);

const router = useRouter();
const handleCommentClicked = () => {
  if (isUrlTarget(props.block.target) && props.block.target.url.indexOf('?commentId=') !== -1) {
    const commentId = props.block.target.url.split('?commentId=')[1];
    router.replace({ path: router.currentRoute.value.path, query: { commentId } });
  }
};

const expandComment = () => {
  isTruncated.value = false;
};
</script>

<style lang="postcss">
.comment-block {
  padding: var(--grid-base--x4);
  margin: 0;
  overflow: hidden;
  border: 2px solid var(--color-border--z0);
  border-radius: var(--border-radius);

  &__header {
    display: flex;
    flex-wrap: wrap;
    gap: var(--grid-base);
    align-items: flex-end;
    padding-bottom: var(--grid-base--x4);

    & .username {
      margin-right: var(--grid-base--x4);
      font-weight: 800;
      color: var(--color-nu);

      &__label {
        padding: 2px var(--grid-base--x2);
        margin-right: var(--grid-base--x4);
        font-size: 0.75rem;
        color: white;
        background-color: var(--color-nu);
        border-radius: var(--border-radius--double);
      }

      &__label::after {
        width: 10px;
        height: 10px;
        margin-left: var(--grid-base--x2);
        vertical-align: middle;
        content: url('data:image/svg+xml;utf8,<svg width="10" height="10" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5 10A5 5 0 105 0a5 5 0 000 10zm2.912-7.132L4.757 7.733A.498.498 0 014.304 8a.536.536 0 01-.308-.104l-.086-.071-1.758-1.81A.556.556 0 012 5.618c0-.16.05-.292.152-.396a.595.595 0 01.391-.166.5.5 0 01.391.166l1.28 1.315 2.779-4.303a.521.521 0 01.358-.227.568.568 0 01.409.09c.125.079.2.199.23.35a.578.578 0 01-.078.42z" fill="white"/></svg>');
      }

      [data-theme='dark'] &__label {
        color: var(--color-dark-blue-two);
      }

      [data-theme='dark'] &__label::after {
        content: url('data:image/svg+xml;utf8,<svg width="10" height="11" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5.5" r="5" fill="%23303030"/><path d="M4.757 8.233l3.155-4.865c.08-.13.104-.27.077-.422a.516.516 0 00-.23-.35.568.568 0 00-.408-.089.521.521 0 00-.358.227L4.214 7.037l-1.28-1.315a.5.5 0 00-.39-.166.595.595 0 00-.392.166.546.546 0 00-.152.396c0 .157.05.29.152.397l1.758 1.81.086.07c.102.071.206.105.308.105.2-.003.352-.09.453-.267z" fill="%23FFF"/></svg>');
      }
    }

    & .when {
      font-size: var(--font-size-subline--s0);
      font-weight: 400;
      color: var(--color-grey-six);
    }
  }

  &__body {
    margin-bottom: var(--grid-base--x4);
    line-height: var(--line-height-body--s1);

    &--truncated {
      margin-bottom: var(--grid-base);
      /* stylelint-disable-next-line */
      display: -webkit-box;
      overflow: hidden;
      -webkit-line-clamp: 4;
      -webkit-box-orient: vertical;
    }

    &--short {
      margin-bottom: var(--grid-base--x4);
    }
  }

  &__readmore {
    gap: 0;
    margin-bottom: var(--grid-base--x6);
    font-weight: 700;
  }

  &__footer {
    display: flex;
    justify-content: space-between;

    & .left {
      display: flex;
    }

    & .reaction-button {
      font-weight: 700;
      color: var(--color-nu);
    }

    & .likes {
      margin-right: var(--grid-base--x4);
      font-weight: 700;
      color: var(--color-grey-six);
    }

    & .replies {
      font-weight: 700;
      color: var(--color-grey-six);
    }
  }
}
</style>
