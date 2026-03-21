import store from '../lib/lightweight_store.js';

export default {
    command: 'unmuteuser',
    aliases: ['unsilence'],
    category: 'admin',
    description: 'Unmute a user in the group',
    usage: '.unmuteuser @user',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const target = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!target) return sock.sendMessage(chatId, { text: '❌ Mention the user.', ...channelInfo }, { quoted: message });
        let muted = await store.getSetting(chatId, 'mutedUsers') || [];
        const index = muted.indexOf(target);
        if (index !== -1) {
            muted.splice(index, 1);
            await store.saveSetting(chatId, 'mutedUsers', muted);
            await sock.sendMessage(chatId, { text: `🔊 @${target.split('@')[0]} unmuted.`, mentions: [target], ...channelInfo }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text: `⚠️ Not muted.`, ...channelInfo }, { quoted: message });
        }
    }
};