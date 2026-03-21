export default {
    command: 'announce',
    aliases: ['announcement'],
    category: 'admin',
    description: 'Send an announcement to the group (mentions all)',
    usage: '.announce <message>',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const text = args.join(' ');
        if (!text) return sock.sendMessage(chatId, { text: '❌ Provide a message.', ...channelInfo }, { quoted: message });
        const groupMeta = await sock.groupMetadata(chatId);
        const participants = groupMeta.participants.map(p => p.id);
        await sock.sendMessage(chatId, { text, mentions: participants, ...channelInfo }, { quoted: message });
    }
};