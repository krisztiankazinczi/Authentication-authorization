const supertest = require('supertest');
const app = require('../../app');
const request = supertest(app);
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../../models/userModel');

jest.setTimeout(10000);

dotenv.config();

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

beforeAll(async () => {
  await mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  });
  await User.deleteOne({ email: 'test1@test.com' });
});

afterAll(async done => {
  // Closing the DB connection allows Jest to exit successfully.
  mongoose.connection.close();
  done();
});

let validToken;

// Helper functions
const isResSuccess = res => {
  if (!validToken && res.body.token) validToken = res.body.token;
  return res.body.status === 'success' ? true : false;
};

const isResFail = res => {
  return res.body.status === 'fail' ? true : false;
};

// describe('Fake URL test', () => {
//   it('Should get 404 if endpoint not exists', async () => {
//     await request
//       .get('/api/v1/users/notexistingurl')
//       .expect(404)
//       .end(function(err, res) {
//         if (err) return done(err);
//         done();
//       });
//   });
// });

describe.skip('Signup test cases', () => {
  it('Should signup a user', async () => {
    await request
      .post('/api/v1/users/signup')
      .send({
        email: 'test1@test.com',
        password: 'valami1234',
        passwordConfirm: 'valami1234',
        name: 'test1'
      })
      .expect(isResSuccess);
  });
});

describe.skip('Login test cases', () => {
  it('Should login a user', async () => {
    await request
      .post('/api/v1/users/login')
      .send({
        email: 'test@test.com',
        password: 'valami1234'
      })
      .expect(isResSuccess);
  });
});

describe.skip('Forgot password test cases', () => {
  it('Should get success if existing email in our database was provided', async () => {
    await request
      .post('/api/v1/users//forgotPassword')
      .send({
        email: 'test@test.com'
      })
      .expect(200)
      .then(response => {
        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('message', 'Token sent to email!');
      });
  });
});

var auth = {};

// describe('Update password', () => {
//   it('Should get success if I update my password', async () => {
//     await loginUser(auth);
//     try {
//       await request
//         .patch('/api/v1/users/updateMyPassword')
//         .send({
//           passwordCurrent: 'valami1234',
//           password: 'valami1234',
//           passwordConfirm: 'valami1234'
//         })
//         // .set('Authorization', `bearer ${auth.token}`)
//         .expect(200)
//         .then((err, response) => {
//           if (err) console.log('valamilyen error van');
//           expect(response.status).toEqual(200);
//           expect(response.body).toHaveProperty('status', 'success');
//         });
//     } catch (error) {
//       console.log(error);
//     }
//   });
// });

function loginUser(auth) {
  return function(done) {
    request
      .post('/api/v1/users/login')
      .send({
        email: 'test@test.com',
        password: 'valami1234'
      })
      .expect(200)
      .end(onResponse);

    function onResponse(err, res) {
      auth.token = res.body.token;
      return done();
    }
  };
}
