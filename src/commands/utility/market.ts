import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { getCryptoPrice, getStockPrice } from '../../services/market.service';
import { createBaseEmbed, createErrorEmbed } from '../../utils/embed.builder';
import { SUCCESS_COLOR, ERROR_COLOR } from '../../config/constants';

function formatPrice(price: number): string {
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
  return `$${cap.toLocaleString()}`;
}

export default {
  data: new SlashCommandBuilder()
    .setName('market')
    .setDescription('Get the current price of a crypto or stock')
    .addStringOption((opt) =>
      opt.setName('symbol').setDescription('Ticker symbol (e.g. BTC, ETH, AAPL, TSLA)').setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName('type')
        .setDescription('Asset type (default: tries crypto first, then stock)')
        .addChoices(
          { name: 'Crypto', value: 'crypto' },
          { name: 'Stock', value: 'stock' },
        ),
    ),
  category: CommandCategory.Utility,
  cooldown: 5,
  async execute(interaction: ChatInputCommandInteraction, _client: ExtendedClient): Promise<void> {
    await interaction.deferReply();

    const symbol = interaction.options.getString('symbol', true).toUpperCase();
    const type = interaction.options.getString('type');

    if (type === 'stock') {
      const stock = await getStockPrice(symbol);
      if (!stock) {
        await interaction.editReply({ embeds: [createErrorEmbed('Not Found', `Could not find stock data for **${symbol}**.`)] });
        return;
      }

      const isUp = stock.changePercent >= 0;
      const color = isUp ? SUCCESS_COLOR : ERROR_COLOR;
      const arrow = isUp ? '▲' : '▼';

      await interaction.editReply({
        embeds: [
          createBaseEmbed(color)
            .setTitle(`${stock.symbol} — ${stock.name}`)
            .addFields(
              { name: 'Price', value: formatPrice(stock.price), inline: true },
              { name: 'Change', value: `${arrow} ${formatChange(stock.changePercent)}`, inline: true },
              { name: 'Exchange', value: stock.exchange, inline: true },
            ),
        ],
      });
      return;
    }

    // Default: try crypto first
    const crypto = await getCryptoPrice(symbol);
    if (crypto) {
      const isUp = crypto.change24h >= 0;
      const color = isUp ? SUCCESS_COLOR : ERROR_COLOR;
      const arrow = isUp ? '▲' : '▼';

      const fields = [
        { name: 'Price', value: formatPrice(crypto.price), inline: true },
        { name: '24h Change', value: `${arrow} ${formatChange(crypto.change24h)}`, inline: true },
      ];
      if (crypto.marketCap) {
        fields.push({ name: 'Market Cap', value: formatMarketCap(crypto.marketCap), inline: true });
      }

      await interaction.editReply({
        embeds: [
          createBaseEmbed(color)
            .setTitle(`${crypto.symbol} — ${crypto.name}`)
            .addFields(...fields),
        ],
      });
      return;
    }

    // Crypto not found — try stock
    const stock = await getStockPrice(symbol);
    if (stock) {
      const isUp = stock.changePercent >= 0;
      const color = isUp ? SUCCESS_COLOR : ERROR_COLOR;
      const arrow = isUp ? '▲' : '▼';

      await interaction.editReply({
        embeds: [
          createBaseEmbed(color)
            .setTitle(`${stock.symbol} — ${stock.name}`)
            .addFields(
              { name: 'Price', value: formatPrice(stock.price), inline: true },
              { name: 'Change', value: `${arrow} ${formatChange(stock.changePercent)}`, inline: true },
              { name: 'Exchange', value: stock.exchange, inline: true },
            ),
        ],
      });
      return;
    }

    await interaction.editReply({
      embeds: [createErrorEmbed('Not Found', `Could not find data for **${symbol}**. Try specifying \`type: crypto\` or \`type: stock\`.`)],
    });
  },
} satisfies Command;
