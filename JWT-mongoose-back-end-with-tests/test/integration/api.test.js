const request = require('supertest');
const app = require('../../app');
const mongodb = require('../../models/mongodb.util');
const endPointUrl = '/api/v1/users';

describe(`Validate test endpoint`, () => {
  test('GET /test', async () => {
    const response = await request(app).get('/test');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual('for API integration test');
  });

  test(`GET ${endPointUrl}/test`, async () => {
    const response = await request(app).get(`${endPointUrl}/test`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'API is working');
    expect(response.body).toStrictEqual({
      status: 'API is working',
      message:
        'User router is working, now you can test the rest of the methods'
    });
  });
});
