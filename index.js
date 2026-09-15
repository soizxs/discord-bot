const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  AttachmentBuilder
} = require('discord.js');
const path = require('path');

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

// الترحيب عند دخول عضو جديد
client.on('guildMemberAdd', async (member) => {
  const welcomeChannel = member.guild.channels.cache.find(
    channel =>  channel.name === 'welcome-👋'
  );

  if (!welcomeChannel) {
    console.log(' welcome-👋');
    return;
  }

  const imagePath = path.join(__dirname, 'welcome.png');
  const attachment = new AttachmentBuilder(imagePath);

  await welcomeChannel.send({
    content: `👋 **حياك الله ${member} في السيرفر!**\nنتمنى لك وقت ممتع معنا ❤️`,
    files: [attachment]
  });
});

// أمر التذاكر
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

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'open_ticket') {
    const existingChannel = interaction.guild.channels.cache.find(
      channel => channel.name === `ticket-${interaction.user.id}`
    );

    if (existingChannel) {
      return interaction.reply({
        content: `عندك تذكرة مفتوحة بالفعل: ${existingChannel}`,
        ephemeral: true
      });
    }

    const supportRole = interaction.guild.roles.cache.find(
      role => role.name.toLowerCase() === 'support'
    );

    if (!supportRole) {
      return interaction.reply({
        content: '❌ ما لقيت رتبة Support في السيرفر.',
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
          id: supportRole.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
            PermissionsBitField.Flags.ManageMessages
          ]
        },
        {
          id: client.user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory,
            PermissionsBitField.Flags.ManageChannels,
            PermissionsBitField.Flags.ManageMessages
          ]
        }
      ]
    });

    const closeButton = new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('🔒 إغلاق التذكرة')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(closeButton);

    await interaction.reply({
      content: `تم فتح تذكرتك: ${channel}`,
      ephemeral: true
    });

    await channel.send({
      content: `🎫 **أهلًا ${interaction.user}**\n\nاكتب مشكلتك أو طلبك هنا، وسيتم الرد عليك من الإدارة.`,
      components: [row]
    });
  }

  if (interaction.customId === 'close_ticket') {
    await interaction.reply('🔒 سيتم إغلاق التذكرة خلال 3 ثواني...');

    setTimeout(async () => {
      try {
        await interaction.channel.delete();
      } catch (error) {
        console.error('خطأ في إغلاق التذكرة:', error);
      }
    }, 3000);
  }
});

client.login(process.env.DISCORD_TOKEN);
