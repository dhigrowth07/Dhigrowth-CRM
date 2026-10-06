/**
 * Meta Graph API Constants & Endpoints Configuration
 */

export const META_GRAPH_VERSION = 'v20.0';
export const META_GRAPH_VERSION_V21 = 'v21.0';
export const META_BASE_URL = `https://graph.facebook.com/${META_GRAPH_VERSION}`;
export const META_BASE_URL_V21 = `https://graph.facebook.com/${META_GRAPH_VERSION_V21}`;
export const GRAPH_BASE_URL = META_BASE_URL;

export const DEFAULT_META_VERIFY_TOKEN = 'dhigrowth_webhook_secret_2026';

export const getMetaMessagesUrl = (phoneNumberId, version = META_GRAPH_VERSION) =>
  `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;

export const getMetaTemplatesUrl = (wabaId, version = META_GRAPH_VERSION) =>
  `https://graph.facebook.com/${version}/${wabaId}/message_templates`;

export const getMetaMediaUrl = (phoneNumberId, version = META_GRAPH_VERSION) =>
  `https://graph.facebook.com/${version}/${phoneNumberId}/media`;

export const getMetaPhoneHealthUrl = (phoneNumberId, accessToken, version = META_GRAPH_VERSION_V21) =>
  `https://graph.facebook.com/${version}/${phoneNumberId}?fields=verified_name,display_phone_number,quality_rating,status,code_verification_status,throughput,messaging_limit_tier,name_status&access_token=${accessToken}`;

export const getMetaWabaAnalyticsUrl = (wabaId, start, end, accessToken, version = META_GRAPH_VERSION_V21) =>
  `https://graph.facebook.com/${version}/${wabaId}/conversation_analytics?start=${start}&end=${end}&granularity=DAILY&metric_types=CONVERSATION,COST&access_token=${accessToken}`;

export default {
  META_GRAPH_VERSION,
  META_GRAPH_VERSION_V21,
  META_BASE_URL,
  META_BASE_URL_V21,
  DEFAULT_META_VERIFY_TOKEN,
  getMetaMessagesUrl,
  getMetaTemplatesUrl,
  getMetaMediaUrl,
  getMetaPhoneHealthUrl,
  getMetaWabaAnalyticsUrl,
};
