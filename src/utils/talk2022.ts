import { Talk2022EmitEvent } from '@/blocks/components/Talk2022Block/Talk2022';
import { GTMGenericTag } from '@/utils/gtm';

export const talk2022EventToGTMGenericTag = (talk2022Event: Talk2022EmitEvent<unknown>): GTMGenericTag | null => {
  const gtmGenericTag: GTMGenericTag = {
    event: 'nujij',
    'nujij-data': {},
  };

  switch (talk2022Event.eventName) {
    case 'loadMoreFeaturedComments.success': {
      // Click on "Bekijk meer reacties" button in featured comment stream
      gtmGenericTag['event'] = 'nujij-load-more-reactions';
      gtmGenericTag['nujij-data'] = {
        action: 'load-more-reactions',
      };
      break;
    }
    case 'loadMoreAllComments.success': {
      // Click on "Bekijk meer reacties" button in all commments stream
      gtmGenericTag['event'] = 'nujij-load-more-reactions';
      gtmGenericTag['nujij-data'] = {
        action: 'load-more-reactions',
      };
      break;
    }
    case 'nunl_labels.SHOW_EXPERT_LABEL_POPUP': {
      // Click on Expert label button
      gtmGenericTag['event'] = 'nujij-popup-expert-label';
      gtmGenericTag['nujij-data'] = {
        action: 'popup-expert-label',
        label: 'show',
      };
      break;
    }
    case 'setCommentsOrderBy': {
      // Set ordering to...
      gtmGenericTag['event'] = 'nujij-set-sorting';
      const orderByEvent = talk2022Event as Talk2022EmitEvent<{ orderBy: string }>;
      switch (orderByEvent.data.orderBy) {
        // most respected
        case 'REACTION_DESC':
          gtmGenericTag['nujij-data'] = { action: 'set-sorting', label: 'respects_desc' };
          break;
        // most replies
        case 'REPLIES_DESC':
          gtmGenericTag['nujij-data'] = { action: 'set-sorting', label: 'replies_desc' };
          break;
        // oldest
        case 'CREATED_AT_DESC':
          gtmGenericTag['nujij-data'] = { action: 'set-sorting', label: 'created-at_desc' };
          break;
        // newest
        case 'CREATED_AT_ASC':
          gtmGenericTag['nujij-data'] = { action: 'set-sorting', label: 'created-at_asc' };
          break;
        default:
          return null;
      }
      break;
    }
    case 'createCommentReaction.success': {
      // Give respect
      gtmGenericTag['event'] = 'nujij-respect-reaction';
      gtmGenericTag['nujij-data'] = {
        action: 'respect-reaction',
      };
      break;
    }
    case 'createCommentReply.success': {
      // Create a reply on a comment
      gtmGenericTag['event'] = 'nujij-post-reaction';
      gtmGenericTag['nujij-data'] = {
        action: 'post-reaction',
        label: 'comment-on-reaction',
      };
      break;
    }
    case 'createComment.success': {
      // Create a reply on a comment
      gtmGenericTag['event'] = 'nujij-post-reaction';
      gtmGenericTag['nujij-data'] = {
        action: 'post-reaction',
        label: 'new-reaction',
      };
      break;
    }
    case 'setCommentsTab': {
      // Create a reply on a comment
      gtmGenericTag['event'] = 'nujij-change-reaction-view';
      const setCommentsTabEvent = talk2022Event as Talk2022EmitEvent<{ tab: string }>;
      switch (setCommentsTabEvent.data.tab) {
        // featured comments
        case 'FEATURED_COMMENTS':
          gtmGenericTag['nujij-data'] = { action: 'change-reaction-view', label: 'featured-reactions' };
          break;
        // all comments
        case 'ALL_COMMENTS':
          gtmGenericTag['nujij-data'] = { action: 'change-reaction-view', label: 'all-reactions' };
          break;
        default:
          return null;
      }
      break;
    }
    case 'loginPrompt': {
      // Authenticate to comment
      gtmGenericTag['event'] = 'nujij-register-to-comment-button';
      const loginPromptEvent = talk2022Event as Talk2022EmitEvent<{ label: string | null } | null>;
      switch (loginPromptEvent.data?.label) {
        // 'login & lees meer' inside nujij nested comments
        case 'login-to-read-replies':
          gtmGenericTag['nujij-data'] = { action: 'register-to-comment-button', label: 'login-to-read-replies' };
          break;
        // textlink `inloggen` inside banner
        case 'login-banner':
          gtmGenericTag['nujij-data'] = { action: 'register-to-comment-button', label: 'login-banner' };
          break;
        // full banner
        case 'click-full-banner':
          gtmGenericTag['nujij-data'] = { action: 'register-to-comment-button', label: 'click-full-banner' };
          break;
        // green button inside banner
        case 'register-banner':
          gtmGenericTag['nujij-data'] = { action: 'register-to-comment-button', label: 'register-banner' };
          break;
        // `aanmelden om te registeren` below message Welcome NUjij
        case undefined:
          gtmGenericTag['nujij-data'] = { action: 'register-to-comment-button', label: 'button-in-nujij' };
          break;
        default:
          return null;
      }
      break;
    }
    case 'signOut.success': {
      // Logout user
      gtmGenericTag['event'] = 'nujij-logout';
      gtmGenericTag['nujij-data'] = {
        action: 'logout',
      };
      break;
    }
    case 'reportComment.success': {
      // Report comment
      gtmGenericTag['event'] = 'nujij-report-reaction';
      const reportCommentEvent = talk2022Event as Talk2022EmitEvent<{ reason: string | null }>;
      switch (reportCommentEvent.data?.reason) {
        // reason: offensive comment
        case 'COMMENT_REPORTED_OFFENSIVE':
          gtmGenericTag['nujij-data'] = { action: 'report-reaction', label: 'comments_comment-offensive' };
          break;
        // reason: other
        case 'COMMENT_REPORTED_OTHER':
          gtmGenericTag['nujij-data'] = { action: 'report-reaction', label: 'comments_comment-other' };
          break;
        // reason: spam
        case 'COMMENT_REPORTED_SPAM':
          gtmGenericTag['nujij-data'] = { action: 'report-reaction', label: 'comments_comment-spam' };
          break;
        // reason: don't agree with comment
        case 'DONT_AGREE':
          gtmGenericTag['nujij-data'] = { action: 'report-reaction', label: 'comments_comment-donotagree' };
          break;
        // reason: user is abusive
        case 'COMMENT_REPORTED_ABUSIVE':
          gtmGenericTag['nujij-data'] = { action: 'report-reaction', label: 'comments_comment-reported-abusive' };
          break;
        default:
          return null;
      }
      break;
    }
    default: {
      // Talk2022 event is not supported (yet), return null
      return null;
    }
  }

  return gtmGenericTag;
};
