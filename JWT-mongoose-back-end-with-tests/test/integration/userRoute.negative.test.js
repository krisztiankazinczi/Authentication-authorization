const supertest = require('supertest');
const app = require('../../app');
const request = supertest(app);
const mongodb = require('../../models/mongodb.util');
const routeUrl = '/api/v1/users';

const {
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
} = require('../mockData/negativeIntegrationTestData');

describe(`Positive Scenarios of ${routeUrl}`, () => {
  beforeAll(async () => {
    await mongodb.connect();
    await mongodb.dropCollection('users_' + process.env.NODE_ENV);
    await request.post(`${routeUrl}/signup`).send(mockSignupRequestBody);
  });

  afterAll(async () => {
    await mongodb.disconnect();
  });

  test(`POST: ${routeUrl}/signup without password`, async () => {
    const response = await request
      .post(`${routeUrl}/signup`)
      .send(mockSignupReqBodyWithoutPassword);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty(
      'message',
      'Please provide name, email, password and passwordConfirm!'
    );
  });

  test(`POST: ${routeUrl}/signup with existing email`, async () => {
    const response = await request
      .post(`${routeUrl}/signup`)
      .send(mockSignupRequestBody);

    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty(
      'message',
      `E11000 duplicate key error collection: jwt-auth.users_test index: email_1 dup key: { email: "admin2@admin.com" }`
    );
  });

  test(`POST: ${routeUrl}/login without password`, async () => {
    const response = await request
      .post(`${routeUrl}/login`)
      .send(mockLoginReqBodyWithoutPassword);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty(
      'message',
      'Please provide email and password!'
    );
  });

  test(`POST: ${routeUrl}/login wrong password`, async () => {
    const response = await request
      .post(`${routeUrl}/login`)
      .send(mockIncorrectPasswordLoginReqBody);

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty(
      'message',
      'Incorrect email or password'
    );
  });

  test(`POST: ${routeUrl}/forgotPassword wrong password`, async () => {
    const response = await request
      .post(`${routeUrl}/forgotPassword`)
      .send(mockFakeEmailForForgotPw);

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty(
      'message',
      'There is no user with email address.'
    );
  });

  test(`PATCH: ${routeUrl}/resetPassword/:token - with invalid token`, async () => {
    const response = await request
      .patch(`${routeUrl}/resetPassword/asdg322s1l1aj2k2f1a3s4kljhh`)
      .send(mockResetPasswordReqBody);

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty(
      'message',
      'Token is invalid or has expired'
    );
  });

  test(`PATCH: ${routeUrl}/updateMyPassword - without login - testing protect middleware`, async () => {
    const response = await request
      .patch(`${routeUrl}/updateMyPassword`)
      .send(mockIncorrectUpdateMyPasswordRequestBody);

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty(
      'message',
      'You are not logged in! Please log in to get access.'
    );
  });

  test(`DELETE: ${routeUrl}/deleteMe withhout login`, async () => {
    const response = await request.delete(`${routeUrl}/deleteMe`);

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty(
      'message',
      'You are not logged in! Please log in to get access.'
    );
  });

  describe('Login required requests', () => {
    let jwt;
    beforeAll(async () => {
      jwt = await loginUser(mainTestEmail, originalPassword);
    });

    test(`PATCH: ${routeUrl}/updateMyPassword with wrong currentPassword`, async () => {
      const response = await request
        .patch(`${routeUrl}/updateMyPassword`)
        .send(mockIncorrectUpdateMyPasswordRequestBody)
        .set('authorization', `Bearer ${jwt}`);

      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty(
        'message',
        'Your current password is wrong.'
      );
    });

    test(`PATCH: ${routeUrl}/updateMyPassword with wrong passwordConfirmation`, async () => {
      const response = await request
        .patch(`${routeUrl}/updateMyPassword`)
        .send(mockIncorrectPasswordConfirmRequestBody)
        .set('authorization', `Bearer ${jwt}`);

      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty(
        'message',
        'users_test validation failed: passwordConfirm: Passwords are not the same!'
      );
    });

    test(`PATCH: ${routeUrl}/updateMe with password value`, async () => {
      const response = await request
        .patch(`${routeUrl}/updateMe`)
        .send(mockUpdateMeWithPasswordBody)
        .set('authorization', `Bearer ${jwt}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty(
        'message',
        'This route is not for password updates. Please use /updateMyPassword.'
      );
    });

    test(`GET: ${routeUrl}/ - getAllUsers without admin role (testing restrictTo middleware)`, async () => {
      const response = await request
        .get(`${routeUrl}`)
        .set('authorization', `Bearer ${jwt}`);

      expect(response.statusCode).toBe(403);
      expect(response.body).toHaveProperty(
        'message',
        'You do not have permission to perform this action'
      );
    });

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
