import store from '../lib/lightweight_store.js';

export default {
    command: 'lockall',
    aliases: ['maxlock'],
    category: 'admin',
    description: 'Lock everything (links, media, stickers, etc.)',
    usage: '.lockall',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const locks = ['locklinks', 'lockmedia', 'lockstickers', 'lockmentions', 'lockforward', 'lockvoice', 'lockpolls', 'lockcontact', 'locklocation', 'lockgif', 'lockreact'];
        for (const lock of locks) {
            await store.saveSetting(chatId, lock, true);
        }
        await sock.sendMessage(chatId, { text: '🔒 All message types are now locked.', ...channelInfo }, { quoted: message });
    }
};