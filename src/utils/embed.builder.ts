import { EmbedBuilder } from 'discord.js';
import { BRAND_COLOR, BOT_FOOTER, ERROR_COLOR, SUCCESS_COLOR, WARNING_COLOR, INFO_COLOR } from '../config/constants';
import { NewsArticle } from '../types';

function base(): EmbedBuilder {
  return new EmbedBuilder()
    .setFooter({ text: BOT_FOOTER })
    .setTimestamp();
}

export function createBaseEmbed(color = BRAND_COLOR): EmbedBuilder {
  return base().setColor(color);
}

export function createSuccessEmbed(title: string, description?: string): EmbedBuilder {
  return base().setColor(SUCCESS_COLOR).setTitle(title).setDescription(description ?? null);
}

export function createErrorEmbed(title: string, description?: string): EmbedBuilder {
  return base().setColor(ERROR_COLOR).setTitle(`❌ ${title}`).setDescription(description ?? null);
}

export function createWarningEmbed(title: string, description?: string): EmbedBuilder {
  return base().setColor(WARNING_COLOR).setTitle(`⚠️ ${title}`).setDescription(description ?? null);
}

export function createInfoEmbed(title: string, description?: string): EmbedBuilder {
  return base().setColor(INFO_COLOR).setTitle(`ℹ️ ${title}`).setDescription(description ?? null);
}

export function createNewsEmbed(article: NewsArticle, aiSummary?: string): EmbedBuilder {
  const embed = base()
    .setColor(BRAND_COLOR)
    .setTitle(article.title)
    .setURL(article.url)
    .setDescription(aiSummary ?? article.summary ?? null)
    .addFields({ name: 'Source', value: article.source, inline: true });

  if (article.imageUrl) embed.setThumbnail(article.imageUrl);

  return embed;
}
