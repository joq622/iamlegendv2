export default {
    command: 'approve',
    aliases: ['acceptjoin'],
    category: 'admin',
    description: 'Approve a pending join request',
    usage: '.approve @user',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!target) return sock.sendMessage(chatId, { text: '❌ Mention the user.', ...channelInfo }, { quoted: message });
        await sock.groupParticipantsUpdate(chatId, [target], 'add');
        await sock.sendMessage(chatId, { text: `✅ @${target.split('@')[0]} added to the group.`, mentions: [target], ...channelInfo }, { quoted: message });
    }
};