import {
  Block,
  FormDataKeyValue,
  isBlockReplacementByIdActionResponse,
  isCompoundBlockModificationActionResponse,
} from 'perfapi';
import { defineStore } from 'pinia';

import { useContentStore } from '../content';

export interface FormElementBlockState {
  formElementBlockTextArea: string;
}

export const useFormElementBlockStore = defineStore('formElementBlock', {
  state: (): FormElementBlockState => ({
    formElementBlockTextArea: '',
  }),
  actions: {
    setFormElementBlockTextArea(payLoad: string) {
      this.formElementBlockTextArea = payLoad;
    },
    setFormElementBlockTextAreaToEmptyString() {
      this.formElementBlockTextArea = '';
    },
    async handleQuestionFormData(payload: {
      actionData: Array<FormDataKeyValue>;
      groupId?: string;
      id: string;
      tagIds?: Array<number>;
      originalBlock?: Block;
    }) {
      const contentStore = useContentStore();
      try {
        if (payload.groupId && payload.tagIds && payload.originalBlock) {
          const result = await this.bffClient.handleQuestionFormData(
            payload.actionData,
            payload.groupId,
            payload.id,
            payload.tagIds,
          );
          if (isBlockReplacementByIdActionResponse(result) && result.blocks?.length) {
            contentStore.replaceBlock({ originalBlock: payload.originalBlock, newBlock: result.blocks[0] });
            this.setFormElementBlockTextAreaToEmptyString();
          }
          if (isCompoundBlockModificationActionResponse(result) && result.modifications?.length) {
            contentStore.compoundBlockModification({ modifications: result.modifications });
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
});
