'use server'
import {auth} from "@clerk/nextjs/server";
import {createSupabaseClient} from "@/lib/supabase";



export const createCompanion = async (formData: CreateCompanion) => {
    const { userId: author } = await auth();
    const supabase = createSupabaseClient();

      const { data, error } = await supabase
        .from('companions')
        .insert({...formData, author })
        .select();

    if(error || !data) throw new Error(error?.message || 'Failed to create a companion');

    return data[0];


}
export const getAllCompanions = async ({ limit = 10, page = 1, subject, topic }: GetAllCompanions) => {
    const supabase = createSupabaseClient();

    let query = supabase.from('companions').select();

    if(subject && topic) {
        query = query.ilike('subject', `%${subject}%`)
            .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
    } else if(subject) {
        query = query.ilike('subject', `%${subject}%`)
    } else if(topic) {
        query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
    }

    query = query.range((page - 1) * limit, page * limit - 1);

    const { data: companions, error } = await query;

    if(error) throw new Error(error.message);

    return companions;
  }
//   Connect Superbass with vapi
  export const getCompanion = async (id: string) => {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('id', id);

    if(error) return console.log(error);

    return data[0];
}


export const addToSessionHistory = async (companionId: string) => {
    const { userId } = await auth();
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from('logs')
        .insert({
            companion_id: companionId,
            user_id: userId,
        });
    if(error) throw new Error(error.message);
    return data;
}
export const getRecentSessions = async (limit = 10) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('logs')
        .select('*, companions:companion_id (*)')
        .order('created_at', { ascending: false })
        .limit(limit * 2); // Get more data to account for potential duplicates

    if(error) throw new Error(error.message);

    // Only keep the most recent log per companion
    const unique = new Map();
    for (const session of data) {
        if (!unique.has(session.companion_id)) {
            unique.set(session.companion_id, session);
        }
    }
    // Limit the results
    return Array.from(unique.values()).slice(0, limit).map(({ companions }) => companions);
}

export const getUserSessions = async (userId: string, limit = 10) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('logs')
        .select('*, companions:companion_id (*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if(error) throw new Error(error.message);

    // Only keep the most recent log per companion
    const unique = new Map();
    for (const session of data) {
        if (!unique.has(session.companion_id)) {
            unique.set(session.companion_id, session);
        }
    }
    // Limit the results
    return Array.from(unique.values()).slice(0, limit).map(({ companions }) => companions);
}

export const getUserCompanions = async (userId: string) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('author', userId)

    if(error) throw new Error(error.message);

    return data;
}

export const newCompanionPermissions = async () => {
    const { userId, has } = await auth();
    const supabase = createSupabaseClient();

    let limit = 0;

    if(has({ feature: 'pro' })) {
        return true;
    } else if(has({ feature: "4_companion_limit" })) {
        limit = 4;
    } else if(has({ feature: "10_companion_limit" })) {
        limit = 10;
    }

    const { data, error } = await supabase
        .from('companions')
        .select('id', { count: 'exact' })
        .eq('author', userId)

    if(error) throw new Error(error.message);

    const companionCount = data?.length;

    if(companionCount >= limit) {
        return false
    } else {
        return true;
    }
}

// Bookmarks

