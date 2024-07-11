// import {server} from "../app";
// import supertest from "supertest";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// dotenv.config
// const request = supertest(server);
// const MONGODB_CONNECTION = process.env.MONGODB_CONNECTION;

// describe("Testing user endpoints CRUD--Functionality", () => {

//     beforeAll(done => {
//         mongoose.connect(`${MONGODB_CONNECTION}`).then(() => {
//             console.log("mongoDB Connected successfully ✅");
//             done();
//         });
//     });
//     afterAll(done => {
//         mongoose.connection.db.dropDatabase(() => {
//             mongoose.connection.close(() => done());
//         });
//     })
//     const newUser = { firstName: "John", lastName: "Doe", email: "john.doe@gmail.com" };
//     let InvaludUser = { email: "" };

//     it("should get all users", async () => {
//         const response = await request.get("/users");
//         expect(response.status).toBe(200);
//     })

//     it("should create a new user", async () => {
//         const response = await request.post("/users").send(newUser);
//         expect(response.status).toBe(200);

//     })
//     it("should get a user by id", async () => {
//         const response = await request.get("/users/60c4c4f8e6f2d7e0b0e2c1f9");
//         expect(response.status).toBe(200);
//     })

//     it("should update a user by id", async () => {
//         const response = await request.put("/users/60c4c4f8e6f2d7e0b0e2c1f9").send(newUser);
//         expect(response.status).toBe(200);
//     })

//     it("should delete a user by id", async () => {
//         const response = await request.delete("/users/60c4c4f8e6f2d7e0b0e2c1f9");
//         expect(response.status).toBe(200);
//     })
// })

