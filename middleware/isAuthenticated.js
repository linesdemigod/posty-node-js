const isAuthenticated = (req, res, next) => {
  // if (req.session.user) {
  //   res.locals.user = req.session.user || null;
  //   return next();
  // }

  // res.redirect("/");

  if (!req.session.isLoggedIn) {
    return res.redirect("/");
  }

  next();
};

module.exports = isAuthenticated;
