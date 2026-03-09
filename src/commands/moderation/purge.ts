import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js';
import { Command, CommandCategory, ExtendedClient } from '../../types';
import { createSuccessEmbed, createErrorEmbed } from '../../utils/embed.builder';

export default {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Delete multiple messages at once')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((opt) =>
      opt.setName('count').setDescription('Number of messages to delete (1-100)').setRequired(true).setMinValue(1).setMaxValue(100),
    ),
  category: CommandCategory.Moderation,
  memberPermissions: [PermissionFlagsBits.ManageMessages],
  async execute(interaction: ChatInputCommandInteraction, _client: ExtendedClient): Promise<void> {
    const count = interaction.options.getInteger('count', true);
    const channel = interaction.channel as TextChannel;

    try {
      const deleted = await channel.bulkDelete(count, true);
      await interaction.reply({
        embeds: [createSuccessEmbed('Messages Purged', `Deleted **${deleted.size}** messages.`)],
        ephemeral: true,
      });
    } catch {
      await interaction.reply({
        embeds: [createErrorEmbed('Purge Failed', 'Could not delete messages. They may be older than 14 days.')],
        ephemeral: true,
      });
    }
  },
} satisfies Command;
