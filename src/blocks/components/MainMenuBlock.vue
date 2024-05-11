<!-- eslint-disable vuejs-accessibility/anchor-has-content -->
<template>
  <nav v-on-click-outside="hideSearch" :class="classList" data-nosnippet>
    <div class="main-nav__wrapper" role="button" tabindex="0" @keydown.esc="hideSearch">
      <SkipContent target="#main" />
      <a href="/" class="main-nav__logo" :class="{ 'main-nav__logo--25year': showLogo25year }">
        <LogoNu25Year v-if="showLogo25year" />
        <LogoNu v-else />
      </a>

      <!-- The main navigation items (always in view) -->
      <div :class="classListMainNavMain" aria-label="Hoofdnavigatie">
        <ul v-if="!showSearch" class="main-nav__list">
          <app-nav-item
            v-for="item in mainMenu"
            :key="item.title"
            :item="item"
            event-category="menu"
            event-action="top_menu"
          />

          <li class="app-nav-item">
            <app-button
              ref="showMoreButton"
              button-type="cta"
              class="app-nav-item__cta app-button--show-more"
              :title="showMoreLabel"
              data-category="menu"
              data-action="top_menu"
              :data-label="showMoreLabel"
              :aria-label="showMoreLabel"
              :data-text="showMoreLabel"
              @click="toggleMore"
            >
              <span class="app-nav-item__cta__label">
                {{ showMoreLabel }}
                <i class="icon icon--16">
                  <!-- prettier-ignore -->
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path fill="currentColor" d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6-6-6 1.41-1.42z" />
                  </svg>
                </i>
              </span>
            </app-button>
          </li>
        </ul>
        <app-search v-else ref="searchbar" class="main-nav__search" />
      </div>

      <!-- Candidate for seperate component -->
      <div ref="navTools" class="nav-tools" aria-label="Zij-navigatie">
        <app-button
          v-if="!inFallbackMode"
          button-type="cta"
          class="nav-tools__tool nav-tools__tool--search"
          @click="toggleSearch"
        >
          <app-icon width="20" height="20" embed embed-alt="Zoekveld" class="main-nav__tools__tool__icon icon--20">
            <icon-search />
          </app-icon>
        </app-button>

        <app-button v-if="!inFallbackMode" button-type="cta" class="nav-tools__tool" @click="toggleTheme">
          <app-icon embed embed-alt="Wissel van kleurthema" class="main-nav__tools__tool__icon icon--24">
            <icon-dark-mode />
          </app-icon>
        </app-button>

        <notification-center v-if="!inFallbackMode" :user="user" />
        <account-trigger v-if="!inFallbackMode" :user="user" />
      </div>
    </div>

    <!-- The dropdown navigation items (show more) -->
    <div ref="dropdown" class="main-nav__dropdown" :aria-hidden="!showMore">
      <ul class="main-nav__sub">
        <app-nav-item
          v-for="item in siteOverview"
          :key="item.title"
          :item="item"
          class="nav-item-group"
          event-category="menu"
          event-action="dropdown-menu"
          :prevent-tab-indexing="!showMore"
        >
          <ul v-if="item.items">
            <app-nav-item
              v-for="subItem in item.items"
              :key="subItem.title"
              :item="subItem"
              event-category="menu"
              event-action="dropdown-menu"
              :prevent-tab-indexing="!showMore"
            />
          </ul>
        </app-nav-item>
        <li class="nav-item-group nav-item-group--editorials">
          <ul>
            <app-nav-item
              v-for="item in mainMenuEditorials"
              :key="item.title"
              :item="item"
              event-category="menu"
              event-action="dropdown-menu"
              :prevent-tab-indexing="!showMore"
            />
          </ul>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components';
import { computed, nextTick, onMounted, onUnmounted, Ref, ref } from 'vue';

import AccountTrigger from '@/components/accountTrigger/AccountTrigger.vue';
import AppButton from '@/components/AppButton.vue';
import AppIcon from '@/components/AppIcon.vue';
import AppNavItem from '@/components/AppNavItem.vue';
import AppSearch from '@/components/AppSearch/AppSearch.vue';
import IconDarkMode from '@/components/icons/IconDarkMode.vue';
import IconSearch from '@/components/icons/IconSearch.vue';
import LogoNu from '@/components/LogoNu.vue';
import LogoNu25Year from '@/components/LogoNu25Year.vue';
import NotificationCenter from '@/components/NotificationCenter/NotificationCenter.vue';
import SkipContent from '@/components/SkipContent.vue';
import { useContextStore } from '@/stores/context';
import { useMenusStore } from '@/stores/menus';
import { usePreferencesStore } from '@/stores/preferences';
import { useUserStore } from '@/stores/user';
import { getEnvVariable } from '@/utils/config';
import { getFocusableElements, isTabPressed } from '@/utils/keyboard';

const menusStore = useMenusStore();
const userStore = useUserStore();
const showMainNav = ref(true);
const showMore = ref(false);
const showSearch = ref(false);
const allowAnimate = ref(false);
const lastScrollPosition = ref(0);
const searchbar = ref<InstanceType<typeof AppSearch>>();
const showMoreButton = ref<InstanceType<typeof AppButton>>();
const dropdown: Ref<HTMLDivElement | undefined> = ref();
const navTools: Ref<HTMLDivElement | undefined> = ref();

const mainMenu = computed(() => menusStore.mainMenu);
const siteOverview = computed(() => menusStore.siteOverview);
const mainMenuEditorials = computed(() => menusStore.mainMenuEditorials);
const user = computed(() => userStore.user);
const { inFallbackMode } = useContextStore();

const preferencesStore = usePreferencesStore();
const toggleTheme = preferencesStore.toggleTheme;

const showLogo25year = getEnvVariable('VITE_USE_25YEAR_LOGO') === 'true' || false;

// Set the appropriate state classes on the main wrapper.
const classList = computed(() => {
  let classList = ['main-nav'];

  if (showMore.value) {
    // Set the show-more modifier.
    classList.push('main-nav--show-more');

    // Scroll the dropdown menu to the top upon opening.
    nextTick(() => {
      if (dropdown.value) {
        dropdown.value.scrollTop = 0;
      }
    });
  }

  showSearch.value ? classList.push('main-nav--show-search') : null;

  // Initially we don't animate to prevent onload artifacts.
  allowAnimate.value ? classList.push('main-nav--allow-animation') : null;
  return classList;
});

const classListMainNavMain = computed(() => {
  let classListMainNavMain = ['main-nav__main'];
  showMainNav.value
    ? classListMainNavMain.push('main-nav__main')
    : classListMainNavMain.push('main-nav__main--is-hidden');
  return classListMainNavMain;
});

const showMoreLabel = computed(() => (showMore.value ? 'Minder' : 'Meer'));

onMounted(() => {
  window.addEventListener('scroll', onScroll);
  window.addEventListener('keydown', onkeydown);

  // Set current scroll position so menu will show even when scrolled.
  lastScrollPosition.value = window.scrollY;
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
});

const onScroll = () => {
  // Sets the threshold for when to unstick and stick.
  const scrollThreshold = 400;
  const currentScrollPosition = window.scrollY || document.documentElement.scrollTop;
  const disableHideNav = document.body.classList.contains('disable-hide-nav');

  if (showSearch.value || disableHideNav) {
    showMainNav.value = true;
    lastScrollPosition.value = currentScrollPosition;
    return;
  }
  // Required to handle mobile bounce scroll effect.
  if (currentScrollPosition < 0) {
    return;
  }
  if (Math.abs(currentScrollPosition - lastScrollPosition.value) < scrollThreshold) {
    return;
  }
  showMainNav.value = currentScrollPosition < lastScrollPosition.value;
  lastScrollPosition.value = currentScrollPosition;

  // Hide the dropdown upon scroll
  showMore.value = false;
};

const onkeydown = (e: KeyboardEvent) => {
  if (!isTabPressed(e)) {
    return;
  }
  const focusedElement = document.activeElement;
  const focusableNavToolsContent = getFocusableElements(navTools.value as HTMLElement);
  const firstFocusableNavToolsElement = focusableNavToolsContent[0]; // get first element to be focused inside navTools
  const focusableDropdownContent = getFocusableElements(dropdown.value as HTMLElement);
  const firstFocusableDropdownElement = focusableDropdownContent[0]; // get first element to be focused inside dropdown
  const lastFocusableDropdownElement = focusableDropdownContent[focusableDropdownContent.length - 1]; // get last element to be focused inside dropdown

  // If the dropdown is open and the show more button is focused, focus the first element in the dropdown.
  if (showMore.value && focusedElement === showMoreButton.value?.$el && !e.shiftKey) {
    e.preventDefault();
    firstFocusableDropdownElement.focus();
    return;
  }

  // If the dropdown is open, the first element is focused and shift is clicked put focus on the show more/less button.
  if (focusedElement === firstFocusableDropdownElement && e.shiftKey) {
    e.preventDefault();
    showMoreButton.value?.$el.focus();
    return;
  }

  // If the dropdown is open, the last element is focused and shift is not clicked put focus on the first element in the nav tools and close the dropdown.
  if (showMore.value && focusedElement === lastFocusableDropdownElement && !e.shiftKey) {
    e.preventDefault();
    firstFocusableNavToolsElement.focus();
    showMore.value = false;
    return;
  }
};

const toggleMore = () => {
  /* TODO: Utilize global state to disable scroll on document  */
  showMore.value = !showMore.value;
  if (showMore.value) {
    // Set a class hook to disable scrolling on the page.
    document.body.classList.add('main-nav__show-more--open');
  } else {
    document.body.classList.remove('main-nav__show-more--open');
  }
  allowAnimate.value = true;
};

const toggleSearch = () => {
  showSearch.value = !showSearch.value;
  showMainNav.value = true;

  nextTick(() => {
    if (searchbar.value) {
      searchbar.value.setFieldHasFocus();
    }
  });
};

const hideSearch = () => {
  showSearch.value = false;
};
</script>

<style lang="postcss">
.widget-navigation {
  display: flex;
  align-items: baseline;
  justify-content: space-around;
  margin-bottom: var(--grid-base--x4);
}

body.main-nav__show-more--open {
  overflow: hidden;
}

.main-nav {
  /* stylelint-disable */
  /* ######### MOBILE ######### */
  /* ##### INITIAL STATE ###### */
  /* ########################## */
  /* stylelint-enable */
  --color-main-nav-bg: var(--color-bg--z0);
  --font-size-main-nav-item: 0.75rem;
  --main-nav-main-height: 40px;
  --main-nav-search-padding: var(--grid-base);

  position: sticky;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  margin-bottom: var(--grid-base--x4);
  background: transparent;
  background-color: var(--color-main-nav-bg);
  border-bottom: 1px solid var(--color-border--z0);
  box-shadow: 0 3px 10px 0 rgba(0 0 0 12%);
  transition-timing-function: ease-in-out;
  transition-duration: 0.2s;
  transition-property: transform, opacity;

  &__wrapper {
    position: relative;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    justify-content: space-between;
    background-color: var(--color-main-nav-bg);
  }

  &__logo {
    display: flex;
    column-gap: 0.5rem;
    align-items: center;
    padding: var(--grid-base--x2);
    font-weight: 700;
    color: var(--color-logo);
    text-decoration: none;

    &-label {
      font-size: 0.9375rem;
    }

    &--25year {
      padding-right: 0.375rem;

      .main-nav__logo-label {
        display: none;
      }

      @media (min-width: 23.4375rem) and (max-width: 61.9375rem) {
        .main-nav__logo-label {
          display: block;
        }
      }

      @media (min-width: 62rem) {
        .main-nav__logo-img svg {
          width: 40px !important;
          height: 40px !important;
        }
      }
    }
  }

  &__main {
    flex: 0 0 100%;
    align-self: stretch;
    order: 3;
    min-height: var(--main-nav-main-height);
    padding: 0 var(--grid-base--x4);
    border-top: 1px solid var(--color-border--z0);

    &--is-hidden {
      display: none;
    }
  }

  &__list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--grid-base--x2);
    align-items: stretch;
    justify-content: space-between;
    height: 100%;
    padding: 0;
    margin: 0;
    list-style: none;

    .app-nav-item {
      --color-nav-item: var(--color-grey-six);

      &__link,
      &__cta {
        height: 100%;
        font-size: var(--font-size-main-nav-item);
        font-weight: 700;
        text-align: center;
        white-space: nowrap;
      }

      &__link {
        display: inline-flex;
        align-items: center;

        &.branded:not(.app-nav-item__link--active) {
          --color-branded-nav-item: var(--color-grey-six);
        }
      }
    }
  }

  &__search {
    padding-top: var(--main-nav-search-padding);
    padding-bottom: var(--main-nav-search-padding);
  }

  /* Overrides to app-button componet */
  .app-button {
    &--show-more {
      --color-button-fg: var(--color-grey-six);

      justify-content: flex-end;
      height: 100%;
      padding: 0;

      /* Neccesary to reserve the space for the word without using fixed widths:
          This ensures no reflows whilst also upholding accesibility for scaled fonts. */
      &::before {
        /* Reserve the size of the caret icon */
        padding-right: var(--grid-base--x4);
        visibility: hidden;
        content: 'Minder';
      }

      .app-nav-item__cta__label {
        position: absolute;
        display: inline-flex;
        align-items: center;
      }

      .icon {
        transition: transform 0.2s ease-in-out;
      }

      &:hover,
      &:focus,
      &:active {
        --color-button-fg: var(--color-grey-six);
      }
    }
  }

  &__dropdown {
    position: absolute;
    z-index: -1;
    width: 100%;
    height: 94vh;
    padding: var(--grid-base--x4) 0;
    overflow: auto;
    background-color: var(--color-main-nav-bg);
    border-top: 1px solid var(--color-border--z0);
    opacity: 0;
    transform: translateY(-100%);
  }

  /* Submenu */
  &__sub {
    max-width: var(--page-max-width);
    padding: 0;
    margin: 0 auto;
    list-style: none;

    .nav-item-group {
      margin-bottom: var(--grid-base--x8);

      .app-nav-item__link {
        display: block;
        padding: var(--grid-base--x2) var(--grid-base--x4) var(--grid-base--x2) 5rem;
      }

      > .app-nav-item__link {
        position: relative;
        display: block;
        font-size: 1.125rem;
        font-weight: 700;

        &::before {
          position: absolute;
          top: 50%;
          left: var(--grid-base--x8);
          display: inline-block;
          width: 1.75rem;
          aspect-ratio: 1/1;
          overflow: hidden;
          content: '';
          background-image: var(--brand-logo);
          background-size: cover;
          transform: translateY(-50%);
        }
      }

      & > ul {
        padding: 0;
        list-style: none;

        /* TODO: This block can be removed after menu content change in CMS */
        .app-nav-item__link {
          &.branded {
            --color-branded-nav-item: var(--color-nu);
          }
        }
      }

      /* The editorial links section */
      &--editorials {
        font-weight: 700;
      }
    }
  }

  /* stylelint-disable */
  /* ############## MOBILE ############## */
  /* ##### COLLAPSED SUBMENU STATE ###### */
  /* #################################### */
  /* stylelint-enable */
  &--show-more {
    .main-nav__dropdown {
      opacity: 1;
      transform: translateY(0);
    }

    /* stylelint-disable-next-line no-descending-specificity */
    .app-button--show-more {
      .icon {
        transform: rotate(180deg);
      }
    }
  }

  /* Don't animate initially to prevent weird artifacts upon loading */
  &--allow-animation {
    .main-nav__dropdown {
      transition-timing-function: ease-in-out;
      transition-duration: 0.2s;
      transition-property: transform, opacity;
    }
  }
}

@media screen and (min-width: 992px) {
  body.main-nav__show-more--open {
    overflow: visible;
  }

  .main-nav {
    /* stylelint-disable */
    /* ######## DESKTOP ######### */
    /* ##### INITIAL STATE ###### */
    /* ########################## */
    /* stylelint-enable */
    --color-main-nav-item: var(--color-nu);
    --color-main-nav-item-raw: var(--color-nu-raw);
    --color-main-nav-opacity-level: 40%;
    --main-nav-main-height: auto;
    --main-nav-search-padding: 0;

    &__wrapper {
      max-width: var(--page-max-width);
      padding: var(--grid-base) 0;
      margin: 0 auto;
    }

    &__logo {
      &__img {
        svg {
          width: 2.5rem;
          aspect-ratio: 1/1;
        }
      }
    }

    /* Main menu */
    &__main {
      flex: 1 1 auto;
      justify-content: flex-start;
      order: 2;
      border-top: inherit;

      /* stylelint-disable */
      /* the value below overwrites the --is-hidden class because it's in a media query */
      /* and makes sure that the menu is always visible on desktop */
      display: inherit;
      /* stylelint-enable */
    }

    &__list {
      gap: var(--grid-base--x6);

      .app-nav-item {
        --color-nav-item: inherit;

        &__link {
          border-radius: var(--border-radius--double);

          &:hover,
          &--active {
            background-color: hsla(var(--color-main-nav-item-raw) var(--color-main-nav-opacity-level));
          }

          &--active {
            text-decoration: inherit;
          }

          &.branded,
          &.branded:not(.app-nav-item__link--active) {
            --color-branded-nav-item: var(--brand-color);
            --color-branded-nav-item-raw: var(--brand-color-raw);

            &:hover {
              background-color: hsla(var(--color-branded-nav-item-raw) var(--color-main-nav-opacity-level));
            }
          }

          &--active.branded {
            background-color: hsla(var(--color-branded-nav-item-raw) var(--color-main-nav-opacity-level));
          }
        }
      }

      .app-button {
        &--show-more {
          --color-button-fg: inherit;

          justify-content: inherit;

          &:hover,
          &:focus,
          &:active {
            --color-button-fg: inherit;
          }
        }
      }
    }

    &__search {
      display: inherit;
      flex: 1 1 auto;
      align-self: center;
      justify-content: flex-start;
      border-top: none;
    }

    &__dropdown {
      height: auto;
      border-bottom: 1px solid var(--color-border--z0);
      box-shadow: 0 3px 10px 0 rgba(0 0 0 12%);
    }

    /* Sub menu */
    &__sub {
      display: flex;
      flex-flow: row wrap;
      justify-content: space-between;
      padding: 0 var(--grid-base--x2);

      .nav-item-group {
        padding-left: var(--grid-base--x2);

        .app-nav-item__link {
          padding: var(--grid-base--x2) 0;
          font-size: var(--font-size-main-nav-item);
        }

        > .app-nav-item__link {
          display: inherit;
          font-size: var(--font-size-main-nav-item);

          &::before {
            content: inherit;
          }
        }

        &:first-child {
          padding-left: 0;
        }
      }
    }

    &--not-sticky {
      transform: inherit;
    }

    /* stylelint-disable */
    /* ############### DESKTOP ############ */
    /* ##### COLLAPSED SUBMENU STATE ###### */
    /* #################################### */
    /* stylelint-enable */
    &--show-more {
      &::after {
        position: absolute;
        top: 0;
        z-index: -1;
        width: 100%;
        height: 100%;
        content: '';
        background-color: var(--color-main-nav-bg);
      }
    }
  }

  .nav-tools {
    order: 3;
  }
}

.nav-tools {
  display: flex;
  gap: var(--grid-base--x4);
  align-items: stretch;
  align-self: stretch;
  order: 2;
  padding: 0 var(--grid-base--x4) 0 0;

  &__tool {
    display: flex;
    gap: var(--grid-base--x2);
    align-items: center;
    padding: 0;

    &:last-child {
      padding-right: 0;
    }

    &__label {
      display: none;
      font-size: var(--font-size-main-nav-item);
    }
  }
}

@media screen and (min-width: 320px) {
  .nav-tools {
    &__tool {
      &__label {
        display: block;
      }
    }
  }
}

[data-theme='dark'] {
  .main-nav {
    --color-main-nav-bg: var(--color-bg--z1);
    --color-main-nav-item: var(--color-body-text);
    --color-main-nav-opacity-level: 0.15;

    &__main {
      .app-nav-item {
        /* stylelint-disable-next-line no-descending-specificity */
        &__link.branded {
          --color-branded-nav-item-raw: var(--color-grey-six-raw);
        }
      }
    }
  }

  .nav-tools {
    &__tool {
      color: var(--color-body-text);
    }
  }
}
</style>
