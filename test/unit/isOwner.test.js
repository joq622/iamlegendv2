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
 *    Description: Unit tests for owner/sudo utilities (ᴵ ᴬᴹ ᴸᴱᴳᴱᴺᴰ Bot)    *
 *                                                                           *
 ***************************************************************************/

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config.js', () => ({
    default: { ownerNumber: '255618558502@s.whatsapp.net' }
}));

vi.mock('../../lib/index.js', () => ({
    isSudo: vi.fn(async () => false)
}));

describe('isOwnerOrSudo', () => {
    let isOwnerOrSudo, isOwnerOnly, cleanJid;

    beforeEach(async () => {
        vi.resetModules();
        const mod = await import('../../lib/isOwner.js');
        isOwnerOrSudo = mod.default;
        isOwnerOnly = mod.isOwnerOnly;
        cleanJid = mod.cleanJid;
    });

    it('owner JID matches', async () => {
        expect(await isOwnerOrSudo('255618558502@s.whatsapp.net')).toBe(true);
    });

    it('owner with device suffix matches', async () => {
        expect(await isOwnerOrSudo('255618558502:10@s.whatsapp.net')).toBe(true);
    });

    it('non-owner returns false', async () => {
        expect(await isOwnerOrSudo('911111111111@s.whatsapp.net')).toBe(false);
    });

    it('isOwnerOnly rejects sudo', async () => {
        expect(isOwnerOnly('911111111111@s.whatsapp.net')).toBe(false);
    });

    it('cleanJid strips device suffix', () => {
        expect(cleanJid('255618558502:10@s.whatsapp.net')).toBe('255618558502');
    });

    it('cleanJid strips @s.whatsapp.net', () => {
        expect(cleanJid('255618558502@s.whatsapp.net')).toBe('255618558502');
    });

    it('cleanJid handles empty string', () => {
        expect(cleanJid('')).toBe('');
    });
});
