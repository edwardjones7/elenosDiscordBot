import { Events, GuildMember, TextChannel } from 'discord.js';
import { ExtendedClient } from '../types';
import { createBaseEmbed } from '../utils/embed.builder';
import { BRAND_COLOR } from '../config/constants';
import { config } from '../config';
import { logger } from '../utils/logger';

const log = logger.child({ event: 'guildMemberAdd' });

export default {
  name: Events.GuildMemberAdd,
  async execute(member: GuildMember, _client: ExtendedClient): Promise<void> {
    const embed = createBaseEmbed(BRAND_COLOR)
      .setTitle(`Welcome to ${member.guild.name}`)
      .setDescription(
        `Hey <@${member.id}>, glad you're here.\n\n` +
        `**Elenos AI** builds scalable digital systems, AI operators, and automation tools. ` +
        `This is where we share what we're building, drop tech news, and talk systems.\n\n` +
        `Use \`/ask\` to ask anything about Elenos, \`/summarize\` to break down any article, ` +
        `or just @ the bot to chat.`,
      )
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'Member', value: `<@${member.id}>`, inline: true },
        { name: 'Member #', value: `${member.guild.memberCount}`, inline: true },
      );

    // 1. Try configured welcome channel
    if (config.channels.welcome) {
      const channel = _client.channels.cache.get(config.channels.welcome) as TextChannel | undefined;
      if (channel) {
        await channel.send({ embeds: [embed] }).catch((err) =>
          log.warn({ err }, 'Failed to send welcome to configured channel'),
        );
        return;
      }
    }

    // 2. Fall back to guild system channel
    const systemChannel = member.guild.systemChannel;
    if (systemChannel) {
      await systemChannel.send({ embeds: [embed] }).catch((err) =>
        log.warn({ err }, 'Failed to send welcome to system channel'),
      );
      return;
    }

    // 3. Final fallback: DM the user
    await member.user
      .send({ embeds: [embed] })
      .catch((err) => log.warn({ err, userId: member.id }, 'Failed to DM welcome to new member'));
  },
};
