import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { addWarning } from '../../services/warning.service';
import { createSuccessEmbed, createWarningEmbed } from '../../utils/embed.builder';
import { config } from '../../config';

export default {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) => opt.setName('user').setDescription('User to warn').setRequired(true))
    .addStringOption((opt) =>
      opt.setName('reason').setDescription('Reason for the warning').setRequired(true).setMaxLength(200),
    ),
  category: CommandCategory.Moderation,
  memberPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction: ChatInputCommandInteraction, client: ExtendedClient): Promise<void> {
    const target = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason', true);

    if (!interaction.guildId) return;

    const { warning, shouldBan } = addWarning(
      interaction.guildId,
      target.id,
      interaction.user.id,
      reason,
    );

    await target.send({
      embeds: [createWarningEmbed(`Warning in ${interaction.guild?.name}`, `**Reason:** ${reason}`)],
    }).catch(() => null);

    if (config.channels.modLogs) {
      const modChannel = client.channels.cache.get(config.channels.modLogs) as TextChannel | undefined;
      await modChannel?.send({
        embeds: [
          createWarningEmbed(
            'User Warned',
            `**User:** <@${target.id}>\n**Moderator:** <@${interaction.user.id}>\n**Reason:** ${reason}\n**Warning #${warning.id}**`,
          ),
        ],
      });
    }

    if (shouldBan && interaction.guild) {
      await interaction.guild.members.ban(target.id, { reason: `Max warnings reached: ${reason}` });
      await interaction.reply({
        embeds: [createWarningEmbed('User Banned', `<@${target.id}> has reached the maximum number of warnings and has been banned.`)],
      });
      return;
    }

    await interaction.reply({
      embeds: [createSuccessEmbed('Warning Issued', `<@${target.id}> has been warned.\n**Reason:** ${reason}`)],
    });
  },
} satisfies Command;
