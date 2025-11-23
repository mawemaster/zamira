import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
    try {
        const body = await req.json();

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY // segurança máxima
        );

        const { data, error } = await supabase
            .from("ChatMessage")
            .insert({
                author_id: body.author_id,
                author_name: body.author_name,
                author_avatar: body.author_avatar,
                author_level: body.author_level,
                author_archetype: body.author_archetype,
                message_type: body.message_type,
                content: body.content,
                media_url: body.media_url,
                reactions: {},
                reply_to: body.reply_to || null
            })
            .select()
            .single();

        if (error) {
            console.error(error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: data });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
