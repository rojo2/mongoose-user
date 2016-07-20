const date = require("mongoose-date");
const password = require("mongoose-password");

const UserStatus = {
  NOT_ENABLED: "not-enabled",
  ENABLED: "enabled",
  DISABLED: "disabled"
};

const UserStatusEnum = [
  UserStatus.NOT_ENABLED,
  UserStatus.ENABLED,
  UserStatus.DISABLED
];

const UserStatusDefault = UserStatus.NOT_ENABLED;

/**
 * Plugin that adds two dates to the mongoose object,
 * a creation date and a modification date.
 *
 * @param {mongoose.Schema} schema
 * @param {Object} options
 */
module.exports = function(schema, options) {

  schema.add({
    _id: String,
    username: {
      type: String,
      match: /^[A-Za-z0-9]{2,}$/
    },
    email: {
      type: String,
      unique: true,

      // @see: https://www.w3.org/TR/html-markup/input.email.html#input.email.attrs.value.single
      match: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    },
    status: {
      type: String,
      default: UserStatusDefault,
      enum: UserStatusEnum
    }
  });

  schema.plugin(date);
  schema.plugin(password);

  schema.virtual("isNotEnabled").get(function() {
    return this.status === UserStatus.NOT_ENABLED;
  });

  schema.virtual("isEnabled").get(function() {
    return this.status === UserStatus.ENABLED;
  });

  schema.virtual("isDisabled").get(function() {
    return this.status === UserStatus.DISABLED;
  });

  schema.method("enable", function() {
    if (this.isNotEnabled || this.isDisabled) {
      this.status = UserStatus.ENABLED;
    } else {
      throw new Error("User is already enabled");
    }
    return this;
  });

  schema.method("disable", function() {
    if (this.isNotEnabled || this.isEnabled) {
      this.status = UserStatus.DISABLED;
    } else {
      throw new Error("User is already disabled");
    }
    return this;
  });

  schema.static("findByEmail", function(email) {
    return this.findOne({ email: email });
  });

  schema.static("findByCredentials", function(email, password) {
    return this.findOne({
      email: email,
      status: {
        $in: [
          UserStatus.ENABLED,
          UserStatus.NOT_ENABLED
        ]
      }
    }).then((user) => {
      if (user) {
        return user.hasPassword(password).then((verified) => {
          if (verified) {
            return user;
          }
          return null;
        });
      }
      return null;
    });
  });

  schema.pre("save", function(next) {
    if (this.isNew) {
      this._id = this.username.toLowerCase();
    }
    return next();
  });

};
