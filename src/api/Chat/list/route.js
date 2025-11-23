import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
        .from("ChatMessage")
        .select("*")
        .order("created_date", { ascending: false })
        .limit(50);

    if (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ messages: data });
}
