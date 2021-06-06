import cloneDeep from 'lodash-es/cloneDeep';
import isEqual from 'lodash-es/isEqual';
import PouchDb from 'pouchdb';
import PouchDbFind from 'pouchdb-find';

PouchDb.plugin(PouchDbFind);

class Db {
  static get defaultDatabaseName() {
    return 'RogueFlashVue';
  }

  static #deckType = 'deck';

  static #cardType = 'card';

  static #reviewType = 'review';

  static #typeProperty = 'rf-type';

  static #fnCheckType = function fnCheckType(obj, type) {
    return obj[Db.#typeProperty] === type;
  }

  #fnCreate = async function fnCreate(obj, type) {
    const newObj = cloneDeep(obj);
    newObj[Db.#typeProperty] = type;

    const ref = await this.db.post(newObj);
    return this.db.get(ref.id);
  }

  #fnRead = async function fnRead(obj, type) {
    const id = Db.getId(obj);

    let result = null;

    try {
      result = await this.db.get(id);
    } catch (ex) {
      if (ex.name === 'not_found') {
        return null;
      }
      throw ex;
    }

    if (!Db.#fnCheckType(result, type)) {
      throw new Error(`Object is not a ${type}.`);
    }

    return result;
  }

  #fnUpdate = async function fnUpdate(obj, type) {
    if (!Db.#fnCheckType(obj, type)) {
      throw new Error(`Object is not a ${type}.`);
    }

    const id = Db.getId(obj);
    const current = await this.db.get(id);

    if (!Db.#fnCheckType(current, type)) {
      throw new Error('Cannot change type.');
    }

    if (isEqual(current, obj)) {
      return null;
    }

    const ref = await this.db.put(obj);
    return this.db.get(ref.id);
  }

  constructor(databaseName) {
    if (typeof (databaseName) === 'string'
              && databaseName !== '') {
      this.db = new PouchDb(databaseName);
    } else {
      this.db = new PouchDb(Db.defaultDatabaseName);
    }
  }

  static getId(obj) {
    // eslint-disable-next-line
    let id = obj._id || obj.id;
    if (typeof (id) !== 'undefined') {
      return id;
    }
    if (typeof (obj) === 'string') {
      return obj;
    }
    throw new Error('Cannot get a valid id.');
  }

  static getRev(obj) {
    // eslint-disable-next-line
    let rev = obj._rev || obj.rev;
    if (typeof (rev) !== 'undefined') {
      return rev;
    }
    if (typeof (obj) === 'string') {
      return obj;
    }
    throw new Error('Cannot get a valid rev.');
  }

  static setRev(obj, rev) {
    // eslint-disable-next-line
    obj._rev = rev;
  }

  async destroyDb() {
    await this.db.destroy();
  }

  async getDbInfo() {
    return this.db.info();
  }

  async createDeck(obj) {
    return this.#fnCreate(obj, Db.#deckType);
  }

  async createCard(obj) {
    return this.#fnCreate(obj, Db.#cardType);
  }

  async createReview(obj) {
    return this.#fnCreate(obj, Db.#reviewType);
  }

  async readDeck(obj) {
    return this.#fnRead(obj, Db.#deckType);
  }

  async readCard(obj) {
    return this.#fnRead(obj, Db.#cardType);
  }

  async readReview(obj) {
    return this.#fnRead(obj, Db.#reviewType);
  }

  async updateDeck(obj) {
    return this.#fnUpdate(obj, Db.#deckType);
  }

  async updateCard(obj) {
    return this.#fnUpdate(obj, Db.#cardType);
  }

  async updateReview(obj) {
    return this.#fnUpdate(obj, Db.#reviewType);
  }

  async deleteDeck(obj) {
    const id = Db.getId(obj);
    const deck = await this.#fnRead(id, Db.#deckType);
    if (deck === null) {
      throw new Error(`Deck not found: ${id}.`);
    }

    const refs = await this.db.find({
      fields: [
        '_id',
        '_rev',
        Db.#typeProperty,
      ],
      selector: {
        deckId: id,
      },
    });
    if (refs?.docs) {
      refs.docs.forEach((ref) => {
        if (!Db.#fnCheckType(ref, Db.#cardType)
            && !Db.#fnCheckType(ref, Db.#reviewType)) {
          throw new Error(`Object is not a card or a review: ${ref.id}.`);
        }
        // eslint-disable-next-line
        ref._deleted = true;
      });
      this.db.bulkDocs(refs.docs);
    }

    this.db.remove(deck);
  }

  async deleteCard(obj) {
    const id = Db.getId(obj);
    const card = await this.#fnRead(id, Db.#cardType);
    if (card === null) {
      throw new Error('Card not found.');
    }

    const refs = await this.db.find({
      fields: [
        '_id',
        '_rev',
        Db.#typeProperty,
      ],
      selector: {
        cardId: id,
      },
    });
    if (refs?.docs) {
      refs.docs.forEach((ref) => {
        if (!Db.#fnCheckType(ref, Db.#reviewType)) {
          throw new Error('Object is not a review.');
        }
        // eslint-disable-next-line
        ref._deleted = true;
      });
      this.db.bulkDocs(refs.docs);
    }

    this.db.remove(card);
  }

  async deleteReview(obj) {
    const id = Db.getId(obj);
    const review = await this.#fnRead(id, Db.#reviewType);
    if (review === null) {
      throw new Error('Review not found.');
    }

    this.db.remove(review);
  }

  async searchDecks(searchKey = '', limit = 10, offset = 0) {
    await this.db.createIndex({
      index: {
        fields: [
          Db.#typeProperty,
          'description',
          'notes',
        ],
        ddoc: 'idx_type_description',
      },
    });

    const selector = {};
    selector[Db.#typeProperty] = Db.#deckType;

    if (typeof (searchKey) === 'string'
          && searchKey.length > 0) {
      selector.description = {
        $gt: null,
      };
      selector.notes = {
        $gt: null,
      };

      const rg = {
        $regex: new RegExp(searchKey, 'i'),
      };
      selector.$or = [
        {
          description: rg,
        },
        {
          notes: rg,
        },
      ];
    }

    return this.db.find({
      selector,
      sort: [
        Db.#typeProperty,
        'description',
      ],
      limit,
      skip: offset,
      use_index: 'idx_type_description',
    });
  }

  async searchCards(deckId, searchKey = '', limit = 10, offset = 0) {
    await this.db.createIndex({
      index: {
        fields: [
          'deckId',
          Db.#typeProperty,
          'sideA',
          'sideB',
          'tags',
          'notes',
        ],
        ddoc: 'idx_type_sideA',
      },
    });

    const selector = {
      deckId,
    };
    selector[Db.#typeProperty] = Db.#cardType;

    if (typeof (searchKey) === 'string'
          && searchKey.length > 0) {
      selector.sideA = {
        $gt: null,
      };
      selector.sideB = {
        $gt: null,
      };
      selector.tags = {
        $gt: null,
      };
      selector.notes = {
        $gt: null,
      };

      const rg = {
        $regex: new RegExp(searchKey, 'i'),
      };
      selector.$or = [
        {
          sideA: rg,
        },
        {
          sideB: rg,
        },
        {
          tags: rg,
        },
        {
          notes: rg,
        },
      ];
    }

    return this.db.find({
      selector,
      sort: [
        'deckId',
        Db.#typeProperty,
        'sideA',
      ],
      limit,
      skip: offset,
      use_index: 'idx_type_sideA',
    });
  }

  async searchNextCardToReview(deckId) {
    await this.db.createIndex({
      index: {
        fields: [
          'deckId',
          Db.#typeProperty,
          'sideA',
          'sideB',
          'nextAB',
          'nextBA',
        ],
        ddoc: 'idx_type_nextABBA',
      },
    });

    const selector = {
      deckId,
    };
    selector[Db.#typeProperty] = Db.#cardType;

    selector.sideA = {
      $gt: '',
    };
    selector.sideB = {
      $gt: '',
    };

    selector.nextAB = {
      $exists: true,
    };
    selector.nextBA = {
      $exists: true,
    };

    const date = new Date();
    selector.$or = [
      {
        nextAB: {
          $lte: date,
        },
        nextBA: {
          $lte: date,
        },
      },
    ];

    const data = await this.db.find({
      selector,
      use_index: 'idx_type_nextABBA',
    });
    const cards = data.docs;

    if (!cards.length) {
      return null;
    }

    const cardsByNextAB = cards.sort(
      (cardA, cardB) => Db.#fnCardNextDateComparer(cardA, cardB, 'nextAB'),
    );
    const cardsByNextBA = cards.sort(
      (cardA, cardB) => Db.#fnCardNextDateComparer(cardA, cardB, 'nextBA'),
    );
    const nextCard = [cardsByNextAB[0], cardsByNextBA[0]].sort(
      (cardA, cardB) => Db.#fnCardNextDateComparer(cardA, cardB, 'nextAB', true),
    )[0];
    return Db.#fnFromCardToCardToReview(nextCard);
  }

  static #fnCardNextDateComparer = function fnCardNextDateComparer(
    cardA, cardB, property, crossComparison = false,
  ) {
    const propertyA = property;

    let propertyB = property;
    if (crossComparison) {
      propertyB = (property === 'nextAB' ? 'nextBA' : 'nextAB');
    }

    const nextA = cardA[propertyA];
    if (typeof (nextA) === 'undefined') {
      return -1;
    }
    const nextB = cardB[propertyB];
    if (typeof (nextB) === 'undefined') {
      return 1;
    }
    if (nextA <= nextB) {
      return -1;
    }
    return 1;
  }

  static #fnFromCardToCardToReview = function fnFromCardToCardToReview(card) {
    const isAB = Db.#fnCardNextDateComparer(card, card, 'nextAB', true) <= 0;
    const cardToReview = {
      id: Db.getId(card),
      sideA: isAB ? card.sideA : card.sideB,
      sideB: isAB ? card.sideB : card.sideA,
      notes: card.notes,
      isBA: !isAB,
      lastDate: isAB ? card.lastAB : card.lastBA,
    };
    return cardToReview;
  }

  async review(cardToReview, value, date, next) {
    const id = Db.getId(cardToReview);
    const card = await this.readCard(id);

    if (cardToReview.isBA) {
      card.lastBA = date;
      card.nextBA = next;
    } else {
      card.lastAB = date;
      card.nextAB = next;
    }
    await this.updateCard(card);

    const newReview = {
      cardId: cardToReview.cardId,
      isBA: cardToReview.isBA,
      date,
      value,
    };
    await this.createReview(newReview);
  }
}

export default Db;
export const {
  getId,
  getRev,
  setRev,
} = Db;
