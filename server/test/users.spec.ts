import * as chai from "chai";
import { after, before, it } from "mocha";
import chaiHttp = require("chai-http");

import * as server from "../server";

import { User } from "../models/user";
import { testUser, testUserWrongPass } from "../config/seed";

process.env.NODE_ENV = "test";

const expect = chai.expect;
chai.use(chaiHttp);

describe("POST /register", () => {
  before(async function() {
    await User.deleteMany({});
  });

  after(async function() {
    await User.deleteMany({});
  });

  it("should register a new user with valid parameters", async function() {
    const res = await chai
      .request(server)
      .post("/api/v1/users/register")
      .send(testUser);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.a("object");
    expect(res.body).to.have.property("token");
  });

  it("should return some defined error message with valid parameters", async function() {
    const res = await chai
      .request(server)
      .post("/api/v1/users/register")
      .send(testUser);

    expect(res.status).to.equal(400);
  });
});

describe("POST /login", () => {
  before(async function() {
    const res = await chai
      .request(server)
      .post("/api/v1/users/register")
      .send(testUser);
  });

  it("should get a log in user", async function() {
    const res = await chai
      .request(server)
      .post("/api/v1/users/login")
      .send(testUser);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.a("object");
    expect(res.body).to.have.property("token");
  });

  it("should return error with error message ", async function() {
    const res = await chai
      .request(server)
      .post("/api/v1/users/login")
      .send(testUserWrongPass);

    expect(res.status).to.equal(401);
  });
});
