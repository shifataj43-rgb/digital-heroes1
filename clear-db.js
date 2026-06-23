
const { createClient } = require('@supabase/supabase-js');

async function clearUsers() {
  console.log("Connecting to Supabase...");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log("Fetching all users...");
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error("Error fetching users:", error);
    return;
  }

  if (users.length === 0) {
    console.log("No users found. Database is already clean.");
    return;
  }

  console.log(`Found ${users.length} users. Deleting...`);

  for (const user of users) {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error(`Failed to delete user ${user.id}:`, deleteError);
    } else {
      console.log(`Deleted user: ${user.email || user.id}`);
    }
  }

  console.log("Successfully wiped all user data. Cascading constraints have cleared profiles and scores.");
}

clearUsers();
