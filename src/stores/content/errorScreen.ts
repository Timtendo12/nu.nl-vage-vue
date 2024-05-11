import { BlockPage, httpResponse, ImageBlock, Screen, StyledText, TextBlock, TextRole, TextType } from 'perfapi';

import { getEnvVariable } from '@/utils/config';

export const getErrorScreen = ({
  screen = {
    firstBlockPage: {} as BlockPage,
    httpResponse: {
      statusCode: 503,
    } as httpResponse,
  } as Screen,
  reason,
  safeReason = 'Deze pagina kan helaas niet geladen worden, probeer het later nog eens.',
  statusCode,
}: {
  screen?: Screen;
  reason?: unknown;
  safeReason?: string;
  statusCode?: number;
}) => {
  const environment = getEnvVariable('VITE_ENVIRONMENT');
  const title = 'Pagina kon niet geladen worden.';

  const blocks = [
    {
      __typename: 'ImageBlock',
      id: 'loader',
      image: {
        __typename: 'Image',
        url: 'https://media.nu.nl/m/gvzxkn9akexw_xwd854/error-en-laadpagina.jpeg',
        viewAspectRatio: 2,
      },
      imageFlavor: {
        __typename: 'ArticleHeadImageFlavor',
        title: {
          __typename: 'StyledText',
          text: title,
        },
      },
    } as ImageBlock,
    {
      __typename: 'TextBlock',
      id: 'general-error-text',
      styledText: {
        __typename: 'StyledText',
        text: safeReason,
      } as StyledText,
      textRole: TextRole.ArticleBody,
    } as TextBlock,
  ];

  const errorTextBlocks =
    environment !== 'production' && reason
      ? [
          {
            __typename: 'TextBlock',
            id: 'detail-error-text',
            styledText: {
              text: `${reason}`,
              textType: TextType.RestrictedHtml,
            } as StyledText,
            textRole: TextRole.ArticleBody,
          } as TextBlock,
        ]
      : [];

  return {
    ...screen,
    title: screen.title || title,
    firstBlockPage: {
      ...screen.firstBlockPage,
      blocks: [...blocks, ...errorTextBlocks, ...(screen.firstBlockPage?.blocks || [])],
    },
    httpResponse: {
      statusCode: statusCode || screen.httpResponse?.statusCode || 503,
    } as httpResponse,
  } as Screen;
};
