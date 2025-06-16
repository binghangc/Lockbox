const supabase = require('../utils/supabaseUserClient.js');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const { data: authData, error: authError } =
    await supabase.auth.getUser(token);
  const user = authData?.user;

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = user;
  return next();
};

module.exports = authMiddleware;
