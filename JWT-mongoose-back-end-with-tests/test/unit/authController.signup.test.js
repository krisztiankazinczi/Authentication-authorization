let { signup, createSendToken } = require('../../controllers/authController');
let userModel = require('../../models/userModel');
const httpMock = require('node-mocks-http');
const mockUser = require('../mockData/signupUser.json');
const mockUsers = require('../mockData/users');
const AppError = require('../../utils/appError');

userModel.create = jest.fn();
createSendToken = jest.fn();

let req, res, next;

next = jest.fn();

beforeEach(() => {
  userModel.create.mockClear();
  createSendToken.mockClear();
  req = httpMock.createRequest();
  res = httpMock.createResponse();
  next.mockClear();
  req.body = { ...mockUser };
});

describe('authController.signup', () => {
  test('signup function is defined', () => {
    expect(typeof signup).toBe('function');
  });

  test('should return new AppError if req.body is empty', async () => {
    req.body = {};
    await signup(req, res, next);
    expect(createSendToken).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledWith(
      new AppError(
        'Please provide name, email, password and passwordConfirm!',
        400
      )
    );
  });

  test("should signup a user successfully", async () => {
    userModel.create.mockReturnValue(mockUsers[0]);
    await signup(req, res, next);
    expect(createSendToken).toHaveBeenCalledTimes(1);
    expect(createSendToken).toHaveBeenCalledWith(
        mockUsers[0],
        201,
        res
      );
    expect(createSendToken()).toEqual(false)
  })

});
