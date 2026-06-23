const { createClient } = require('@supabase/supabase-js');

async function createAdmin() {
  console.log("Connecting to Supabase...");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const email = 'admin@digitalheroes.com';
  const password = 'AdminTest123!';

  console.log(`Creating user: ${email}...`);
  
  // 1. Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: { full_name: 'System Administrator' }
  });

  if (authError) {
    console.error("Failed to create user in Auth:", authError.message);
    return;
  }

  const userId = authData.user.id;
  console.log(`Auth user created with ID: ${userId}`);

  // Wait a moment for the database trigger to create the profile
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log("Promoting user to 'admin' role in profiles table...");
  
  // 2. Update the profile role to 'admin'
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId);

  if (profileError) {
    console.error("Failed to update profile role:", profileError.message);
    return;
  }

  console.log("\n=======================================================");
  console.log("✅ SUCCESS! Admin account created and fully verified.");
  console.log("=======================================================");
  console.log("Admin Credentials:");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log("=======================================================\n");
  console.log("You can now log in with these credentials on your localhost.");
}

createAdmin();
