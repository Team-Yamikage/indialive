import { ParsedChannel } from '@/types/channel';

export function parseM3U(content: string): ParsedChannel[] {
  const channels: ParsedChannel[] = [];
  const lines = content.split('\n').map(line => line.trim());
  
  let currentChannel: Partial<ParsedChannel> | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('#EXTINF:')) {
      currentChannel = parseExtInf(line);
    } else if (line.startsWith('http://') || line.startsWith('https://')) {
      if (currentChannel) {
        currentChannel.url = line;
        if (currentChannel.name && currentChannel.url) {
          channels.push(currentChannel as ParsedChannel);
        }
        currentChannel = null;
      }
    }
  }
  
  return channels;
}

function parseExtInf(line: string): Partial<ParsedChannel> {
  const channel: Partial<ParsedChannel> = {};
  
  // Extract attributes
  const tvgIdMatch = line.match(/tvg-id="([^"]*)"/);
  const tvgNameMatch = line.match(/tvg-name="([^"]*)"/);
  const tvgLogoMatch = line.match(/tvg-logo="([^"]*)"/);
  const tvgCountryMatch = line.match(/tvg-country="([^"]*)"/);
  const tvgLanguageMatch = line.match(/tvg-language="([^"]*)"/);
  const groupTitleMatch = line.match(/group-title="([^"]*)"/);
  
  if (tvgIdMatch) channel.tvgId = tvgIdMatch[1];
  if (tvgNameMatch) channel.tvgName = tvgNameMatch[1];
  if (tvgLogoMatch) channel.logo = tvgLogoMatch[1];
  if (tvgCountryMatch) channel.tvgCountry = tvgCountryMatch[1];
  if (tvgLanguageMatch) channel.tvgLanguage = tvgLanguageMatch[1];
  if (groupTitleMatch) channel.group = groupTitleMatch[1];
  
  // Extract channel name (after the last comma)
  const nameMatch = line.match(/,(.+)$/);
  if (nameMatch) {
    channel.name = nameMatch[1].trim();
  }
  
  return channel;
}

export function filterIndianChannels(channels: ParsedChannel[]): ParsedChannel[] {
  const indianKeywords = [
    'india', 'indian', 'hindi', 'tamil', 'telugu', 'kannada', 'malayalam',
    'bengali', 'marathi', 'gujarati', 'punjabi', 'odia', 'assamese',
    'zee', 'star', 'sony', 'colors', 'sun tv', 'gemini', 'maa tv',
    'aaj tak', 'ndtv', 'republic', 'times now', 'india today',
    'dd ', 'doordarshan', 'sahara', 'news18', 'abp', 'zee news',
    'india tv', 'cnbc awaaz', 'et now', 'mirror now'
  ];
  
  return channels.filter(channel => {
    // Check country code
    if (channel.tvgCountry?.toLowerCase().includes('in') || 
        channel.tvgCountry?.toLowerCase() === 'india') {
      return true;
    }
    
    // Check language
    const indianLanguages = ['hindi', 'tamil', 'telugu', 'kannada', 'malayalam', 
                            'bengali', 'marathi', 'gujarati', 'punjabi', 'odia'];
    if (channel.tvgLanguage && indianLanguages.some(lang => 
        channel.tvgLanguage?.toLowerCase().includes(lang))) {
      return true;
    }
    
    // Check name for Indian keywords
    const nameLower = channel.name.toLowerCase();
    if (indianKeywords.some(keyword => nameLower.includes(keyword))) {
      return true;
    }
    
    // Check group
    if (channel.group) {
      const groupLower = channel.group.toLowerCase();
      if (groupLower.includes('india') || 
          indianLanguages.some(lang => groupLower.includes(lang))) {
        return true;
      }
    }
    
    return false;
  });
}

export function generateChannelId(channel: ParsedChannel): string {
  const base = channel.tvgId || channel.name;
  return base.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50) + 
         '-' + Math.random().toString(36).substring(2, 8);
}

export function isHDChannel(channel: ParsedChannel): boolean {
  const name = channel.name.toLowerCase();
  const group = channel.group?.toLowerCase() || '';
  
  return name.includes('hd') || 
         name.includes('1080') || 
         name.includes('4k') ||
         group.includes('hd') ||
         name.includes('fhd');
}
