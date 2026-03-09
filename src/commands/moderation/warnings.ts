import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { getUserWarnings } from '../../services/warning.service';
import { createBaseEmbed, createInfoEmbed } from '../../utils/embed.builder';
import { BRAND_COLOR } from '../../config/constants';

export default {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('View warnings for a user')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) => opt.setName('user').setDescription('User to check').setRequired(true)),
  category: CommandCategory.Moderation,
  memberPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction: ChatInputCommandInteraction, _client: ExtendedClient): Promise<void> {
    const target = interaction.options.getUser('user', true);
    if (!interaction.guildId) return;

    const warnings = getUserWarnings(interaction.guildId, target.id);

    if (warnings.length === 0) {
      await interaction.reply({
        embeds: [createInfoEmbed('No Warnings', `<@${target.id}> has no warnings.`)],
        ephemeral: true,
      });
      return;
    }

    const embed = createBaseEmbed(BRAND_COLOR)
      .setTitle(`Warnings for ${target.tag}`)
      .setDescription(`Total: **${warnings.length}**`);

    for (const w of warnings.slice(0, 10)) {
      embed.addFields({
        name: `#${w.id} — ${new Date(w.timestamp).toLocaleDateString()}`,
        value: `**Reason:** ${w.reason}\n**By:** <@${w.moderatorId}>`,
      });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
} satisfies Command;
