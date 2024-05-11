export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll(focusableElements));
};

export const isTabPressed = (event: KeyboardEvent): boolean => event.key === 'Tab' || event.code === 'Tab';
