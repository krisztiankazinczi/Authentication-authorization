let { forgotPassword } = require('../../controllers/authController');
let userModel = require('../../models/userModel');
const httpMock = require('node-mocks-http');
const body = require('../mockData/forgotPassword.json');
const mockUsers = require('../mockData/users');
const AppError = require('../../utils/appError');
let sendEmail = require('../../utils/email');

userModel.findOne = jest.fn();
userModel.createPasswordResetToken = jest.fn();
userModel.save = jest.fn();
sendEmail = jest.fn();

let req, res, next;

next = jest.fn();

beforeEach(() => {
  userModel.findOne.mockClear();
  userModel.createPasswordResetToken.mockClear();
  userModel.save.mockClear();
  sendEmail.mockClear();
  req = httpMock.createRequest();
  res = httpMock.createResponse();
  next.mockClear();
  req.body = { ...body };
  req.protocol = 'https';
  req.host = 'fakehost';
});

describe('Unit test of authController.forgotPassword', () => {
  test('forgotPassword function is defined', () => {
    expect(typeof forgotPassword).toBe('function');
  });

  test('Email is not existing in database', async () => {
    userModel.findOne.mockReturnValue(null);
    await forgotPassword(req, res, next);
    expect(next).toHaveBeenCalledWith(
      new AppError('There is no user with email address.', 404)
    );
  });

  // test('Success email sending', async () => {
  //   userModel.findOne.mockReturnValue(mockUsers[0]);
  //   userModel.createPasswordResetToken.mockReturnValue(
  //     'fake-password-reset-token'
  //   );
  //   userModel.save.mockResolvedValue(true);
  //   sendEmail.mockReturnValue(true);
  //   await forgotPassword(req, res, next);
    
  //   expect(res.statusCode).toBe(200);
  //   expect(res._getJSONData()).toStrictEqual({
  //     status: 'success',
  //     message: 'Token sent to email!'
  //   });
  // });

  // test('Email sending throws exception', async () => {
  //   userModel.findOne.mockReturnValue(mockUsers[0]);
  //   userModel.createPasswordResetToken.mockReturnValue(
  //     'fake-password-reset-token'
  //   );
  //   userModel.save.mockResolvedValue(true);
  //   sendEmail.mockRejectedValue('fake error');
  //   // userModel.save.mockResolvedValue(true);
  //   await forgotPassword(req, res, next);
  //   expect(next).toHaveBeenCalledWith(
  //     new AppError(
  //       'There was an error sending the email. Try again later!',
  //       500
  //     )
  //   );
  // });
});
