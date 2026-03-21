import store from '../lib/lightweight_store.js';

export default {
    command: 'grouplang',
    aliases: ['lang'],
    category: 'admin',
    description: 'Set group language (en, sw, etc.)',
    usage: '.grouplang <code>',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const lang = args[0]?.toLowerCase();
        if (!lang) return sock.sendMessage(chatId, { text: '❌ Provide language code (en, sw).', ...channelInfo }, { quoted: message });
        await store.saveSetting(chatId, 'lang', lang);
        await sock.sendMessage(chatId, { text: `✅ Group language set to ${lang}.`, ...channelInfo }, { quoted: message });
    }
};