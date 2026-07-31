export interface OfficialAppConfig {
  name: string;
  iconUrl: string;
  description: string;
  popularPlans: string[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export const OFFICIAL_APP_CONFIGS: Record<string, OfficialAppConfig> = {
  '6448311069': {
    name: 'ChatGPT',
    iconUrl: '/images/official-apps/chatgpt.jpg',
    description: 'ChatGPT 是 OpenAI 推出的官方 AI 助手，可以帮助你回答问题、学习新知识、进行写作和创意构思，也能处理图片、文件和语音对话。登录同一账号后，可以在不同设备之间同步聊天记录，并使用 OpenAI 最新提供的模型和功能。',
    popularPlans: [
      'ChatGPT Go（月付）',
      'ChatGPT Plus（月付）',
      'ChatGPT Pro 5x（月付）',
      'ChatGPT Pro 20x（月付）',
    ],
    seo: {
      title: 'ChatGPT Plus 各区价格对比｜Go、Pro App Store 订阅低价区 - OpenPrice',
      description: '查看 ChatGPT Go、Plus、Pro 5x 和 Pro 20x 在不同 App Store 国家和地区的官方月付、年付价格与低价排行，快速了解 ChatGPT Plus 哪个区更便宜。',
      keywords: ['ChatGPT Plus 价格', 'ChatGPT Plus 哪个区便宜', 'ChatGPT App Store 价格', 'ChatGPT Go 价格', 'ChatGPT Pro 价格', 'ChatGPT 各区价格'],
    },
  },
  '6473753684': {
    name: 'Claude by Anthropic',
    iconUrl: '/images/official-apps/claude.jpg',
    description: 'Claude 是 Anthropic 推出的 AI 助手，适合写作、学习、内容分析、编程和日常工作。你可以与 Claude 自然对话，上传图片或文件进行分析，整理复杂信息，并在移动设备上继续处理已有对话和任务。',
    popularPlans: [
      'Claude Pro（月付）',
      'Claude Max 5x（月付）',
      'Claude Max 20x（月付）',
    ],
    seo: {
      title: 'Claude Pro 各区价格对比｜Max 5x、20x App Store 低价区 - OpenPrice',
      description: '查看 Claude Pro、Max 5x 和 Max 20x 在不同 App Store 国家和地区的官方月付、年付价格与低价排行，快速了解 Claude 订阅哪个区更便宜。',
      keywords: ['Claude Pro 价格', 'Claude 哪个区便宜', 'Claude App Store 价格', 'Claude Max 价格', 'Claude Max 5x', 'Claude Max 20x'],
    },
  },
  '6670324846': {
    name: 'Grok AI',
    iconUrl: '/images/official-apps/grok.jpg',
    description: 'Grok 是 xAI 推出的 AI 助手，支持对话、实时搜索、推理、文件分析、语音以及图片和视频生成。它可以结合互联网和 X 上的实时信息回答问题，并通过不同的 SuperGrok 订阅提供更高的使用额度和更多高级能力。',
    popularPlans: [
      'SuperGrok Lite（月付）',
      'SuperGrok（月付）',
      'SuperGrok Heavy（月付）',
    ],
    seo: {
      title: 'Grok 各区价格对比｜SuperGrok Lite、Heavy 订阅低价区 - OpenPrice',
      description: '查看 Grok AI 的 SuperGrok Lite、SuperGrok 和 SuperGrok Heavy 在不同 App Store 国家和地区的官方订阅价格与低价排行，快速了解 Grok 哪个区更便宜。',
      keywords: ['Grok 价格', 'Grok 哪个区便宜', 'Grok App Store 价格', 'SuperGrok 价格', 'SuperGrok Lite', 'SuperGrok Heavy 价格'],
    },
  },
};
