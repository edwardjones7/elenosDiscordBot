import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
} from 'discord.js';

export async function paginate(
  interaction: ChatInputCommandInteraction,
  pages: EmbedBuilder[],
  timeout = 300_000,
): Promise<void> {
  if (pages.length === 0) return;

  if (pages.length === 1) {
    await interaction.editReply({ embeds: [pages[0]] });
    return;
  }

  let current = 0;

  const prev = new ButtonBuilder().setCustomId('prev').setLabel('◀').setStyle(ButtonStyle.Secondary);
  const next = new ButtonBuilder().setCustomId('next').setLabel('▶').setStyle(ButtonStyle.Secondary);
  const pageIndicator = new ButtonBuilder()
    .setCustomId('page')
    .setLabel(`${current + 1} / ${pages.length}`)
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(prev, pageIndicator, next);

  const reply = (await interaction.editReply({ embeds: [pages[current]], components: [row] })) as Message;

  const collector = reply.createMessageComponentCollector({ time: timeout });

  collector.on('collect', async (btn) => {
    if (btn.user.id !== interaction.user.id) {
      await btn.reply({ content: 'These buttons are not for you.', ephemeral: true });
      return;
    }

    if (btn.customId === 'prev') current = current === 0 ? pages.length - 1 : current - 1;
    if (btn.customId === 'next') current = current === pages.length - 1 ? 0 : current + 1;

    pageIndicator.setLabel(`${current + 1} / ${pages.length}`);

    await btn.update({ embeds: [pages[current]], components: [row] });
  });

  collector.on('end', async () => {
    prev.setDisabled(true);
    next.setDisabled(true);
    await interaction.editReply({ components: [row] }).catch(() => null);
  });
}
