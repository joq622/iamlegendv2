import store from '../lib/lightweight_store.js';
import isOwnerOrSudo from '../lib/isOwner.js';
import isAdmin from '../lib/isAdmin.js';

async function setAntiVoice(chatId, enabled, action = 'delete') {
    await store.saveSetting(chatId, 'antivoice', { enabled, action });
}

async function getAntiVoice(chatId) {
    return await store.getSetting(chatId, 'antivoice') || { enabled: false, action: 'delete' };
}

async function removeAntiVoice(chatId) {
    await store.saveSetting(chatId, 'antivoice', { enabled: false, action: null });
}

export async function handleAntiVoice(sock, chatId, message, senderId) {
    const config = await getAntiVoice(chatId);
    if (!config.enabled) return;

    const isOwnerSudo = await isOwnerOrSudo(senderId, sock, chatId);
    if (isOwnerSudo) return;
    try {
        const { isSenderAdmin } = await isAdmin(sock, chatId, senderId);
        if (isSenderAdmin) return;
    } catch (e) {}

    if (!message.message?.audioMessage) return;

    const action = config.action || 'delete';
    const messageId = message.key.id;
    const participant = message.key.participant || senderId;

    if (action === 'delete' || action === 'kick') {
        try {
            await sock.sendMessage(chatId, {
                delete: { remoteJid: chatId, fromMe: false, id: messageId, participant }
            });
        } catch (e) {}
    }

    if (action === 'warn' || action === 'delete') {
        await sock.sendMessage(chatId, {
            text: `⚠️ *Anti‑Voice Warning*\n\n@${senderId.split('@')[0]}, voice notes are not allowed!`,
            mentions: [senderId]
        });
    }

    if (action === 'kick') {
        try {
            await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
            await sock.sendMessage(chatId, {
                text: `🚫 @${senderId.split('@')[0]} removed for sending a voice note.`,
                mentions: [senderId]
            });
        } catch (e) {}
    }
}

export default {
    command: 'antivoice',
    aliases: ['blockvoice'],
    category: 'admin',
    description: 'Block voice notes',
    usage: '.antivoice <on|off|set delete|warn|kick>',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const action = args[0]?.toLowerCase();

        if (!action) {
            const config = await getAntiVoice(chatId);
            return sock.sendMessage(chatId, {
                text: `*🎙️ ANTI‑VOICE SETUP*\n\n` +
                    `*Status:* ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
                    `*Action:* ${config.action || 'Not set'}\n\n` +
                    `*Commands:*\n` +
                    `• \`.antivoice on\` - Enable\n` +
                    `• \`.antivoice off\` - Disable\n` +
                    `• \`.antivoice set delete|warn|kick\``
            }, { quoted: message });
        }

        switch (action) {
            case 'on':
                if ((await getAntiVoice(chatId)).enabled) return sock.sendMessage(chatId, { text: '⚠️ Already enabled.' });
                await setAntiVoice(chatId, true, 'delete');
                return sock.sendMessage(chatId, { text: '✅ Anti‑voice enabled.' });
            case 'off':
                await removeAntiVoice(chatId);
                return sock.sendMessage(chatId, { text: '❌ Anti‑voice disabled.' });
            case 'set':
                const sub = args[1]?.toLowerCase();
                if (!['delete', 'warn', 'kick'].includes(sub)) return sock.sendMessage(chatId, { text: '❌ Use delete, warn, or kick.' });
                await setAntiVoice(chatId, true, sub);
                return sock.sendMessage(chatId, { text: `✅ Action set to ${sub}.` });
            default:
                return sock.sendMessage(chatId, { text: '❌ Invalid command.' });
        }
    },
    handleAntiVoice,
    setAntiVoice,
    getAntiVoice,
    removeAntiVoice
};