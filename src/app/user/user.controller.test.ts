import { testRequest } from '@/lib/test/test-request';
import { userFactory } from '@/lib/test/test-factories';
import { db } from '@/db';
import { verifyToken } from '@/lib/helpers/jwt';
import { comparePassword, encryptPassword } from '@/lib/helpers/bcrypt';

describe('USER CONTROLLER', () => {
  describe('REGISTER - POST - /users', () => {
    // pick params to use for this request
    const params = userFactory.pick({
      username: true,
      email: true,
      password: true,
    });

    it('should register a new user, save it with hashed password, return a user and a token', async () => {
      // build an object with randomly generated data
      const data = params.build();

      // perform a POST request to the /users endpoint with the data
      const res = await testRequest.post('/users', data);

      // ensure that response has a correct data
      const json = res.json();
      expect(json).toMatchObject({
        user: {
          username: data.username,
          email: data.email,
        },
        token: expect.any(String),
      });

      // check that the user was saved to the database with the correct fields
      const savedUser = await db.user.findBy({ username: data.username });
      expect(savedUser).toMatchObject({
        username: data.username,
        email: data.email,
      });

      // ensure that we don't store plain text passwords to the database
      expect(savedUser.password).not.toBe(data.password);
      expect(verifyToken(json.token)).toMatchObject({ id: savedUser.id });
      expect(comparePassword(data.password, savedUser.password));
    });

    it('should return error when username is taken', async () => {
      // build new randomly generated params
      const data = params.build();
      // create a new user with this specific username
      await userFactory.create({ username: data.username });

      // perform request
      const res = await testRequest.post('/users', data);

      // expect error because a user with such username was created before the request
      expect(res.json()).toMatchObject({
        error: 'Username is already taken',
      });
    });

    // similar to username test
    it('should return error when email is taken', async () => {
      const data = params.build();
      await userFactory.create({ email: data.email });

      const res = await testRequest.post('/users', data);

      expect(res.json()).toMatchObject({
        error: 'Email is already taken',
      });
    });
  });

  describe('LOGIN - POST - /users/auth', () => {
    it('should authorize user, return user object and auth token', async () => {
      const password = 'password';
      const user = await userFactory.create({
        password: await encryptPassword(password),
      });

      const res = await testRequest.post('/users/auth', {
        email: user.email,
        password,
      });

      const json = res.json();
      expect(json).toMatchObject({
        user: {
          username: user.username,
          email: user.email,
        },
        token: expect.any(String),
      });

      expect(verifyToken(json.token)).toMatchObject({ id: user.id });
    });

    it('should return error when email is not registered', async () => {
      const res = await testRequest.post('/users/auth', {
        email: 'not-registered@test.com',
        password: 'password',
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toMatchObject({
        error: 'Email or password is invalid',
      });
    });

    it('should return error when password is invalid', async () => {
      const user = await userFactory.create();

      const res = await testRequest.post('/users/auth', {
        email: user.email,
        password: 'invalid password',
      });

      expect(res.statusCode).toBe(400);
      expect(res.json()).toMatchObject({
        error: 'Email or password is invalid',
      });
    });
  });

  // src/app/user/user.controller.test.ts

  describe('FOLLOW - POST - /users/:username/follow', () => {
    it('should follow a user', async () => {
      // create a user to perform the request from
      const currentUser = await userFactory.create();
      // create a user to follow
      const userToFollow = await userFactory.create();

      // perform request as a provided user
      await testRequest
        .as(currentUser)
        .post(`/users/${userToFollow.username}/follow`);

      // check that the userToFollow record exists in the database
      // TODO: this is not working, need to fix
      const follows = await db.user_follow.where({
        following_id: userToFollow.id,
      });

      expect(follows).toEqual([
        {
          follower_id: currentUser.id,
          following_id: userToFollow.id,
        },
      ]);
    });

    // it('should return not found error when no user found by username', async () => {
    //   const currentUser = await userFactory.create();

    //   const res = await testRequest
    //     .as(currentUser)
    //     .post(`/users/lalala/follow`);

    //   expect(res.json()).toEqual({
    //     message: 'Record is not found',
    //   });
    // });
  });

  // describe('DELETE /users/:username/follow', () => {
  //   it('should unfollow a user', async () => {
  //     const currentUser = await userFactory.create();
  //     const userToFollow = await userFactory.create({
  //       follows: { create: [{ follower_id: currentUser.id }] },
  //     });

  //     await testRequest
  //       .as(currentUser)
  //       .delete(`/users/${userToFollow.username}/follow`);

  //     const follows = await db.user_follow.where({
  //       following_id: userToFollow.id,
  //     });
  //     expect(follows).toEqual([]);
  //   });

  //   it('should return not found error when no user found by username', async () => {
  //     const currentUser = await userFactory.create();

  //     const res = await testRequest
  //       .as(currentUser)
  //       .post(`/users/lalala/follow`);

  //     // check that such userFollow record doesn't exist
  //     const exists = await db.user_follow
  //       .where({
  //         following_id: userToFollow.id,
  //       })
  //       .exists();
  //     expect(exists).toEqual(false);
  //   });
  // });
});
