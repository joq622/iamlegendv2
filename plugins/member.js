export default {
    command: 'members',
    aliases: ['participants'],
    category: 'group',
    description: 'List all group members (with counts)',
    usage: '.members',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const meta = await sock.groupMetadata(chatId);
        const participants = meta.participants.map(p => p.id);
        const adminCount = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').length;
        const text = `👥 *Group Members*\n\nTotal: ${participants.length}\nAdmins: ${adminCount}\n\n` +
            participants.map((p, i) => `${i+1}. @${p.split('@')[0]}`).join('\n');
        await sock.sendMessage(chatId, { text, mentions: participants, ...channelInfo }, { quoted: message });
    }
};