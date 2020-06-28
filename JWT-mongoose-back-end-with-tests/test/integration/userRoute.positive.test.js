const supertest = require('supertest');
const app = require('../../app');
const request = supertest(app);
const mongodb = require('../../models/mongodb.util');
const routeUrl = '/api/v1/users';
const mockSignupRequest = require('../mockData/signupUser.json');
const mockUsers = require('../mockData/users');
const UserModel = require('../../models/userModel');
const mockResetPasswordBody = require('../mockData/resetPasswordBody.json');
const crypto = require('crypto');

describe(`Positive Scenarios of ${routeUrl}`, () => {
  beforeAll(async () => {
    await mongodb.connect();
    await mongodb.dropCollection('users_' + process.env.NODE_ENV);
  });

  afterAll(async () => {
    await mongodb.disconnect();
  });

  test('Successfull signup', async () => {
    const response = await request
      .post(`${routeUrl}/signup`)
      .send(mockSignupRequest);

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user).toHaveProperty('role', mockUsers[0].role);
    expect(response.body.data.user).toHaveProperty(
      'active',
      mockUsers[0].active
    );
    expect(response.body.data.user).toHaveProperty('_id');
    expect(response.body.data.user).toHaveProperty('name', mockUsers[0].name);
    expect(response.body.data.user).toHaveProperty('email', mockUsers[0].email);
    expect(Object.keys(response.body.data.user).length).toEqual(6);
  });

  test('Successfull forgotPassword email sending', async () => {
    const response = await request
      .post(`${routeUrl}/forgotPassword`)
      .send({ email: mockSignupRequest.email });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('message', 'Token sent to email!');
    expect(Object.keys(response.body).length).toEqual(2);
  });

  // test('Successfull forgotPassword email sending', async () => {
  //   const user = await User.findOne({ email: mockSignupRequest.email });
  //   const token = user.passwordResetToken;
  //   const validToken = crypto
  //     .createHash('sha256')
  //     .update(token)
  //     .digest('hex');
  //   console.log(validToken);
  //   const response = await request
  //     .patch(`${routeUrl}/resetPassword/${validToken}`)
  //     .send(mockResetPasswordBody);
  //   console.log(response.body);

  // });

  test('Successfull login', async () => {
    const response = await request.post(`${routeUrl}/login`).send({
      email: mockSignupRequest.email,
      password: mockSignupRequest.password
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('token');
    expect(response.body.data.user).toHaveProperty('role', mockUsers[0].role);
    expect(response.body.data.user).toHaveProperty('name', mockUsers[0].name);
    expect(response.header).toHaveProperty('set-cookie');
  });

  test('Succesfully updated my password', async () => {
    const jwt = await loginUser(
      mockSignupRequest.email,
      mockSignupRequest.password
    );

    const response = await request
      .patch(`${routeUrl}/updateMyPassword`)
      .set('authorization', `Bearer ${jwt}`)
      .send({
        passwordCurrent: 'secretPassword',
        password: 'updatedSecretPassword',
        passwordConfirm: 'updatedSecretPassword'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data.user).toHaveProperty('role', mockUsers[0].role);
    expect(response.body.data.user).toHaveProperty('name', mockUsers[0].name);
    expect(response.body.data.user).toHaveProperty('email', mockUsers[0].email);
  });

  test('Succesfully updated my basic informations', async () => {
    const jwt = await loginUser(
      mockSignupRequest.email,
      'updatedSecretPassword'
    );

    const response = await request
      .patch(`${routeUrl}/updateMe`)
      .set('authorization', `Bearer ${jwt}`)
      .send({
        name: 'mainAdmin',
        email: 'mainadmin@admin.com'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'success');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data.user).toHaveProperty('role', mockUsers[0].role);
    expect(response.body.data.user).toHaveProperty('name', 'mainAdmin');
    expect(response.body.data.user).toHaveProperty(
      'email',
      'mainadmin@admin.com'
    );
  });

  test('GetAllUsers lists all the active users if my role is admin', async () => {
    const user = await UserModel.findOne({ email: 'mainadmin@admin.com' });
    user.role = 'admin';
    await user.save({ validateBeforeSave: false });

    const responseOfSignUp = await request.post(`${routeUrl}/signup`).send({
      email: 'admin2@admin.com',
      password: 'secretPassword',
      passwordConfirm: 'secretPassword',
      name: 'admin2'
    });

    const jwt = await loginUser('mainadmin@admin.com', 'updatedSecretPassword');

    const response = await request
      .get(`${routeUrl}`)
      .set('authorization', `Bearer ${jwt}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("status", "success")
    expect(response.body).toHaveProperty("results", 2)
    expect(response.body).toHaveProperty("data")
  });

  test('Succesfully deleted myself from database', async () => {
    const jwt = await loginUser('mainadmin@admin.com', 'updatedSecretPassword');

    const response = await request
      .delete(`${routeUrl}/deleteMe`)
      .set('authorization', `Bearer ${jwt}`);
    console.log(response.body);
    expect(response.statusCode).toBe(204);
    const responseOfDeletedUserLoginTry = await request
      .post(`${routeUrl}/login`)
      .send({
        email: 'mainadmin@admin.com',
        password: 'updatedSecretPassword'
      });
    expect(responseOfDeletedUserLoginTry.statusCode).toBe(401);
    expect(responseOfDeletedUserLoginTry.body.message).toStrictEqual(
      'Incorrect email or password'
    );
  });
});

const loginUser = async (email, password) => {
  const responseOfLogin = await request.post(`${routeUrl}/login`).send({
    email: email,
    password: password
  });
  const jwtCookie = responseOfLogin.header['set-cookie'][0];
  const jwt = jwtCookie.split(';')[0].substring(4);
  return jwt;
};
