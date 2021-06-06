import Db, { getId } from '@/model/db';

// import PouchDb from 'pouchdb';
// import PouchDbDebug from 'pouchdb-debug';

// PouchDb.plugin(PouchDbDebug);
// PouchDb.debug.enable('*');

/*
  To test only this file:
    npm run test:unit -t 'tests/unit/db.spec.js'
  See:
    https://stackoverflow.com/questions/54908671/vue-cli-unit-test-with-jest-how-to-run-single-test
*/

describe('db.js', () => {
  afterEach(async () => {
    const db = new Db();
    await db.destroyDb();
  });

  it('Should create a db.', async () => {
    const db = new Db();
    const info = await db.getDbInfo();

    expect(info).toBeDefined();
  });

  it('Should create a deck.', async () => {
    const db = new Db();
    const obj = {
      description: 'Hello World Deck',
      notes: 'Nothing to say.',
    };
    const result = await db.createDeck(obj);

    expect(result).toBeDefined();
  });

  it('Should create a card.', async () => {
    const db = new Db();
    const obj = {
      deckId: 1,
      sideA: 'Hello',
      sideB: 'World',
      tags: '',
      notes: '',
      noBA: false,
    };
    const result = await db.createCard(obj);

    expect(result).toBeDefined();
  });

  it('Should create a review.', async () => {
    const db = new Db();
    const obj = {
      deckId: 1,
      cardId: 1,
      isBA: false,
      value: 5,
      date: new Date(),
    };
    const result = await db.createReview(obj);

    expect(result).toBeDefined();
  });

  it('Should read a deck.', async () => {
    const db = new Db();
    const obj = {
      description: 'Deck',
      notes: '',
    };
    const tmp = await db.createDeck(obj);

    const result = await db.readDeck(tmp);

    expect(result).toBeDefined();
  });

  it('Should read a card.', async () => {
    const db = new Db();
    const obj = {
      deckId: 1,
      sideA: 'Card Side A',
      sideB: 'Card Side B',
      tags: '',
      notes: '',
      noBA: false,
    };
    const tmp = await db.createCard(obj);

    const result = await db.readCard(tmp);

    expect(result).toBeDefined();
  });

  it('Should update a deck.', async () => {
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

  it('Should delete a deck.', async () => {
    const db = new Db();

    const objDeck = {
      description: 'Deck',
      notes: '',
    };
    const tmpDeck = await db.createDeck(objDeck);

    const objCard = {
      deckId: getId(tmpDeck),
      sideA: 'Card Side A',
      sideB: 'Card Side B',
      tags: '',
      notes: '',
      noBA: false,
    };
    const tmpCard = await db.createCard(objCard);

    const objReview = {
      deckId: getId(tmpDeck),
      cardId: getId(tmpCard),
      isBA: false,
      value: 5,
      date: new Date(),
    };
    const tmpReview = await db.createReview(objReview);

    await db.deleteDeck(tmpDeck);

    const resultDeck = await db.readDeck(tmpDeck);

    expect(resultDeck).toBeNull();

    const resultCard = await db.readCard(tmpCard);

    expect(resultCard).toBeNull();

    const resultReview = await db.readReview(tmpReview);

    expect(resultReview).toBeNull();
  });

  it('Should delete a card.', async () => {
    const db = new Db();

    const objCard = {
      deckId: 1,
      sideA: 'Card Side A',
      sideB: 'Card Side B',
      tags: '',
      notes: '',
      noBA: false,
    };
    const tmpCard = await db.createCard(objCard);

    const objReview = {
      deckId: 1,
      cardId: getId(tmpCard),
      isBA: false,
      value: 5,
      date: new Date(),
    };
    const tmpReview = await db.createReview(objReview);

    await db.deleteCard(tmpCard);

    const resultCard = await db.readCard(tmpCard);

    expect(resultCard).toBeNull();

    const resultReview = await db.readReview(tmpReview);

    expect(resultReview).toBeNull();
  });

  it('Should search decks.', async () => {
    const db = new Db();

    const obj1 = {
      description: 'Mondo',
      notes: 'Deck A',
    };
    await db.createDeck(obj1);

    const obj2 = {
      description: 'Ciao',
      notes: 'Deck B',
    };
    await db.createDeck(obj2);

    const resultSelector = await db.searchDecks('Ciao');

    expect(resultSelector.docs).toHaveLength(1);

    const resultSort = await db.searchDecks('Deck');

    expect(resultSort.docs).toHaveLength(2);
    expect(resultSort.docs[0].description).toEqual('Ciao');
  });

  it('Should search cards.', async () => {
    const db = new Db();

    const obj1 = {
      deckId: 1,
      sideA: 'Hello',
      sideB: 'World',
      tags: '',
      notes: 'Bye',
      noBA: false,
    };
    await db.createCard(obj1);

    const obj2 = {
      deckId: 1,
      sideA: 'Ciao',
      sideB: 'Mondo',
      tags: '',
      notes: 'Bye',
      noBA: false,
    };
    await db.createCard(obj2);

    const obj3 = {
      deckId: 2,
      sideA: 'Ciao',
      sideB: 'World',
      tags: 'Intruder',
      notes: 'Bye',
      noBA: false,
    };
    await db.createCard(obj3);

    const resultSelector = await db.searchCards(1, 'Ciao');

    expect(resultSelector.docs).toHaveLength(1);

    const resultSort = await db.searchCards(1, 'Bye');

    expect(resultSort.docs).toHaveLength(2);
    expect(resultSort.docs[0].sideA).toEqual('Ciao');
  });

  it('Should search the next card to review', async () => {
    const db = new Db();

    const newCard01 = {
      deckId: 1,
      sideA: 'A01',
      sideB: 'B01',
      noBA: false,
      lastAB: new Date(),
      nextAB: new Date(),
      lastBA: new Date(),
      nextBA: new Date(),
    };
    await db.createCard(newCard01);

    const newCard02 = {
      deckId: 1,
      sideA: 'A02',
      sideB: 'B02',
      noBA: false,
      lastAB: new Date(),
      nextAB: new Date(),
      lastBA: new Date(),
      nextBA: new Date(),
    };
    await db.createCard(newCard02);

    const result = await db.searchNextCardToReview(1);

    expect(result).toBeDefined();
  });

  it('Should review.', async () => {
    const db = new Db();

    const newCard = {
      deckId: 1,
      sideA: 'Side A',
      sideB: 'Side B',
      noBA: false,
    };
    const tmpCard = await db.createCard(newCard);

    const cardToReview = {
      cardId: getId(tmpCard),
      isBA: false,
    };
    await db.review(cardToReview, 0, new Date(), new Date());

    const result = await db.readCard(getId(tmpCard));

    expect(result?.lastAB).toBeDefined();
    expect(result?.nextAB).toBeDefined();
  });
});
