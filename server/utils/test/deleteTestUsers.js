const supabaseAdmin = require('../supabaseAdminClient.js');

async function deleteTestUsers(prefixes = []) {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error('Error listing users:', error.message);
    return;
  }

  const testUsers = data.users.filter(
    (u) =>
      u.email.endsWith('@lockbox.dev') &&
      prefixes.some((prefix) => u.email.startsWith(prefix)),
  );

  await Promise.all(
    testUsers.map((user) => {
      console.log(`🧹 Deleting test user: ${user.email}`);
      return supabaseAdmin.auth.admin.deleteUser(user.id);
    }),
  );
}

module.exports = deleteTestUsers;
