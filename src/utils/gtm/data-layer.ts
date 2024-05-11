import { DataLayerScreenViewKeyValue } from 'perfapi';

export const transformDataLayerScreenViewToDictionary = (fields?: DataLayerScreenViewKeyValue[]) =>
  fields?.reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {}) || {};
