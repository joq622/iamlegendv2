import store from '../lib/lightweight_store.js';
import isOwnerOrSudo from '../lib/isOwner.js';
import isAdmin from '../lib/isAdmin.js';

const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;

async function setAntiEmail(chatId, enabled, action = 'delete') {
    await store.saveSetting(chatId, 'antiemail', { enabled, action });
}

async function getAntiEmail(chatId) {
    return await store.getSetting(chatId, 'antiemail') || { enabled: false, action: 'delete' };
}

async function removeAntiEmail(chatId) {
    await store.saveSetting(chatId, 'antiemail', { enabled: false, action: null });
}

export async function handleAntiEmail(sock, chatId, message, userMessage, senderId) {
    const config = await getAntiEmail(chatId);
    if (!config.enabled) return;

    const isOwnerSudo = await isOwnerOrSudo(senderId, sock, chatId);
    if (isOwnerSudo) return;
    try {
        const { isSenderAdmin } = await isAdmin(sock, chatId, senderId);
        if (isSenderAdmin) return;
    } catch (e) {}

    if (!emailRegex.test(userMessage)) return;

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
            text: `⚠️ *Anti‑Email Warning*\n\n@${senderId.split('@')[0]}, sharing email addresses is not allowed!`,
            mentions: [senderId]
        });
    }

    if (action === 'kick') {
        try {
            await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
            await sock.sendMessage(chatId, {
                text: `🚫 @${senderId.split('@')[0]} removed for sharing email.`,
                mentions: [senderId]
            });
        } catch (e) {}
    }
}

export default {
    command: 'antiemail',
    aliases: ['blockemail'],
    category: 'admin',
    description: 'Block messages containing email addresses',
    usage: '.antiemail <on|off|set delete|warn|kick>',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const action = args[0]?.toLowerCase();

        if (!action) {
            const config = await getAntiEmail(chatId);
            return sock.sendMessage(chatId, {
                text: `*📧 ANTI‑EMAIL SETUP*\n\n` +
                    `*Status:* ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
                    `*Action:* ${config.action || 'Not set'}\n\n` +
                    `*Commands:*\n` +
                    `• \`.antiemail on\` - Enable\n` +
                    `• \`.antiemail off\` - Disable\n` +
                    `• \`.antiemail set delete|warn|kick\``
            }, { quoted: message });
        }

        switch (action) {
            case 'on':
                if ((await getAntiEmail(chatId)).enabled) return sock.sendMessage(chatId, { text: '⚠️ Already enabled.' });
                await setAntiEmail(chatId, true, 'delete');
                return sock.sendMessage(chatId, { text: '✅ Anti‑email enabled.' });
            case 'off':
                await removeAntiEmail(chatId);
                return sock.sendMessage(chatId, { text: '❌ Anti‑email disabled.' });
            case 'set':
                const sub = args[1]?.toLowerCase();
                if (!['delete', 'warn', 'kick'].includes(sub)) return sock.sendMessage(chatId, { text: '❌ Use delete, warn, or kick.' });
                await setAntiEmail(chatId, true, sub);
                return sock.sendMessage(chatId, { text: `✅ Action set to ${sub}.` });
            default:
                return sock.sendMessage(chatId, { text: '❌ Invalid command.' });
        }
    },
    handleAntiEmail,
    setAntiEmail,
    getAntiEmail,
    removeAntiEmail
};