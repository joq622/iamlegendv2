/*****************************************************************************
 *                                                                           *
 *                     Developed By STANY TZ                                 *
 *                                                                           *
 *  🌐  GitHub   : https://github.com/Stanytz378                             *
 *  ▶️  YouTube  : https://youtube.com/@STANYTZ                              *
 *  💬  WhatsApp : https://whatsapp.com/channel/0029Vb7fzu4EwEjmsD4Tzs1p     *
 *                                                                           *
 *    © 2026 STANY TZ. All rights reserved.                                 *
 *                                                                           *
 *    Description: Baileys mock objects for testing (ᴵ ᴬᴹ ᴸᴱᴳᴱᴺᴰ Bot)       *
 *                                                                           *
 ***************************************************************************/

import { vi } from 'vitest';

export function createMockSock(overrides = {}) {
    const sent = [];
    const blocked = [];

    const sock = {
        sendMessage: vi.fn(async (jid, content, opts) => {
            sent.push({ jid, content, opts });
            return { key: { id: `mock-${Date.now()}`, remoteJid: jid } };
        }),
        groupMetadata: vi.fn(async (jid) => ({
            id: jid,
            subject: 'Test Group',
            owner: '255618558502@s.whatsapp.net',
            participants: [
                { id: '255618558502@s.whatsapp.net', admin: 'superadmin' },
                { id: '255619999999@s.whatsapp.net', admin: 'admin' },
                { id: '255618111111@s.whatsapp.net', admin: null },
                { id: '255618222222@s.whatsapp.net', admin: null },
            ]
        })),
        groupParticipantsUpdate: vi.fn(async () => ({})),
        groupUpdateSubject: vi.fn(async () => ({})),
        groupLeave: vi.fn(async () => ({})),
        groupInviteCode: vi.fn(async () => 'mock-invite-code'),
        onWhatsApp: vi.fn(async (jid) => [{ exists: true, jid }]),
        updateBlockStatus: vi.fn(async (jid, action) => {
            if (action === 'block') blocked.push(jid);
        }),
        updateProfilePicture: vi.fn(async () => ({})),
        updateProfileStatus: vi.fn(async () => ({})),
        rejectCall: vi.fn(async () => ({})),
        user: {
            id: '255618558502:1@s.whatsapp.net',
            lid: '255618558502:1@lid',
            name: 'ᴵ ᴬᴹ ᴸᴱᴳᴱᴺᴰ'
        },
        store: {
            contacts: {},
            messages: {},
        },
        decodeJid: (jid) => `${jid.split(':')[0]}@s.whatsapp.net`,
        _sent: sent,
        _blocked: blocked,
        _lastMessage: () => sent[sent.length - 1],
        _sentTo: (jid) => sent.filter(s => s.jid === jid),
        _reset: () => { sent.length = 0; blocked.length = 0; },
        ...overrides
    };

    return sock;
}

export function createMockMessage(opts = {}) {
    const isGroup = opts.isGroup !== false;
    const chatId = opts.chatId || (isGroup ? '120363000000000001@g.us' : '255618111111@s.whatsapp.net');
    const senderId = opts.senderId || '255618111111@s.whatsapp.net';

    return {
        key: {
            remoteJid: chatId,
            fromMe: opts.fromMe || false,
            id: `mock-${Math.random().toString(36).slice(2)}`,
            participant: isGroup ? senderId : undefined,
        },
        pushName: opts.pushName || 'Test User',
        messageTimestamp: Math.floor(Date.now() / 1000),
        message: { conversation: opts.text || '' }
    };
}
