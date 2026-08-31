// Icon set for the hero's "hub and spoke" diagram. Two flavours share this
// file: AI_ENGINES (ChatGPT/Gemini/Claude/Perplexity/Copilot, the AI-visibility
// pitch) and AUTOMATION_TOOLS (Zapier/Slack/Microsoft/Gmail/Airtable/Notion,
// the workflow-automation pitch) — both orbit a ChatGPT hub. Path data
// generated the same way as ../toolLogos.js (simple-icons package, CC0);
// Claude, Google Gemini, Zapier, Gmail and Airtable are reused directly from
// toolLogos.js so there's a single source of truth. Microsoft Copilot, Slack
// and Microsoft aren't expressible as one flat colour, so they get their own
// multi-path marks (CopilotMark / SlackMark / MicrosoftMark) instead.
import { TOOL_ROWS } from './toolLogos.js';

const ALL_TOOLS = TOOL_ROWS.flat();
const byName = (name) => ALL_TOOLS.find((t) => t.t === name);

export const AI_ENGINES = [
  {
    key: 'chatgpt',
    label: 'ChatGPT',
    c: '#0B0B0F',
    d: 'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z',
  },
  { key: 'gemini', label: 'Gemini', ...byName('Google Gemini') },
  { key: 'claude', label: 'Claude', ...byName('Claude') },
  {
    key: 'perplexity',
    label: 'Perplexity',
    c: '#20808D',
    d: 'M22.3977 7.0896h-2.3106V.0676l-7.5094 6.3542V.1577h-1.1554v6.1966L4.4904 0v7.0896H1.6023v10.3976h2.8882V24l6.932-6.3591v6.2005h1.1554v-6.0469l6.9318 6.1807v-6.4879h2.8882V7.0896zm-3.4657-4.531v4.531h-5.355l5.355-4.531zm-13.2862.0676 4.8691 4.4634H5.6458V2.6262zM2.7576 16.332V8.245h7.8476l-6.1149 6.1147v1.9723H2.7576zm2.8882 5.0404v-3.8852h.0001v-2.6488l5.7763-5.7764v7.0111l-5.7764 5.2993zm12.7086.0248-5.7766-5.1509V9.0618l5.7766 5.7766v6.5588zm2.8882-5.0652h-1.733v-1.9723L13.3948 8.245h7.8478v8.087z',
  },
  { key: 'copilot', label: 'Copilot' },
];

// The "workflow automation" flavour of the same diagram — real tools a
// business already runs on, still orbiting the ChatGPT hub. Zapier, Gmail
// and Airtable are reused from toolLogos.js; Notion's simple-icons path is
// pure white (meant for dark chips), so it's recoloured near-black here to
// stay visible on the light card; Slack and Microsoft get bespoke multi-path
// marks below since their real logos are four colours, not one.
export const AUTOMATION_TOOLS = [
  { key: 'zapier', label: 'Zapier', ...byName('Zapier') },
  { key: 'slack', label: 'Slack' },
  { key: 'microsoft', label: 'Microsoft' },
  { key: 'gmail', label: 'Gmail', ...byName('Gmail') },
  { key: 'airtable', label: 'Airtable', ...byName('Airtable') },
  { key: 'notion', label: 'Notion', c: '#181818', d: byName('Notion').d },
  { key: 'hubspot', label: 'HubSpot', ...byName('HubSpot') },
  { key: 'calendly', label: 'Calendly', ...byName('Calendly') },
];

// Slack's real mark is four colours (two rounded bars per colour). simple-icons
// ships it as one flat path made of eight closed subpaths in a fixed order;
// split back into those eight and recolour each pair with Slack's own brand
// hexes instead of the single flat fill simple-icons expects it rendered in.
export function SlackMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" />
      <path fill="#E01E5A" d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" />
      <path fill="#36C5F0" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" />
      <path fill="#36C5F0" d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" />
      <path fill="#2EB67D" d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834z" />
      <path fill="#2EB67D" d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" />
      <path fill="#ECB22E" d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52z" />
      <path fill="#ECB22E" d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
    </svg>
  );
}

// Microsoft's real mark is its four quadrant squares. simple-icons ships one
// flat path for all four; drawn here as four separate rects in the same
// official red/green/blue/yellow instead of one flat fill.
export function MicrosoftMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#F25022" d="M0 0h11.408v11.408H0z" />
      <path fill="#7FBA00" d="M12.594 0H24v11.408H12.594z" />
      <path fill="#00A4EF" d="M0 12.594h11.408V24H0z" />
      <path fill="#FFB900" d="M12.594 12.594H24V24H12.594z" />
    </svg>
  );
}

// Microsoft Copilot's real mark is a multi-stop gradient shape, not a flat
// path — sourced from Microsoft's own brand SVG (upload.wikimedia.org),
// reproduced here at its native 0 0 48 48 viewBox.
export function CopilotMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34.1423 7.32501C33.5634 5.35387 31.7547 4 29.7003 4L28.3488 4C26.1142 4 24.1985 5.59611 23.7952 7.79398L21.4805 20.4072L22.0549 18.4419C22.6319 16.4679 24.4419 15.1111 26.4986 15.1111H34.3524L37.6462 16.3942L40.8213 15.1111H39.8946C37.8401 15.1111 36.0315 13.7572 35.4525 11.7861L34.1423 7.32501Z" fill="url(#cpA)" />
      <path d="M14.3307 40.656C14.9032 42.6366 16.7165 44 18.7783 44H21.6486C24.1592 44 26.2122 41.999 26.2767 39.4893L26.5893 27.3271L25.9354 29.5602C25.3577 31.5332 23.5481 32.8889 21.4923 32.8889L13.5732 32.8889L10.7499 31.3573L7.69336 32.8889H8.60461C10.6663 32.8889 12.4796 34.2522 13.0521 36.2329L14.3307 40.656Z" fill="url(#cpB)" />
      <path d="M29.4993 4H13.46C8.87732 4 6.12772 10.0566 4.29466 16.1132C2.12296 23.2886 -0.718769 32.8852 7.50252 32.8852H14.4282C16.4978 32.8852 18.3147 31.5168 18.8835 29.5269C20.0876 25.3143 22.1978 17.9655 23.8554 12.3712C24.6977 9.52831 25.3993 7.08673 26.4762 5.56628C27.0799 4.71385 28.086 4 29.4993 4Z" fill="url(#cpC)" />
      <path d="M29.4993 4H13.46C8.87732 4 6.12772 10.0566 4.29466 16.1132C2.12296 23.2886 -0.718769 32.8852 7.50252 32.8852H14.4282C16.4978 32.8852 18.3147 31.5168 18.8835 29.5269C20.0876 25.3143 22.1978 17.9655 23.8554 12.3712C24.6977 9.52831 25.3993 7.08673 26.4762 5.56628C27.0799 4.71385 28.086 4 29.4993 4Z" fill="url(#cpD)" />
      <path d="M18.498 44H34.5374C39.12 44 41.8696 37.9424 43.7027 31.8848C45.8744 24.7081 48.7161 15.1098 40.4948 15.1098H33.5693C31.4996 15.1098 29.6827 16.4784 29.114 18.4684C27.9098 22.6817 25.7996 30.032 24.142 35.6273C23.2996 38.4708 22.598 40.9127 21.5212 42.4335C20.9175 43.286 19.9113 44 18.498 44Z" fill="url(#cpE)" />
      <path d="M18.498 44H34.5374C39.12 44 41.8696 37.9424 43.7027 31.8848C45.8744 24.7081 48.7161 15.1098 40.4948 15.1098H33.5693C31.4996 15.1098 29.6827 16.4784 29.114 18.4684C27.9098 22.6817 25.7996 30.032 24.142 35.6273C23.2996 38.4708 22.598 40.9127 21.5212 42.4335C20.9175 43.286 19.9113 44 18.498 44Z" fill="url(#cpF)" />
      <defs>
        <radialGradient id="cpA" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(38.005 20.5144) rotate(-129.304) scale(17.3033 16.2706)">
          <stop offset="0.0955758" stopColor="#00AEFF" />
          <stop offset="0.773185" stopColor="#2253CE" />
          <stop offset="1" stopColor="#0736C4" />
        </radialGradient>
        <radialGradient id="cpB" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(11.1215 32.8171) rotate(51.84) scale(15.9912 15.5119)">
          <stop offset="0" stopColor="#FFB657" />
          <stop offset="0.633728" stopColor="#FF5F3D" />
          <stop offset="0.923392" stopColor="#C02B3C" />
        </radialGradient>
        <linearGradient id="cpC" x1="12.5" y1="7.5" x2="14.7884" y2="33.9751" gradientUnits="userSpaceOnUse">
          <stop offset="0.156162" stopColor="#0D91E1" />
          <stop offset="0.487484" stopColor="#52B471" />
          <stop offset="0.652394" stopColor="#98BD42" />
          <stop offset="0.937361" stopColor="#FFC800" />
        </linearGradient>
        <linearGradient id="cpD" x1="14.5" y1="4" x2="15.7496" y2="32.8852" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3DCBFF" />
          <stop offset="0.246674" stopColor="#0588F7" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="cpE" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(41.3187 12.2813) rotate(109.274) scale(38.3873 45.9867)">
          <stop offset="0.0661714" stopColor="#8C48FF" />
          <stop offset="0.5" stopColor="#F2598A" />
          <stop offset="0.895833" stopColor="#FFB152" />
        </radialGradient>
        <linearGradient id="cpF" x1="42.5859" y1="13.346" x2="42.5695" y2="21.2147" gradientUnits="userSpaceOnUse">
          <stop offset="0.0581535" stopColor="#F8ADFA" />
          <stop offset="0.708063" stopColor="#A86EDD" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
