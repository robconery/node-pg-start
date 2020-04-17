exports.init = function({Auth, GoogleSettings, GithubSettings}){

  const passport = require('passport');
  var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
  var GitHubStrategy = require( 'passport-github2' ).Strategy;


  if(process.env.GOOGLE_ID){
    passport.use(new GoogleStrategy(GoogleSettings, async function(accessToken, refreshToken, profile, done) {
      try{
        const user = await Auth.authenticateOauth({
          uid: profile.id,
          name: profile.displayName,
          email: profile.email,
          provider: "Google",
          data: profile
        });
        console.log("Authenticated with Google");
        return done(null, {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: profile.picture
        });
      }catch(err){
        return done(err,null);
      }
    }));
  }
  
  if(process.env.GITHUB_ID){
    passport.use(new GitHubStrategy(GithubSettings, async function(accessToken, refreshToken, profile, done) {
      try{
        const user = await Auth.authenticateOauth({
          uid: profile.id,
          name: profile.displayName,
          email: profile.emails.length > 0 ? profile.emails[0].value : null,
          provider: "Github",
          data: profile
        });
        console.log("Authenticated with Github");
        return done(null, {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: profile._json.avatar_url
        });
      }catch(err){
        return done(err,null);
      }
    }));
  }
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser(async (user, done) => {
    done(null, user);
  });
  
  return passport;
}
