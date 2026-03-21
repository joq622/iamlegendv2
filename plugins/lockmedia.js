export default {
    command: 'lockmedia',
    aliases: ['blockmedia'],
    category: 'admin',
    description: 'Block media (images, videos, audio) in the group',
    usage: '.lockmedia <on/off>',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const store = await import('../lib/lightweight_store.js');
        const mode = args[0]?.toLowerCase();
        if (mode === 'on') {
            await store.default.saveSetting(chatId, 'lockmedia', true);
            await sock.sendMessage(chatId, { text: '🖼️ Media are now blocked.', ...channelInfo }, { quoted: message });
        } else if (mode === 'off') {
            await store.default.saveSetting(chatId, 'lockmedia', false);
            await sock.sendMessage(chatId, { text: '🖼️ Media are now allowed.', ...channelInfo }, { quoted: message });
        } else {
            const locked = await store.default.getSetting(chatId, 'lockmedia');
            await sock.sendMessage(chatId, { text: `Media locked: ${locked ? 'ON' : 'OFF'}`, ...channelInfo }, { quoted: message });
        }
    }
};