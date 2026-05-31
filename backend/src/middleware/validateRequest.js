const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export function validateRegisterRequest(req, res, next) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      message: "email and password are required"
    });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (!PASSWORD_RULE.test(String(password))) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, number and special character"
    });
  }

  return next();
}

export function validateLoginRequest(req, res, next) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  return next();
}

export function validateResetPasswordRequest(req, res, next) {
  const { token, password } = req.body || {};

  if (!token || !password) {
    return res.status(400).json({ message: "token and password are required" });
  }

  if (!PASSWORD_RULE.test(String(password))) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, number and special character"
    });
  }

  return next();
}
