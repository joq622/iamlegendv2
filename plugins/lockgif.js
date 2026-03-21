export default {
    command: 'lockgif',
    aliases: ['blockgif'],
    category: 'admin',
    description: 'Block GIFs in the group',
    usage: '.lockgif <on/off>',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const store = await import('../lib/lightweight_store.js');
        const mode = args[0]?.toLowerCase();
        if (mode === 'on') {
            await store.default.saveSetting(chatId, 'lockgif', true);
            await sock.sendMessage(chatId, { text: '🎞️ GIFs are blocked.', ...channelInfo }, { quoted: message });
        } else if (mode === 'off') {
            await store.default.saveSetting(chatId, 'lockgif', false);
            await sock.sendMessage(chatId, { text: '🎞️ GIFs are allowed.', ...channelInfo }, { quoted: message });
        } else {
            const locked = await store.default.getSetting(chatId, 'lockgif');
            await sock.sendMessage(chatId, { text: `GIFs locked: ${locked ? 'ON' : 'OFF'}`, ...channelInfo }, { quoted: message });
        }
    }
};