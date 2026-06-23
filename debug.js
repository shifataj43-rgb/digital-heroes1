const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDb() {
  console.log("Checking DB...");
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  console.log("Users:", users?.users?.map(u => ({ id: u.id, email: u.email })) || userError);

  if (users?.users?.length > 0) {
    const userId = users.users[0].id;
    
    const { data: profile, error: profileErr } = await supabase.from('profiles').select('*').eq('id', userId).single();
    console.log("\nProfile:", profile || profileErr);

    const { data: scores, error: scoreErr } = await supabase.from('scores').select('*').eq('user_id', userId);
    console.log("\nScores for user:", scores || scoreErr);
  }
}

checkDb();
