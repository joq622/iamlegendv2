import store from '../lib/lightweight_store.js';

const lastMessageTime = new Map(); // chatId_userId -> timestamp

async function setSlowMode(chatId, seconds) {
    await store.saveSetting(chatId, 'slowmode', seconds);
}

async function getSlowMode(chatId) {
    return await store.getSetting(chatId, 'slowmode') || 0;
}

async function removeSlowMode(chatId) {
    await store.saveSetting(chatId, 'slowmode', 0);
}

export async function handleSlowMode(sock, chatId, message, userMessage, senderId) {
    const seconds = await getSlowMode(chatId);
    if (seconds <= 0) return;

    const key = `${chatId}_${senderId}`;
    const last = lastMessageTime.get(key) || 0;
    const now = Date.now();
    if (now - last < seconds * 1000) {
        // Delete the message and optionally warn
        try {
            await sock.sendMessage(chatId, {
                delete: { remoteJid: chatId, fromMe: false, id: message.key.id, participant: senderId }
            });
        } catch (e) {}
        await sock.sendMessage(chatId, {
            text: `⏱️ *Slow Mode*: Please wait ${seconds} seconds between messages.`,
            mentions: [senderId]
        });
        return true; // message was blocked
    }
    lastMessageTime.set(key, now);
    return false;
}

export default {
    command: 'slowmode',
    aliases: ['slow'],
    category: 'admin',
    description: 'Limit message frequency (seconds between messages)',
    usage: '.slowmode <seconds>',
    groupOnly: true,
    adminOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const seconds = parseInt(args[0]);
        if (isNaN(seconds) || seconds < 0) {
            const current = await getSlowMode(chatId);
            return sock.sendMessage(chatId, {
                text: `⏱️ *Slow Mode*\n\nCurrent: ${current}s\nUsage: .slowmode <seconds>` });
        }
        if (seconds === 0) {
            await removeSlowMode(chatId);
            return sock.sendMessage(chatId, { text: '❌ Slow mode disabled.' });
        }
        await setSlowMode(chatId, seconds);
        return sock.sendMessage(chatId, { text: `✅ Slow mode set to ${seconds}s.` });
    },
    handleSlowMode,
    setSlowMode,
    getSlowMode,
    removeSlowMode
};