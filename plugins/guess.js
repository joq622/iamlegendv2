export default {
    command: 'guess',
    aliases: ['guessnumber'],
    category: 'games',
    description: 'Guess a number between 1 and 100',
    usage: '.guess <number>',
    groupOnly: true,
    async handler(sock, message, args, context) {
        const { chatId, channelInfo, senderId } = context;
        const guess = parseInt(args[0]);
        if (isNaN(guess) || guess < 1 || guess > 100) return sock.sendMessage(chatId, { text: '❌ Guess a number 1-100.', ...channelInfo }, { quoted: message });
        const store = await import('../lib/lightweight_store.js');
        let secret = await store.default.getSetting(chatId, `secret_${senderId}`);
        if (!secret) {
            secret = Math.floor(Math.random() * 100) + 1;
            await store.default.saveSetting(chatId, `secret_${senderId}`, secret);
            await sock.sendMessage(chatId, { text: '🎲 New game! Guess a number 1-100.', ...channelInfo }, { quoted: message });
        } else {
            if (guess === secret) {
                await sock.sendMessage(chatId, { text: `🎉 Correct! The number was ${secret}.`, ...channelInfo }, { quoted: message });
                await store.default.saveSetting(chatId, `secret_${senderId}`, null);
            } else if (guess < secret) {
                await sock.sendMessage(chatId, { text: `📈 Too low! Try again.`, ...channelInfo }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, { text: `📉 Too high! Try again.`, ...channelInfo }, { quoted: message });
            }
        }
    }
};