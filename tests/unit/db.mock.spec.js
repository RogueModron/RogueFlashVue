import Db from '@/model/db';
import PouchDb from 'pouchdb';

// See:
//  https://stackoverflow.com/questions/48790927/how-to-change-mock-implementation-on-a-per-single-test-basis-jestjs

jest.mock('../../node_modules/pouchdb');

const mockedPouchDbImplFactory = function mockedPouchDbImplFactory(overrides) {
  return {
    get: jest.fn().mockImplementation((id) => Promise.resolve({
      _id: id,
    })),
    info: jest.fn().mockImplementation(() => ({ db: 'Mocked PouchDb' })),
    post: jest.fn().mockImplementation((doc) => {
      // eslint-disable-next-line
      let id = doc._id;
      if (typeof (id) === 'undefined') {
        id = (new Date()).getTime();
      }
      return Promise.resolve({
        id,
      });
    }),
    put: jest.fn().mockImplementation((doc) => {
      // eslint-disable-next-line
      const id = doc._id;
      return Promise.resolve({
        id,
      });
    }),
    plugin: jest.fn(),
    ...overrides,
  };
};

describe('db.js - mock PouchDb', () => {
  it('Should create a db.', async () => {
    PouchDb.mockImplementation(mockedPouchDbImplFactory);

    const db = new Db();
    const info = await db.getDbInfo();

    expect(info).toBeDefined();
  });

  it('Should create a deck.', async () => {
    PouchDb.mockImplementation(mockedPouchDbImplFactory);

    const db = new Db();
    const obj = {
      description: 'Hello World Deck',
      notes: 'Nothing to say.',
    };
    const result = await db.createDeck(obj);

    expect(result).toBeDefined();
  });

  it('Should read a deck.', async () => {
    PouchDb.mockImplementation(() => mockedPouchDbImplFactory({
      get: jest.fn((id) => Promise.resolve({
        _id: id,
        'rf-type': 'deck',
      })),
    }));

    const db = new Db();
    const obj = {
      description: 'Deck',
      notes: '',
    };
    const tmp = await db.createDeck(obj);

    const result = await db.readDeck(tmp);

    expect(result).toBeDefined();
  });

  it('Should update a deck.', async () => {
    function defaultMockedGet(id) {
      return Promise.resolve({
        _id: id,
        'rf-type': 'deck',
      });
    }
    function updatedMockedGet(id) {
      return Promise.resolve({
        _id: id,
        'rf-type': 'deck',
        notes: 'Updated',
      });
    }

    PouchDb.mockImplementation(() => mockedPouchDbImplFactory({
      get: jest.fn()
        .mockImplementationOnce(defaultMockedGet)
        .mockImplementationOnce(defaultMockedGet)
        .mockImplementationOnce(defaultMockedGet)
        .mockImplementationOnce(defaultMockedGet)
        .mockImplementationOnce(updatedMockedGet),
    }));

    const db = new Db();
    const obj = {
      description: 'Deck',
      notes: '',
    };
    const tmp = await db.createDeck(obj);

    const r1 = await db.readDeck(tmp);

    r1.notes = 'Updated';

    await db.updateDeck(r1);

    const r2 = await db.readDeck(tmp);

    expect(r2?.notes).toBe('Updated');
  });
});
