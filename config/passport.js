/**
 * Passport Configuration
 */

var _                = require('lodash')
  , cwd              = process.cwd()
  , env              = process.env.NODE_ENV || 'development'
  , path             = require('path')
  , util             = require('util')
  , config           = require(path.join(cwd, 'config.' + env + '.json'))
  , providers        = require('../lib/providers')
  , LocalStrategy    = require('passport-local').Strategy
  , base64url        = require('base64url')
  , User             = require('../models/User')
  ;


module.exports = function (passport) {


  /**
   * Sessions
   */

  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    User.get(id, function (err, user) {
      done(err, user);
    });
  });


  /**
   * Local Strategy
   */

  passport.use(new LocalStrategy(
    { usernameField: 'email',  passReqToCallback: 'true' },
    function (req, email, password, done) {
      User.authenticate(email, password, function (err, user, info) {
        if (user) {
          // throw password value away so isn't included in URLs/logged
          delete req.connectParams.password;
          delete req.connectParams.email;
        }

        done(err, user, info);
      });
    }
  ));


  /**
   * OAuth Strategies
   */

  if (config.providers) {
    Object.keys(config.providers).forEach(function (name) {
      var provider = providers[name]
        , client   = config.providers[name]
        , protocol = (provider && provider.protocol)
                  || (client   && client.protocol)
        , strategy = require('../lib/strategies/' + protocol)
        ;

      passport.use(strategy.initialize(provider, client));
    });
  }


};
