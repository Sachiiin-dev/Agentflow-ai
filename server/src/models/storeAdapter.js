const mongoose = require('mongoose');
const crypto = require('crypto');
const { getDBStatus } = require('../config/db');

// In-memory collections map
const inMemoryCollections = new Map();

const getCollection = (name) => {
  if (!inMemoryCollections.has(name)) {
    inMemoryCollections.set(name, new Map());
  }
  return inMemoryCollections.get(name);
};

const matchesQuery = (doc, query = {}) => {
  if (!query || Object.keys(query).length === 0) return true;
  
  for (const [key, val] of Object.entries(query)) {
    if (key === '$or' && Array.isArray(val)) {
      const match = val.some((subQuery) => matchesQuery(doc, subQuery));
      if (!match) return false;
      continue;
    }
    
    if (key === '_id') {
      const docId = String(doc._id);
      const queryId = String(val);
      if (docId !== queryId) return false;
      continue;
    }

    if (val && typeof val === 'object' && !Array.isArray(val)) {
      if (val.$regex) {
        const regex = new RegExp(val.$regex, val.$options || '');
        if (!regex.test(String(doc[key] || ''))) return false;
        continue;
      }
      if (val.$in && Array.isArray(val.$in)) {
        if (!val.$in.includes(doc[key])) return false;
        continue;
      }
      if (val.$gte !== undefined && Number(doc[key]) < val.$gte) return false;
      if (val.$lte !== undefined && Number(doc[key]) > val.$lte) return false;
      if (val.$gt !== undefined && Number(doc[key]) <= val.$gt) return false;
      if (val.$lt !== undefined && Number(doc[key]) >= val.$lt) return false;
      if (val.$ne !== undefined && doc[key] === val.$ne) return false;
    } else {
      if (String(doc[key]) !== String(val)) return false;
    }
  }
  return true;
};

class MemoryQuery {
  constructor(collectionName, query = {}, isSingle = false) {
    this.collectionName = collectionName;
    this.query = query;
    this.isSingle = isSingle;
    this._sort = null;
    this._limit = null;
    this._skip = 0;
    this._selectFields = null;
  }

  sort(sortObj) {
    this._sort = sortObj;
    return this;
  }

  limit(num) {
    this._limit = num;
    return this;
  }

  skip(num) {
    this._skip = num;
    return this;
  }

  select(fields) {
    this._selectFields = fields;
    return this;
  }

  lean() {
    return this;
  }

  async exec() {
    const col = getCollection(this.collectionName);
    let results = [];

    for (const doc of col.values()) {
      if (matchesQuery(doc, this.query)) {
        // Deep clone doc
        const cloned = JSON.parse(JSON.stringify(doc));
        results.push(cloned);
        if (this.isSingle) break;
      }
    }

    if (this._sort) {
      const [field, order] = Object.entries(this._sort)[0] || ['createdAt', -1];
      const factor = order === -1 || order === 'desc' ? -1 : 1;
      results.sort((a, b) => {
        if (a[field] > b[field]) return 1 * factor;
        if (a[field] < b[field]) return -1 * factor;
        return 0;
      });
    }

    if (this._skip > 0) {
      results = results.slice(this._skip);
    }

    if (this._limit && this._limit > 0) {
      results = results.slice(0, this._limit);
    }

    if (this.isSingle) {
      return results[0] || null;
    }

    return results;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

const createHybridModel = (modelName, mongooseSchema) => {
  const MongooseModel = mongoose.models[modelName] || mongoose.model(modelName, mongooseSchema);

  return {
    get isMongooseActive() {
      return !getDBStatus().isInMemoryFallback && mongoose.connection.readyState === 1;
    },

    async create(data) {
      if (this.isMongooseActive) {
        return await MongooseModel.create(data);
      }

      const col = getCollection(modelName);
      const id = data._id ? String(data._id) : crypto.randomBytes(12).toString('hex');
      const now = new Date();
      
      const doc = {
        ...data,
        _id: id,
        id: id,
        createdAt: data.createdAt || now,
        updatedAt: now,
      };

      col.set(id, doc);
      return JSON.parse(JSON.stringify(doc));
    },

    find(query = {}) {
      if (this.isMongooseActive) {
        return MongooseModel.find(query);
      }
      return new MemoryQuery(modelName, query, false);
    },

    findOne(query = {}) {
      if (this.isMongooseActive) {
        return MongooseModel.findOne(query);
      }
      return new MemoryQuery(modelName, query, true);
    },

    findById(id) {
      if (this.isMongooseActive) {
        return MongooseModel.findById(id);
      }
      return new MemoryQuery(modelName, { _id: String(id) }, true);
    },

    async findByIdAndUpdate(id, updateData, options = {}) {
      if (this.isMongooseActive) {
        return await MongooseModel.findByIdAndUpdate(id, updateData, { new: true, ...options });
      }

      const col = getCollection(modelName);
      const existing = col.get(String(id));
      if (!existing) return null;

      const updatePayload = updateData.$set ? { ...updateData.$set } : { ...updateData };
      const updated = {
        ...existing,
        ...updatePayload,
        updatedAt: new Date(),
      };

      col.set(String(id), updated);
      return JSON.parse(JSON.stringify(updated));
    },

    async updateOne(query, updateData) {
      if (this.isMongooseActive) {
        return await MongooseModel.updateOne(query, updateData);
      }

      const doc = await this.findOne(query);
      if (doc) {
        await this.findByIdAndUpdate(doc._id, updateData);
        return { modifiedCount: 1, matchedCount: 1 };
      }
      return { modifiedCount: 0, matchedCount: 0 };
    },

    async findByIdAndDelete(id) {
      if (this.isMongooseActive) {
        return await MongooseModel.findByIdAndDelete(id);
      }

      const col = getCollection(modelName);
      const existing = col.get(String(id));
      if (existing) {
        col.delete(String(id));
        return existing;
      }
      return null;
    },

    async deleteOne(query) {
      if (this.isMongooseActive) {
        return await MongooseModel.deleteOne(query);
      }

      const doc = await this.findOne(query);
      if (doc) {
        getCollection(modelName).delete(String(doc._id));
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    },

    async deleteMany(query) {
      if (this.isMongooseActive) {
        return await MongooseModel.deleteMany(query);
      }

      const col = getCollection(modelName);
      let count = 0;
      for (const [key, doc] of col.entries()) {
        if (matchesQuery(doc, query)) {
          col.delete(key);
          count++;
        }
      }
      return { deletedCount: count };
    },

    async countDocuments(query = {}) {
      if (this.isMongooseActive) {
        return await MongooseModel.countDocuments(query);
      }

      const col = getCollection(modelName);
      let count = 0;
      for (const doc of col.values()) {
        if (matchesQuery(doc, query)) count++;
      }
      return count;
    },

    // Reference to native Mongoose model if needed
    _mongooseModel: MongooseModel,
  };
};

module.exports = {
  createHybridModel,
  getCollection,
};
