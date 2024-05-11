<template>
  <footer class="app-footer" data-nosnippet>
    <div class="app-footer__wrapper">
      <nav class="app-footer__main">
        <ul class="app-footer__links app-hide--d">
          <AppNavItem
            v-for="item in siteOverview"
            :key="item.title"
            :item="item"
            class="nav-item-group"
            event-category="menu"
            event-action="footer-menu"
          />
        </ul>
        <ul class="app-footer__links app-hide--m">
          <AppNavItem
            v-for="item in siteOverview"
            :key="item.title"
            :item="item"
            class="nav-item-group"
            event-category="menu"
            event-action="footer-menu"
          >
            <ul v-if="item.items">
              <AppNavItem
                v-for="subItem in item.items"
                :key="subItem.title"
                :item="subItem"
                event-category="menu"
                event-action="footer-menu"
              />
            </ul>
          </AppNavItem>
          <li class="app-nav-item nav-item-group">
            <ul>
              <AppNavItem
                v-for="item in footerEditorials"
                :key="item.title"
                :item="item"
                event-category="menu"
                event-action="footer-menu"
              />
              <PrivacySettings />
            </ul>
          </li>
        </ul>
      </nav>
      <!-- mobile -->
      <nav class="app-footer__editorials app-hide--d">
        <ul class="app-footer__links">
          <AppNavItem
            v-for="item in footerEditorials"
            :key="item.title"
            :item="item"
            class=""
            event-category="menu"
            event-action="footer-menu"
          />
          <PrivacySettings />
        </ul>
      </nav>
    </div>
    <div class="app-footer__info">
      <div class="app-footer__info-wrapper">
        <AppFollowUs instagram facebook twitter rss />

        <p class="body-style body-style--s0 app-footer__copyright">&copy;{{ copyRightText }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import AppFollowUs from '@/components/AppFollowUs.vue';
import AppNavItem from '@/components/AppNavItem.vue';
import PrivacySettings from '@/components/PrivacySettings.vue';
import { useMenusStore } from '@/stores/menus';

const menusStore = useMenusStore();

const siteOverview = ref(menusStore.siteOverview);
const footerEditorials = ref(menusStore.footerEditorials);
const copyRightText = computed(() => `${new Date().getFullYear()} DPG Media B.V. – alle rechten voorbehouden`);
</script>

<style lang="postcss">
.app-footer {
  --font-size-footer-nav-item: 0.75rem;

  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  font-size: 0.875rem;
  border-top: 1px solid var(--color-border--z0);

  &__wrapper,
  &__info {
    padding: var(--grid-base--x4) var(--grid-base--x2);
  }

  &__wrapper {
    display: flex;
    flex: auto;
    flex-flow: row wrap;
    max-width: var(--page-max-width);
    padding-top: var(--grid-base--x8);
    margin: 0 auto;
  }

  &__main,
  &__editorials {
    flex: auto;
  }

  .app-nav-item {
    &__link {
      display: block;
      margin-bottom: var(--grid-base--x4);
    }

    .app-nav-item:last-child {
      .app-nav-item__link {
        margin-bottom: 0;
      }
    }
  }

  &__links {
    max-width: var(--page-max-width);
    padding: 0;
    margin: 0 auto;
    list-style: none;

    .nav-item-group {
      /* stylelint-disable-next-line no-descending-specificity */
      > .app-nav-item__link {
        position: relative;
        display: block;
        font-weight: 700;
      }

      & > ul {
        padding: 0;
        list-style: none;

        /* TODO: This block can be removed after menu content change in CMS */
        /* stylelint-disable-next-line no-descending-specificity */
        .app-nav-item__link {
          &.branded {
            --color-branded-nav-item: var(--color-nu);
          }
        }
      }
    }
  }

  &__info {
    flex: 1 1 auto;
    border-top: 1px solid var(--color-border--z0);
  }

  &__info-wrapper {
    max-width: var(--page-max-width);
    margin: 0 auto;
  }

  .app-follow-us {
    margin-bottom: var(--grid-base--x4);
  }

  &__copyright,
  &__copyright a {
    margin: 0;
    color: var(--color-grey-six);
    text-decoration: none;
  }
}

@media screen and (min-width: 480px) {
  .app-footer {
    &__wrapper {
      padding-right: 0;
    }

    &__info {
      flex: 0 1 33%;
      padding-top: var(--grid-base--x8);
      padding-left: 0;
      border-top-width: 0;
    }

    .app-follow-us {
      display: inherit;

      &__title {
        margin-bottom: var(--grid-base--x2);
      }

      &__badges {
        li:first-child {
          margin-left: inherit;
        }
      }
    }
  }
}

@media screen and (min-width: 992px) {
  .app-footer {
    &__wrapper {
      padding-right: var(--grid-base--x2);
    }

    &__links {
      justify-content: space-between;

      &.app-hide--m {
        display: flex;
      }

      .app-nav-item__link {
        font-size: var(--font-size-footer-nav-item);
      }

      .nav-item-group {
        padding-left: var(--grid-base--x2);

        > .app-nav-item__link {
          display: inherit;

          &::before {
            content: inherit;
          }
        }

        &:first-child {
          padding-left: 0;
        }
      }
    }

    &__info {
      flex: 1 0 100%;
      padding-top: var(--grid-base--x4);
      border-top: inherit;
    }

    &__info-wrapper {
      display: flex;
      flex-flow: row wrap;
      align-items: center;
      justify-content: space-evenly;
    }

    .app-follow-us {
      display: flex;
      margin-bottom: inherit;

      &__title {
        margin-bottom: inherit;
      }

      &__badges {
        li:first-child {
          margin-left: var(--grid-base--x2);
        }
      }
    }

    br {
      display: none;
    }
  }
}

[data-theme='dark'] {
  .main-nav {
    --color-main-nav-bg: var(--color-bg--z1);
    --color-main-nav-item: var(--color-body-text);

    &__tools {
      &__tool {
        color: var(--color-body-text);
      }
    }
  }
}
</style>
