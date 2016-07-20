const {expect} = require("chai");
const mongoose = require("mongoose");
const user = require("../user");

describe("User", function() {

  this.timeout(5000);

  before((done) => {

    mongoose.Promise = global.Promise;
    mongoose.connect("mongodb://localhost/mongoose-test", (err) => {

      if (err) {
        return done(err);
      }

      try {
        mongoose.model("user");
      } catch(error) {
        const UserSchema = new mongoose.Schema({
          type: String
        });

        UserSchema.plugin(user);

        const User = mongoose.model("user", UserSchema);
      } 

      const User = mongoose.model("user");
      User.remove().then(() => done());

    });

  });

  after((done) => {
    mongoose.disconnect(done);
  });

  it("should create a new user", (done) => {

    const User = mongoose.model("user");
    User.create({
      username: "user",
      email: "user@test.com",
      password: "secret",
      type: "premium"
    }).then((user) => {
      expect(user).to.have.property("modified");
      expect(user).to.have.property("created");
      expect(user).to.have.property("email","user@test.com");
      expect(user).to.have.property("password");
      expect(user).to.have.property("status","not-enabled");
      done();
    }).catch((err) => {
      done(err);
    });

  });

  it("should try if getting the user by credentials works", (done) => {

    const User = mongoose.model("user");
    User.findByCredentials("user@test.com","secret")
        .then((user) => {
          expect(user).to.have.property("_id","user");
          expect(user).to.have.property("modified");
          expect(user).to.have.property("created");
          expect(user).to.have.property("email","user@test.com");
          expect(user).to.have.property("password");
          expect(user).to.have.property("status","not-enabled");
          done();
        })
        .catch((err) => {
          done(err);
        });

  });

  it("should try to create a user with an invalid username", (done) => {

    const User = mongoose.model("user");
    User.create({
      username: "ñoco"
    }).then((user) => {
      done(new Error("Invalid username"));
    }).catch((err) => {
      done();
    });

  });

  it("should try to create a user with an invalid email", (done) => {

    const User = mongoose.model("user");
    User.create({
      email: "user"
    }).then((user) => {
      done(new Error("Invalid email"));
    }).catch((err) => {
      done();
    });

  });

  it("should try to create a user with an invalid status", (done) => {

    const User = mongoose.model("user");
    User.create({
      status: "banned"
    }).then((user) => {
      done(new Error("Invalid status"));
    }).catch((err) => {
      done();
    });

  });
 
  it("should try to create a new user with the same as the first one", (done) => {

    const User = mongoose.model("user");
    User.create({
      username: "user",
      email: "user@test.com",
      password: "secret",
      type: "premium"
    }).then((user) => {
      done(new Error("Invalid user data"));
    }).catch((err) => {
      done();
    });

  });

  it("should create a disabled user", (done) => {

    const User = mongoose.model("user");
    User.create({
      username: "disabledUser",
      email: "disabled-user@test.com",
      password: "secret",
      type: "premium",
      status: "disabled"
    }).then((user) => {
      expect(user).to.have.property("_id","disableduser");
      expect(user).to.have.property("username","disabledUser");
      expect(user).to.have.property("modified");
      expect(user).to.have.property("created");
      expect(user).to.have.property("email","disabled-user@test.com");
      expect(user).to.have.property("password");
      expect(user).to.have.property("status","disabled");
      done();
    }).catch((err) => {
      done(err);
    });

  });

  it("should try to retrieve a disabled user", (done) => {

    const User = mongoose.model("user");
    User.findByCredentials("disabled-user@test.com","secret").then((user) => {
      if (user === null) {
        done();
      } else {
        done(new Error("Invalid user"));
      }
    }).catch((err) => {
      done(err);
    });

  });

});

