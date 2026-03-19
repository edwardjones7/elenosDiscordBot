import { Events, Message, TextChannel } from 'discord.js';
import { ExtendedClient } from '../types';
import { runPipeline } from '../services/moderation.service';
import { addWarning } from '../services/warning.service';
import { createWarningEmbed } from '../utils/embed.builder';
import { claudeService } from '../services/claude.service';
import { config } from '../config';
import { logger } from '../utils/logger';

const log = logger.child({ event: 'messageCreate' });

export default {
  name: Events.MessageCreate,
  async execute(message: Message, client: ExtendedClient): Promise<void> {
    if (message.author.bot || !message.guild) return;

    // Respond only when the bot is directly @mentioned (not @everyone / @here)
    if (client.user && message.mentions.users.has(client.user.id)) {
      const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
      if (prompt) {
        await message.channel.sendTyping().catch(() => null);
        const reply = await claudeService.generateResponse(prompt);
        await message.reply(reply).catch(() => null);
      }
    }

    const action = await runPipeline(message);
    if (!action) return;

    try {
      await message.delete();
    } catch {
      // Message may already be deleted
    }

    const { warning, shouldBan } = addWarning(
      message.guild.id,
      message.author.id,
      client.user?.id ?? 'bot',
      action.reason,
    );

    // DM the user
    await message.author
      .send({
        embeds: [
          createWarningEmbed(
            'Message Removed',
            `Your message in **${message.guild.name}** was removed.\n**Reason:** ${action.reason}`,
          ),
        ],
      })
      .catch(() => null);

    // Log to mod channel
    if (config.channels.modLogs) {
      const modChannel = client.channels.cache.get(config.channels.modLogs) as TextChannel | undefined;
      if (modChannel) {
        await modChannel.send({
          embeds: [
            createWarningEmbed(
              'Auto-Moderation Action',
              `**User:** <@${message.author.id}> (${message.author.tag})\n**Reason:** ${action.reason}\n**Warning #${warning.id}**`,
            ),
          ],
        });
      }
    }

    if (shouldBan) {
      try {
        await message.guild.members.ban(message.author.id, { reason: `Maximum warnings reached (${action.reason})` });
        log.info({ userId: message.author.id }, 'User banned after reaching max warnings');
      } catch (err) {
        log.error({ err, userId: message.author.id }, 'Failed to ban user');
      }
    }
  },
};
