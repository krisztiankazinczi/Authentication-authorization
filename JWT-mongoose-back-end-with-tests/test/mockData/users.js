
const originalPassword = 'secretPassword'
const changedPassword = 'updatedSecretPassword'
const mainTestEmail = 'admin2@admin.com'
const updatedEmail = 'mainadmin@admin.com'

const mockUsers = [
  {
    role: 'user',
    active: true,
    _id: '5ef50a1cf88d7d00ecbc20e4',
    name: 'admin2',
    email: 'admin2@admin.com',
    password: '$2a$12$wAgohdQpyR6HCKxRPK.e1u9dP8Xe5HThWOY3YSwRkH9kck0GF7',
    __v: 0
  },
  {
    role: 'user',
    active: true,
    _id: '5ef50a1cf88d7d00ecbc20e4',
    name: 'admin3',
    email: 'admin3@admin.com',
    password: '$2a$12$wAgohdQpyR6HCKxRPK.e1u9dP8Xe5HThWOY3YSwRkH9kck0GF',
    __v: 0
  }
];

const mockSignupRequest = {
  email: mainTestEmail,
  password: originalPassword,
  passwordConfirm: originalPassword,
  name: 'admin2'
};

const mockSignupRequest2 = {
  email: 'test2@admin.com',
  password: 'secretPassword',
  passwordConfirm: 'secretPassword',
  name: 'testperson2'
};

const mockUpdatePasswordRequestBody = {
  passwordCurrent: originalPassword,
  password: changedPassword,
  passwordConfirm: changedPassword
}

const mockloginWithOriginalDetails = {
  email: mainTestEmail,
  password: originalPassword
}

const mockUpdateMeBody = {
  name: 'mainAdmin',
  email: updatedEmail
}



module.exports = {
  mockUsers,
  mockSignupRequest,
  mockUpdatePasswordRequestBody,
  mockloginWithOriginalDetails,
  mainTestEmail,
  originalPassword,
  changedPassword,
  mockUpdateMeBody,
  updatedEmail,
  mockSignupRequest2
}
