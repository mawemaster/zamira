import { supabaseAdmin } from './supabaseAdmin';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { userId, message } = req.body;

    const { data, error } = await supabaseAdmin
        .from('messages')
        .insert({
            user_id: userId,
            text: message,
            created_at: new Date(),
        });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, data });
}
