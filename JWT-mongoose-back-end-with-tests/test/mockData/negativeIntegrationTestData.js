
const originalPassword = 'secretPassword';
const changedPassword = 'updatedSecretPassword';
const mainTestEmail = 'admin2@admin.com';
const updatedEmail = 'mainadmin@admin.com';
const fakeEmail = 'fakeemail@gmail.com';
const fakePassword = 'fakePassword'

const mockSignupRequestBody = {
  email: mainTestEmail,
  password: originalPassword,
  passwordConfirm: originalPassword,
  name: 'admin'
};

const mockSignupReqBodyWithoutPassword = {
  email: fakeEmail,
  name: 'fakeuser'
};

const mockLoginReqBodyWithoutPassword = {
  email: mainTestEmail
};

const mockIncorrectPasswordLoginReqBody = {
  email: mainTestEmail,
  password: fakePassword
};

const mockFakeEmailForForgotPw = {
  email: fakeEmail
};

const mockResetPasswordReqBody = {
  passwor: changedPassword,
  passwordConfirm: changedPassword
};

const mockIncorrectUpdateMyPasswordRequestBody = {
  passwordCurrent: fakePassword,
  password: changedPassword,
  passwordConfirm: fakePassword
}

const mockIncorrectPasswordConfirmRequestBody = {
  passwordCurrent: originalPassword,
  password: changedPassword,
  passwordConfirm: fakePassword
}

const mockUpdateMeWithPasswordBody = {
  password: changedPassword
}


module.exports = {
  mockSignupRequestBody,
  mockSignupReqBodyWithoutPassword,
  mockLoginReqBodyWithoutPassword,
  mockIncorrectPasswordLoginReqBody,
  mockFakeEmailForForgotPw,
  mockResetPasswordReqBody,
  mockIncorrectUpdateMyPasswordRequestBody,
  mainTestEmail,
  originalPassword,
  mockIncorrectPasswordConfirmRequestBody,
  mockUpdateMeWithPasswordBody
};
