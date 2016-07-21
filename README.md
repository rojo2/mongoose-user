# Mongoose User plugin
![Travis CI](https://travis-ci.org/rojo2/mongoose-user.svg?branch=master)

This mongoose plugin adds four properties to the schema: `username`, `email`,
`password` and `status`.

`status` represents the three main possible statuses of a user `not-enabled`,
`enabled` and `disabled`.

```javascript
const user = require("mongoose-user");
const {Schema} = require("mongoose");

const UserSchema = new Schema({
  type: {
    type: String,
    default: "regular",
    enum: ["premium","regular"]
  }
});

UserSchema.plugin(user);
```

Made with ❤ by ROJO 2 (http://rojo2.com)
