const request = require('supertest');
const express = require('express');
const authRoutes = require('./auth');
const authController = require('../controllers/authController');

// Mock the controller functions
jest.mock('../controllers/authController');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
    it('should call authController.register on POST /auth/register', async () => {
        authController.register.mockImplementation((req, res) => res.status(201).send());
        const res = await request(app)
            .post('/auth/register')
            .send({
                nombre_completo: 'Test User',
                email: 'test@example.com',
                password: 'password'
            });
        expect(res.statusCode).toEqual(201);
        expect(authController.register).toHaveBeenCalled();
    });

    it('should call authController.login on POST /auth/login', async () => {
        authController.login.mockImplementation((req, res) => res.status(200).send());
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password'
            });
        expect(res.statusCode).toEqual(200);
        expect(authController.login).toHaveBeenCalled();
    });
});
