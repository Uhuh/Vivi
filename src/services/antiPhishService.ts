import axios from 'axios';

export interface PhishingBody {
  domain: string;
  type: string;
  trust_rating: number;
}

export class AntiPhishService {
  constructor() {}
  // ZeroTwo Anti-fish API recommends using this regex when looking for domains and using their API
  static domainRegex = RegExp(
    '(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]'
  );
  static antiPhishUrl = 'https://anti-fish.bitflow.dev/check';

  /**
   * Check if a users message contains a domain.
   * @param content : Message content from user;
   * @returns true if domain, false otherwise.
   */
  static messageContainsUrl(content: string): boolean {
    return !!content.match(this.domainRegex)?.length;
  }

  /**
   * Check if a user is sending phishing urls.
   * @param content : Message content from user;
   * @returns true if phishing, false otherwise.
   */
  static async doesMessageContainPhishingLinks(
    content: string
  ): Promise<Partial<PhishingBody> | PhishingBody> {
    if (!this.messageContainsUrl(content)) return { trust_rating: 0 };

    try {
      const matches = await axios({
        method: 'POST',
        url: this.antiPhishUrl,
        data: {
          message: content,
        },
        headers: {
          'User-Agent': 'Vivi#0294 (https://panku.io/vivi)',
        },
      });

      return matches.data.matches[0];
    } catch {
      return { trust_rating: 0 };
    }
  }
}
