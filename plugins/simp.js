import config from '../config.js';

export default {
    command: 'simp',
    aliases: ['simpcard'],
    category: 'fun',
    description: 'Generate a simp card for a user',
    usage: '.simp (reply to user or mention someone)',
    async handler(sock, message, args, context) {
        const { chatId, channelInfo } = context;
        const sender = message.key.participant || message.key.remoteJid;
        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;

        const target = quotedMsg
            ? quotedMsg.sender
            : (mentionedJid && mentionedJid[0]) || sender;

        try {
            let avatarUrl;
            try {
                avatarUrl = await sock.profilePictureUrl(target, 'image');
            } catch (error) {
                console.error('Error fetching profile picture:', error);
                avatarUrl = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'; // Default avatar
            }

            // Using the same API – replace with your own endpoint if needed
            const apiUrl = `https://some-random-api.com/canvas/misc/simpcard?avatar=${encodeURIComponent(avatarUrl)}`;
            const response = await fetch(apiUrl, { timeout: 15000 });
            if (!response.ok) throw new Error(`API returned ${response.status}`);

            const imageBuffer = Buffer.from(await response.arrayBuffer());

            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: '👑 *Your religion is simping*',
                ...channelInfo
            }, { quoted: message });
        } catch (error) {
            console.error('Simp Command Error:', error);
            await sock.sendMessage(chatId, {
                text: '❌ Sorry, I couldn\'t generate the simp card. Please try again later!',
                ...channelInfo
            }, { quoted: message });
        }
    }
};