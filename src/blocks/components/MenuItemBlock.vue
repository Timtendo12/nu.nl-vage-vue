<template>
  <router-link v-if="isComponent && block.title" class="widget-navigation__item" :to="`/component/${slug}`">
    <AppIcon v-if="block.icon" :icon="block.icon"></AppIcon>
    {{ block.title.text }}
  </router-link>
  <a v-else-if="block.title" class="widget-navigation__item" :href="`/${slug}`">
    <AppIcon v-if="block.icon" :icon="block.icon"></AppIcon>
    {{ block.title.text }}
  </a>
</template>

<script lang="ts">
import { MenuItemBlock, ScreenEntryPoint, ScreenTarget } from 'perfapi';
import { computed, defineComponent, PropType, Ref, toRefs } from 'vue';
import { useRoute } from 'vue-router';

import AppIcon from '@/components/AppIcon.vue';
import { getSlugByScreenEntryPoint } from '@/utils/screen';

export default defineComponent({
  name: 'MenuItemBlock',
  components: {
    AppIcon,
  },
  props: {
    block: { type: Object as PropType<MenuItemBlock>, required: true },
  },
  setup(props) {
    const route = useRoute();
    const isComponent = computed(() => route.path.includes('component'));

    const menuItemBlock = toRefs(props.block);
    const target = menuItemBlock?.target as Ref<ScreenTarget>;
    const slug = computed(() => {
      const screenEntryPoint = target?.value.targetId?.toUpperCase() as ScreenEntryPoint;
      const slug = getSlugByScreenEntryPoint(screenEntryPoint);
      return slug;
    });

    return { slug, isComponent };
  },
});
</script>

<style lang="postcss">
.widget-navigation__item {
  display: flex;
  align-items: center;
  padding: var(--grid-base--x2) var(--grid-base--x4);
  font-weight: bold;
  color: var(--color-button-two);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  background: none;
  border: none;
  border-radius: var(--border-radius--double);

  &:hover,
  &:focus {
    background-color: var(--color-button-bg-two);
    outline: none;
  }

  .icon {
    display: none;
    height: 1.125rem;
    margin-right: var(--grid-base--x2);
    font-size: 1.25rem;
  }
}

.router-link-active {
  background-color: var(--color-button-bg-two);
  outline: none;
}

@media screen and (min-width: 600px) {
  .widget-navigation__item {
    .icon {
      display: inherit;
    }
  }
}

/* TODO: Remove this once the actual dark-mode SVG's are available */
[data-theme='dark'] {
  .widget-navigation__item {
    .icon {
      filter: brightness(0) invert(1);
    }
  }
}
</style>
