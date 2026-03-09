import { Events, Interaction, PermissionFlagsBits } from 'discord.js';
import { ExtendedClient } from '../types';
import { DEFAULT_COOLDOWN_SECONDS } from '../config/constants';
import { CooldownManager } from '../utils/cooldown';
import { createErrorEmbed } from '../utils/embed.builder';
import { logger } from '../utils/logger';

const log = logger.child({ event: 'interactionCreate' });

export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction, client: ExtendedClient): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      log.warn({ name: interaction.commandName }, 'Unknown command');
      return;
    }

    // Permission checks
    if (command.memberPermissions?.length && interaction.inGuild()) {
      const member = interaction.guild?.members.cache.get(interaction.user.id);
      const missing = command.memberPermissions.filter(
        (p) => !member?.permissions.has(p),
      );
      if (missing.length > 0) {
        await interaction.reply({
          embeds: [createErrorEmbed('Missing Permissions', 'You do not have permission to use this command.')],
          ephemeral: true,
        });
        return;
      }
    }

    // Cooldown check
    const cooldownSeconds = command.cooldown ?? DEFAULT_COOLDOWN_SECONDS;
    const cm = new CooldownManager(client.cooldowns);
    const { onCooldown, remainingMs } = cm.check(command.data.name, interaction.user.id, cooldownSeconds);

    if (onCooldown) {
      const secs = (remainingMs / 1000).toFixed(1);
      await interaction.reply({
        embeds: [createErrorEmbed('Cooldown', `Please wait **${secs}s** before using \`/${command.data.name}\` again.`)],
        ephemeral: true,
      });
      return;
    }

    cm.set(command.data.name, interaction.user.id);

    try {
      await command.execute(interaction, client);
    } catch (err) {
      log.error({ err, command: interaction.commandName }, 'Command execution error');
      const errorEmbed = createErrorEmbed('Command Error', 'Something went wrong. Please try again.');

      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed] });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  },
};
