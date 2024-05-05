import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestService } from './test.service';
import { TestModule } from './test.module';

describe('EmployeeController', () => {
  let app: INestApplication;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testService = app.get(TestService);
  });

  describe('POST /api/users', () => {
    beforeEach(async () => {
      await testService.deleteEmployee();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send({
          email: 'test@example',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to create employee', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/employees')
        .send({
          first_name: 'bos',
          last_name: 'andrey',
          position: 'CEO',
          email: 'test@example.com',
          phone: '9999',
        });


      expect(response.status).toBe(200);
      expect(response.body.data[0].id).toBeDefined();
      expect(response.body.data[0].first_name).toBe('bos');
      expect(response.body.data[0].last_name).toBe('andrey');
      expect(response.body.data[0].position).toBe('CEO');
      expect(response.body.data[0].email).toBe('test@example.com');
      expect(response.body.data[0].phone).toBe('9999');
    });
  });
});
