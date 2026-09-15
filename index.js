const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`البوت اشتغل: ${client.user.tag}`);
});

// أمر إنشاء لوحة التذاكر
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!ticket') {
    const button = new ButtonBuilder()
      .setCustomId('open_ticket')
      .setLabel('🎫 فتح تذكرة')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await message.channel.send({
      content: '🎫 **نظام التذاكر**\nاضغط الزر بالأسفل لفتح تذكرة خاصة.',
      components: [row]
    });
  }
});

// فتح التذكرة
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== 'open_ticket') return;

  const existingChannel = interaction.guild.channels.cache.find(
    channel => channel.name === `ticket-${interaction.user.id}`
  );

  if (existingChannel) {
    return interaction.reply({
      content: `عندك تذكرة مفتوحة بالفعل: ${existingChannel}`,
      ephemeral: true
    });
  }

  const channel = await interaction.guild.channels.create({
    name: `ticket-${interaction.user.id}`,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      {
        id: interaction.guild.roles.everyone.id,
        deny: [PermissionsBitField.Flags.ViewChannel]
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory
        ]
      },
      {
        id: client.user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
          PermissionsBitField.Flags.ManageChannels
        ]
      }
    ]
  });

  await interaction.reply({
    content: `تم فتح تذكرتك: ${channel}`,
    ephemeral: true
  });

  await channel.send(
    `🎫 **أهلًا ${interaction.user}**\n\nاكتب مشكلتك أو طلبك هنا، وسيتم الرد عليك من الإدارة.`
  );
});

client.login(process.env.DISCORD_TOKEN);
