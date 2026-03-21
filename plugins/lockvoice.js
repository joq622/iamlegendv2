export default {
    command: 'lockvoice',
    aliases: ['blockvoice'],
    category: 'admin',
    description: 'Block voice notes in the group',
    usage: '.lockvoice <on/off>',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const store = await import('../lib/lightweight_store.js');
        const mode = args[0]?.toLowerCase();
        if (mode === 'on') {
            await store.default.saveSetting(chatId, 'lockvoice', true);
            await sock.sendMessage(chatId, { text: '🎙️ Voice notes are blocked.', ...channelInfo }, { quoted: message });
        } else if (mode === 'off') {
            await store.default.saveSetting(chatId, 'lockvoice', false);
            await sock.sendMessage(chatId, { text: '🎙️ Voice notes are allowed.', ...channelInfo }, { quoted: message });
        } else {
            const locked = await store.default.getSetting(chatId, 'lockvoice');
            await sock.sendMessage(chatId, { text: `Voice notes locked: ${locked ? 'ON' : 'OFF'}`, ...channelInfo }, { quoted: message });
        }
    }
};