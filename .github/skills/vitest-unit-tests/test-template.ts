/**
 * Unit test scaffold for OctoCAT API routes.
 *
 * Copy this file, rename it to match the source route file
 * (e.g. supplier.ts → supplier.test.ts), then fill in the
 * TODOs. Run: npm run test --workspace=api
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import Database from 'better-sqlite3';
import { migrate } from '../../db/migrate'; // adjust relative path as needed

// TODO: import the router factory for the entity under test
// import { createEntityRouter } from './entity';

let db: Database.Database;
let app: express.Express;

beforeEach(() => {
  // Fresh in-memory DB for every test — migrations applied automatically
  db = new Database(':memory:');
  migrate(db);

  app = express();
  app.use(express.json());

  // TODO: mount the route
  // app.use('/entities', createEntityRouter(db));

  // TODO: seed minimal reference data required by the entity
  // e.g. if supplier requires a headquartersId:
  // db.prepare(`INSERT INTO headquarters (id, name) VALUES (1, 'HQ')`).run();
});

// ---------------------------------------------------------------------------
// Happy-Path Tests
// ---------------------------------------------------------------------------

describe('GET /', () => {
  it('returns 200 and an empty array when no entities exist', async () => {
    const res = await request(app).get('/entities').expect(200);
    expect(res.body).toEqual([]);
  });

  it('returns 200 and all entities after inserting one', async () => {
    // TODO: insert a record directly into db
    const res = await request(app).get('/entities').expect(200);
    expect(res.body).toHaveLength(1);
    // TODO: assert camelCase field names on res.body[0]
  });
});

describe('GET /:id', () => {
  it('returns 200 and the correct entity', async () => {
    // TODO: insert a record, then GET it by ID
    const res = await request(app).get('/entities/1').expect(200);
    expect(res.body).toMatchObject({ id: 1 /* TODO: add key fields */ });
  });

  it('returns 404 for an unknown ID', async () => {
    await request(app).get('/entities/9999').expect(404);
  });
});

describe('POST /', () => {
  it('returns 201 and the created entity', async () => {
    const payload = {
      // TODO: fill in required fields
    };
    const res = await request(app).post('/entities').send(payload).expect(201);
    expect(res.body).toMatchObject(payload);
    // TODO: assert the record was persisted in db
  });

  it('returns 400/422 when required fields are missing', async () => {
    await request(app).post('/entities').send({}).expect((res) => {
      expect([400, 422]).toContain(res.status);
    });
  });
});

describe('PUT /:id', () => {
  it('returns 200 and the updated entity', async () => {
    // TODO: insert a record first
    const update = { /* TODO: field to update */ };
    const res = await request(app).put('/entities/1').send(update).expect(200);
    expect(res.body).toMatchObject(update);
  });

  it('returns 404 for an unknown ID', async () => {
    await request(app).put('/entities/9999').send({ /* any field */ }).expect(404);
  });
});

describe('DELETE /:id', () => {
  it('removes the entity and returns 200/204', async () => {
    // TODO: insert a record first
    await request(app).delete('/entities/1').expect((res) => {
      expect([200, 204]).toContain(res.status);
    });
    // TODO: verify the record is gone
  });

  it('returns 404 for an unknown ID', async () => {
    await request(app).delete('/entities/9999').expect(404);
  });
});
