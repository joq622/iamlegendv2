import store from '../lib/lightweight_store.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QUOTES_FILE = path.join(process.cwd(), 'data', 'quotes.json');

// Default quotes if file doesn't exist
const DEFAULT_QUOTES = [
    "💎 By IAMLEGEND - Your WhatsApp Bot",
    "🌟 Stay positive, work hard, make it happen.",
    "✨ Believe in yourself and all that you are.",
    "🚀 The future belongs to those who believe in the beauty of their dreams.",
    "💪 Success is not final, failure is not fatal.",
    "🎯 Dream big, work hard, stay focused.",
    "⭐ Every day is a new beginning.",
    "🌈 Be the reason someone smiles today."
];

let cachedQuotes = [];
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Load quotes from local JSON file.
 */
function loadQuotesFromFile() {
    try {
        if (fs.existsSync(QUOTES_FILE)) {
            const data = fs.readFileSync(QUOTES_FILE, 'utf8');
            const quotes = JSON.parse(data);
            if (Array.isArray(quotes) && quotes.length) {
                return quotes;
            }
        }
        // Create default file if missing
        fs.writeFileSync(QUOTES_FILE, JSON.stringify(DEFAULT_QUOTES, null, 2));
        return DEFAULT_QUOTES;
    } catch (error) {
        console.error('Error loading quotes file:', error);
        return DEFAULT_QUOTES;
    }
}

async function fetchQuotes() {
    try {
        if (cachedQuotes.length > 0 && Date.now() - lastFetchTime < CACHE_DURATION) {
            return cachedQuotes;
        }
        const quotes = loadQuotesFromFile();
        cachedQuotes = quotes;
        lastFetchTime = Date.now();
        return quotes;
    } catch (error) {
        return cachedQuotes.length > 0 ? cachedQuotes : DEFAULT_QUOTES;
    }
}

function getRandomQuote(quotes) {
    if (!quotes || quotes.length === 0) return '💎 By IAMLEGEND';
    return quotes[Math.floor(Math.random() * quotes.length)];
}

async function updateAutoBio(sock) {
    try {
        const autoBioSettings = await store.getSetting('global', 'autoBio');
        if (!autoBioSettings?.enabled) return;

        const quotes = await fetchQuotes();
        const randomQuote = getRandomQuote(quotes);

        let bio;
        if (autoBioSettings.customBio) {
            bio = autoBioSettings.customBio.replace('{quote}', randomQuote);
        } else {
            bio = `${randomQuote}\n\n💎 IAMLEGEND V2`;
        }

        if (bio.length > 139) {
            bio = `${bio.substring(0, 136)}...`;
        }

        await sock.updateProfileStatus(bio);
    } catch (error) {
        // Silently fail
    }
}

let autoBioInterval = null;

export function startAutoBio(sock) {
    if (autoBioInterval) return;
    fetchQuotes().then(() => {});
    autoBioInterval = setInterval(() => {
        updateAutoBio(sock);
    }, 10 * 60 * 1000); // every 10 minutes
    updateAutoBio(sock);
}

function stopAutoBio() {
    if (autoBioInterval) {
        clearInterval(autoBioInterval);
        autoBioInterval = null;
    }
}

export default {
    command: 'setbio',
    aliases: ['autobio', 'bio'],
    category: 'owner',
    description: 'Set custom WhatsApp bio with random quotes from local file',
    usage: '.setbio <on|off|set|reset|reload|preview>',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const action = args[0]?.toLowerCase();

        try {
            const autoBioSettings = await store.getSetting('global', 'autoBio') || { enabled: false, customBio: null };
            const quotes = await fetchQuotes();

            if (!action) {
                return await sock.sendMessage(chatId, {
                    text: `*📝 AUTO BIO SETTINGS*\n\n` +
                        `*Status:* ${autoBioSettings.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
                        `*Custom Bio:* ${autoBioSettings.customBio ? 'Set' : 'Default'}\n` +
                        `*Quotes Loaded:* ${quotes.length}\n` +
                        `*Update Interval:* Every 10 minutes\n\n` +
                        `*Commands:*\n` +
                        `• \`.setbio on\` - Enable auto bio\n` +
                        `• \`.setbio off\` - Disable auto bio\n` +
                        `• \`.setbio set <text>\` - Set custom bio\n` +
                        `• \`.setbio reset\` - Reset to default bio\n` +
                        `• \`.setbio reload\` - Reload quotes from file\n` +
                        `• \`.setbio preview\` - Preview random quote\n\n` +
                        `*Default Bio:*\n{quote}\n💎 IAMLEGEND V2\n\n` +
                        `*Custom Bio:*\n${autoBioSettings.customBio || 'Not set'}\n\n` +
                        `*Note:* Use \`{quote}\` in custom bio to insert random quotes.\n\n` +
                        `*Quotes file:* \`data/quotes.json\` – edit it to manage your own quotes.`
                }, { quoted: message });
            }

            if (action === 'preview') {
                const randomQuote = getRandomQuote(quotes);
                return await sock.sendMessage(chatId, {
                    text: `*📝 Preview Quote*\n\n${randomQuote}\n\n💎 IAMLEGEND V2\n\n_This is how your bio will look with random quotes_`
                }, { quoted: message });
            }

            if (action === 'reload') {
                // Force reload from disk
                try {
                    const newQuotes = loadQuotesFromFile();
                    cachedQuotes = newQuotes;
                    lastFetchTime = Date.now(); // reset cache time
                    await sock.sendMessage(chatId, {
                        text: `✅ *Quotes reloaded!* ${newQuotes.length} quotes loaded.`
                    }, { quoted: message });
                } catch (e) {
                    await sock.sendMessage(chatId, {
                        text: `❌ Failed to reload quotes: ${e.message}`
                    }, { quoted: message });
                }
                return;
            }

            if (action === 'on') {
                if (autoBioSettings.enabled) {
                    return await sock.sendMessage(chatId, {
                        text: '⚠️ *Auto bio is already enabled*'
                    }, { quoted: message });
                }
                autoBioSettings.enabled = true;
                await store.saveSetting('global', 'autoBio', autoBioSettings);
                startAutoBio(sock);
                return await sock.sendMessage(chatId, {
                    text: '✅ *Auto bio enabled!*\n\nYour bio will now update every 10 minutes with random quotes from your local quotes file.'
                }, { quoted: message });
            }

            if (action === 'off') {
                if (!autoBioSettings.enabled) {
                    return await sock.sendMessage(chatId, {
                        text: '⚠️ *Auto bio is already disabled*'
                    }, { quoted: message });
                }
                autoBioSettings.enabled = false;
                await store.saveSetting('global', 'autoBio', autoBioSettings);
                stopAutoBio();
                return await sock.sendMessage(chatId, {
                    text: '❌ *Auto bio disabled!*\n\nYour bio will no longer auto-update.'
                }, { quoted: message });
            }

            if (action === 'set') {
                let customBio = null;
                const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                if (quoted) {
                    customBio = quoted.conversation ||
                        quoted.extendedTextMessage?.text ||
                        null;
                } else {
                    customBio = args.slice(1).join(' ').trim();
                }

                if (!customBio) {
                    return await sock.sendMessage(chatId, {
                        text: '❌ *Please provide bio text!*\n\n*Usage:*\n• `.setbio set Your bio here`\n• Reply to a message with `.setbio set`\n\n*Tip:* Use `{quote}` to insert random quotes in your bio.'
                    }, { quoted: message });
                }

                autoBioSettings.customBio = customBio;
                await store.saveSetting('global', 'autoBio', autoBioSettings);
                if (autoBioSettings.enabled) {
                    await updateAutoBio(sock);
                }
                return await sock.sendMessage(chatId, {
                    text: `✅ *Custom bio set!*\n\n*Your bio:*\n${customBio}\n\n${autoBioSettings.enabled ? '✅ Auto bio is enabled - Bio updated!' : '⚠️ Auto bio is disabled - Use `.setbio on` to enable'}`
                }, { quoted: message });
            }

            if (action === 'reset') {
                autoBioSettings.customBio = null;
                await store.saveSetting('global', 'autoBio', autoBioSettings);
                if (autoBioSettings.enabled) {
                    await updateAutoBio(sock);
                }
                return await sock.sendMessage(chatId, {
                    text: '✅ *Bio reset to default!*\n\n*Default bio:*\n{quote}\n💎 IAMLEGEND V2'
                }, { quoted: message });
            }

            return await sock.sendMessage(chatId, {
                text: '❌ *Invalid command!*\n\nUse `.setbio` to see available options.'
            }, { quoted: message });
        } catch (error) {
            console.error('SetBio Error:', error);
            await sock.sendMessage(chatId, {
                text: `❌ *Error:* ${error.message}`
            }, { quoted: message });
        }
    },
    startAutoBio,
    stopAutoBio,
    updateAutoBio
};