export const assign = (url: string | URL): void => {
  window.location.assign(url);
};

export const reload = () => window.location.reload();
