const crypto = require('crypto'); // built-in node module
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!']
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'admin'], //with enum prop we can define the exact values of a field!
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false // never shown in any output!!!
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // this only works on create() and save()
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});
// active - if user is deleted I just set it to inactive, later can come back if want

// pre middleware - it will run before the data saving in database - works only in save() operation!
userSchema.pre('save', async function(next) {
  // Oly runs if password was modified!
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  // after the passwordConfirmation validation I don't need the value of it, so I just change it to undefined
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//this middleware will run if a methodname containd 'find' word and only those results will be shown, which active property is not equal to false
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

//instant method, so it's available in all the files
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  // user not changed the password
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  //encrypt the token and save in database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// const User = mongoose.model('User', userSchema);

mongoose.pluralize(null); // without this mongoose would add an extra 's' letter to the collection name!!
const User = mongoose.model(
  'users_' + process.env.NODE_ENV,
  userSchema
);

module.exports = User;
