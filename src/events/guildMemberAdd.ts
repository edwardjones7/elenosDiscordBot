import { Events, GuildMember, TextChannel } from 'discord.js';
import { ExtendedClient } from '../types';
import { createBaseEmbed } from '../utils/embed.builder';
import { BRAND_COLOR } from '../config/constants';
import { config } from '../config';

export default {
  name: Events.GuildMemberAdd,
  async execute(member: GuildMember, client: ExtendedClient): Promise<void> {
    if (!config.channels.welcome) return;

    const channel = client.channels.cache.get(config.channels.welcome) as TextChannel | undefined;
    if (!channel) return;

    const embed = createBaseEmbed(BRAND_COLOR)
      .setTitle(`Welcome to ${member.guild.name}!`)
      .setDescription(
        `Hey <@${member.id}>, welcome to the **Elenos** community!\n\n` +
        `We're a software agency building high-quality products. Feel free to introduce yourself, ask questions, and explore what we're building.\n\n` +
        `Check out <#${config.channels.techNews ?? 'tech-news'}> for the latest in tech!`,
      )
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: 'Member', value: member.user.tag, inline: true },
        { name: 'Member #', value: `${member.guild.memberCount}`, inline: true },
      );

    await channel.send({ embeds: [embed] });
  },
};
