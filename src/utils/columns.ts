export const isSingleColumnMQ =
  (typeof window !== 'undefined' && window.matchMedia?.('(max-width: 767px)')) || undefined;

export enum Column {
  main,
  side,
}

export enum ViewPort {
  doubleColumn,
  singleColumn,
}
