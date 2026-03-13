import { supabaseAdmin } from '../../../lib/supabase';
import { verifyToken } from '../../../lib/auth';
import rateLimit from '../../../lib/rateLimit';

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (!rateLimit(ip, 30, 60000)) {
    return res.status(429).json({ message: 'NEURAL OVERLOAD: RATE LIMIT EXCEEDED.' });
  }

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { username, cardId, effectData } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'UNAUTHORIZED: TOKEN MISSING' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.username !== username) {
      return res.status(403).json({ message: 'FORBIDDEN: NEURAL MISMATCH' });
    }

    // 1. Fetch User and Clan
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('credits, clan_id')
      .eq('username', username)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: 'Operator not found' });
    }

    const clanId = user.clan_id;
    let userUpdates = {};
    let clanUpdates = null;

    // 2. Process Card Logic (Server-side validation of effects)
    switch (cardId) {
      case 'ion-shield':
        userUpdates.credits = (user.credits || 0) + 500;
        break;
      case 'neural-patch':
        clanUpdates = { delta: 200 };
        break;
      case 'xp-elixir':
        clanUpdates = { delta: 300 };
        break;
      case 'data-scroll':
        userUpdates.credits = (user.credits || 0) + 200;
        clanUpdates = { delta: 150 };
        break;
      case 'sys-overload':
        clanUpdates = { delta: -300 };
        break;
      case 'data-leak':
        clanUpdates = { delta: -200, leakToRival: true };
        break;
      case 'trojan':
        userUpdates.credits = Math.max(0, (user.credits || 0) - 400);
        break;
      case 'corrupt-script':
        userUpdates.credits = Math.max(0, (user.credits || 0) - 100);
        clanUpdates = { delta: -150 };
        break;
      default:
        return res.status(400).json({ message: 'INVALID CARD SIGNAL' });
    }

    // 3. Apply User Updates
    if (Object.keys(userUpdates).length > 0) {
      const { error: updErr } = await supabaseAdmin
        .from('users')
        .update(userUpdates)
        .eq('username', username);
      if (updErr) throw updErr;
    }

    // 4. Apply Clan Updates
    if (clanUpdates) {
      const { data: clan, error: clanFetchErr } = await supabaseAdmin
        .from('clans')
        .select('points')
        .eq('id', clanId)
        .single();
      
      if (!clanFetchErr && clan) {
        // Atomic update for points
        await supabaseAdmin
          .from('clans')
          .update({ points: (clan.points || 0) + clanUpdates.delta })
          .eq('id', clanId);
      }

      if (clanUpdates.leakToRival) {
        // Find a random rival
        const { data: rivals } = await supabaseAdmin
          .from('clans')
          .select('id, points')
          .neq('id', clanId);
        
        if (rivals && rivals.length > 0) {
            const rival = rivals[Math.floor(Math.random() * rivals.length)];
            await supabaseAdmin
                .from('clans')
                .update({ points: (rival.points || 0) + Math.abs(clanUpdates.delta) })
                .eq('id', rival.id);
        }
      }
    }

    return res.status(200).json({ 
        success: true, 
        credits: userUpdates.credits ?? user.credits,
        clanPointsDelta: clanUpdates?.delta ?? 0
    });

  } catch (error) {
    console.error('Card Effect API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
