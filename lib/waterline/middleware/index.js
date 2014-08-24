/**
 * Middleware
 *
 *
 * - Follows some of the concepts found in orm2 (https://github.com/dresende/node-orm2).
 * - Exposes models to req.models, res.models and app.models to parent Express application.
 *
 * @param {Object} options
 * @param {Function} callback
 */

function Middleware(options, callback) {

  // Force Proper Instance.
  if ( !( this instanceof Middleware ) ) {
    return Middleware.initialize( options, callback );
  }

  var Waterline = require('../../../');
  var _ = require('lodash');
  var express = require( 'express' );
  var options = _.defaults( options, Middleware.defaults );

  this.waterline = new Waterline();

  this.waterline.initialize( options, this.initialized( callback ) );

  Object.defineProperties( this.app, {
    models: {
      /**
       * Models Reference.
       *
       */
      value: this.models,
      enumerable: true,
      configurable: false,
      writable: true
    },
    waterline: {
      /**
       * Waterline Instance.
       *
       */
      value: this.waterline,
      enumerable: true,
      configurable: false,
      writable: true
    }
  });

  // Return instance of Express application and subscribe to "mount" event.
  return this.app.once( 'mount', this.onceMounted );

};

Object.defineProperties( Middleware.prototype, {
  onceMounted: {
    /**
     * Exposes "models" and "waterline" instance to parent Express application once mounted.
     *
     * @author potanin@UD
     * @param parent
     * @returns {*}
     */
    value: function onceMounted( parent ) {
      // console.log( 'Waterline Middleware mounted to Express stack.', this.models );

      // Expose waterline instance to parent Express applicatin.
      parent.waterline = this.waterline;

      // Notify parent that waterline is ready. (It's actually ready immediatly, but we must do this with models so this is for consistency.)
      process.nextTick( function() {
        parent.emit( 'waterline:ready', null, parent.waterline );
      });

      return this;

    },
    enumerable: true,
    configurable: false,
    writable: true
  },
  initialized: {
    /**
     * Callback for ocne Waterline is initialized.
     *
     * @param callback
     * @returns {Function}
     */
    value: function initialized( callback ) {

      var _ = require( 'lodash' );
      var context = this;

      return function initializationCallback( error, models ) {
        // console.log( 'initialized', typeof error, typeof models );

        if( !error && models && models.collections && context.app.parent ) {

          _.extend( context, {
            models: models.collections,
            app: {
              models: models.collections,
              parent: context.app.parent || {}
            }
          });

          // If the parent app doesn't (for some reason) already have a models property, we add it.
          Object.defineProperty( context.app.parent,'models', {
            value: context.app.parent.models || models.collections,
            enumerable: true,
            configurable: false,
            writable: true
          });

          Object.defineProperty( context.app.parent.request, 'models', {
            value: context.app.parent.request.models || models.collections,
            enumerable: true,
            configurable: false,
            writable: true
          });

          Object.defineProperty( context.app.parent.response, 'models', {
            value: context.app.parent.response.models || models.collections,
            enumerable: true,
            configurable: false,
            writable: true
          });

          context.app.parent.emit( 'waterline:models:ready', error, models.collections );

        }

        if( 'function' === typeof callback ) {
          callback.call( context, error, models );
        }

      }

    },
    enumerable: true,
    configurable: false,
    writable: true

  },
  models: {
    /**
     * Container for Waterline Models / Collections
     *
     * @author potanin@UD
     */
    value: {},
    enumerable: true,
    configurable: false,
    writable: true
  },
  waterline: {
    /**
     * Container for Waterline Instance.
     *
     * @author potanin@UD
     */
    value: {},
    enumerable: true,
    configurable: false,
    writable: true
  },
  app: {
    /**
     * Placeholder for Express instance.
     *
     */
    value: require( 'express' ).call(),
    enumerable: false,
    configurable: false,
    writable: true
  }
});

Object.defineProperties( module.exports = Middleware, {
  initialize: {
    value: function initialize( config, callback ) {

      return new Middleware( config, callback );

    },
    enumerable: true,
    configurable: false,
    writable: true
  },
  defaults: {
    value: {
      adapters: {},
      collections: {},
      connections: {}
    },
    enumerable: true,
    configurable: true,
    writable: false
  }
});
