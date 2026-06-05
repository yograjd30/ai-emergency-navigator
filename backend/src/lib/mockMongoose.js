import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(modelName) {
  return path.join(DATA_DIR, `${modelName.toLowerCase()}s.json`);
}

function readData(modelName) {
  const filePath = getFilePath(modelName);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`Error reading ${modelName} data:`, err);
    return [];
  }
}

function writeData(modelName, data) {
  const filePath = getFilePath(modelName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${modelName} data:`, err);
  }
}

function matchesQuery(item, query) {
  if (!query) return true;
  
  // If query is a string or ObjectId representing an ID
  if (typeof query === 'string') {
    return item._id === query;
  }
  
  for (const key of Object.keys(query)) {
    const val = query[key];
    
    if (key === '$or') {
      if (!Array.isArray(val)) return false;
      let matchOr = false;
      for (const orCond of val) {
        if (matchesQuery(item, orCond)) {
          matchOr = true;
          break;
        }
      }
      if (!matchOr) return false;
    } else if (val && typeof val === 'object' && val.$in) {
      // Handle $in operator
      const inList = val.$in.map(x => x ? x.toString() : '');
      let itemVal = item[key];
      if (itemVal === undefined) {
        if (key === 'active') itemVal = true;
        else if (key === 'state') itemVal = 'ALL';
        else if (key === 'isEmergency') itemVal = false;
      }
      if (itemVal && typeof itemVal === 'object' && itemVal.toString) {
        itemVal = itemVal.toString();
      }
      if (!inList.includes(itemVal)) return false;
    } else {
      let itemVal = item[key];
      if (itemVal === undefined) {
        if (key === 'active') itemVal = true;
        else if (key === 'state') itemVal = 'ALL';
        else if (key === 'isEmergency') itemVal = false;
      }
      if (itemVal && typeof itemVal === 'object' && itemVal.toString) {
        itemVal = itemVal.toString();
      }
      let queryVal = val;
      if (queryVal && typeof queryVal === 'object' && queryVal.toString) {
        queryVal = queryVal.toString();
      }
      if (itemVal !== queryVal) {
        return false;
      }
    }
  }
  return true;
}

class MockQuery {
  constructor(data) {
    this.data = data;
  }
  lean() { return this; }
  select() { return this; }
  sort(sortOption) {
    if (sortOption && typeof sortOption === 'object') {
      let key = Object.keys(sortOption)[0];
      let order = sortOption[key]; // 1 or -1
      this.data.sort((a, b) => {
        if (a[key] === undefined) return 1;
        if (b[key] === undefined) return -1;
        if (a[key] < b[key]) return -1 * order;
        if (a[key] > b[key]) return 1 * order;
        return 0;
      });
    }
    return this;
  }
  skip(n) {
    this.data = this.data.slice(n);
    return this;
  }
  limit(n) {
    this.data = this.data.slice(0, n);
    return this;
  }
  then(onResolve, onReject) {
    return Promise.resolve(this.data).then(onResolve, onReject);
  }
}

class MockSingleQuery {
  constructor(doc) {
    this.doc = doc;
  }
  lean() { return this; }
  select() { return this; }
  then(onResolve, onReject) {
    return Promise.resolve(this.doc).then(onResolve, onReject);
  }
}

class MockDocument {
  constructor(data, modelName) {
    Object.assign(this, JSON.parse(JSON.stringify(data)));
    Object.defineProperty(this, '_modelName', { value: modelName, enumerable: false });
  }

  async save() {
    const data = readData(this._modelName);
    const index = data.findIndex(item => item._id === this._id);
    this.updatedAt = new Date().toISOString();
    
    // Copy properties to plain object to save
    const plainObj = { ...this };
    
    if (index >= 0) {
      data[index] = plainObj;
    } else {
      data.push(plainObj);
    }
    writeData(this._modelName, data);
    return this;
  }

  toObject() {
    return { ...this };
  }
}

function wrapDoc(data, modelName) {
  if (!data) return null;
  return new MockDocument(data, modelName);
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function patchModel(ModelClass, modelName) {
  ModelClass.find = function(query) {
    const all = readData(modelName);
    const filtered = all.filter(item => matchesQuery(item, query));
    const wrapped = filtered.map(item => wrapDoc(item, modelName));
    return new MockQuery(wrapped);
  };

  ModelClass.findOne = function(query) {
    const all = readData(modelName);
    const item = all.find(item => matchesQuery(item, query));
    return new MockSingleQuery(wrapDoc(item, modelName));
  };

  ModelClass.findById = function(id) {
    const all = readData(modelName);
    const item = all.find(item => item._id === id || item._id?.toString() === id?.toString());
    return new MockSingleQuery(wrapDoc(item, modelName));
  };

  ModelClass.create = async function(docData) {
    const all = readData(modelName);
    const now = new Date().toISOString();
    const newDoc = {
      _id: docData._id || generateId(),
      ...docData,
      createdAt: now,
      updatedAt: now,
    };
    all.push(newDoc);
    writeData(modelName, all);
    return wrapDoc(newDoc, modelName);
  };

  ModelClass.findByIdAndUpdate = async function(id, update, options) {
    const all = readData(modelName);
    const idx = all.findIndex(item => item._id === id || item._id?.toString() === id?.toString());
    if (idx === -1) return null;
    
    const existing = all[idx];
    let updated = { ...existing };
    
    if (update.$set) {
      Object.assign(updated, update.$set);
    } else {
      Object.assign(updated, update);
    }
    
    updated.updatedAt = new Date().toISOString();
    all[idx] = updated;
    writeData(modelName, all);
    return wrapDoc(updated, modelName);
  };

  ModelClass.findOneAndUpdate = async function(query, update, options) {
    const all = readData(modelName);
    const idx = all.findIndex(item => matchesQuery(item, query));
    if (idx === -1) {
      if (options && options.upsert) {
        const docData = update.$set || update;
        return ModelClass.create(docData);
      }
      return null;
    }
    
    const existing = all[idx];
    let updated = { ...existing };
    
    if (update.$set) {
      Object.assign(updated, update.$set);
    } else {
      Object.assign(updated, update);
    }
    
    updated.updatedAt = new Date().toISOString();
    all[idx] = updated;
    writeData(modelName, all);
    return wrapDoc(updated, modelName);
  };

  ModelClass.findOneAndDelete = async function(query) {
    const all = readData(modelName);
    const idx = all.findIndex(item => matchesQuery(item, query));
    if (idx === -1) return null;
    const deleted = all[idx];
    all.splice(idx, 1);
    writeData(modelName, all);
    return wrapDoc(deleted, modelName);
  };

  ModelClass.countDocuments = async function(query) {
    const all = readData(modelName);
    const filtered = all.filter(item => matchesQuery(item, query));
    return filtered.length;
  };

  ModelClass.insertMany = async function(docs) {
    const all = readData(modelName);
    const now = new Date().toISOString();
    const newDocs = docs.map(doc => ({
      _id: doc._id || generateId(),
      ...doc,
      createdAt: now,
      updatedAt: now,
    }));
    all.push(...newDocs);
    writeData(modelName, all);
    return newDocs.map(doc => wrapDoc(doc, modelName));
  };

  ModelClass.deleteMany = async function(query) {
    if (!query || Object.keys(query).length === 0) {
      writeData(modelName, []);
      return { deletedCount: 0 };
    }
    const all = readData(modelName);
    const kept = all.filter(item => !matchesQuery(item, query));
    writeData(modelName, kept);
    return { deletedCount: all.length - kept.length };
  };
}

export function setupMockMongoose(mongoose) {
  console.log('🔌 Injecting Mock Mongoose DB Adapter');

  // Mock connection methods
  mongoose.connect = async (uri, options) => {
    console.log(`\n✅ [Mock DB] Connected to local JSON DB at: ${DATA_DIR}\n`);
    mongoose.connection.readyState = 1;
    return {
      connection: {
        host: 'MockLocalhost',
        readyState: 1,
        connections: [{ readyState: 1 }],
      },
      connections: [{ readyState: 1 }]
    };
  };

  mongoose.disconnect = async () => {
    console.log('✅ [Mock DB] Disconnected');
    mongoose.connection.readyState = 0;
  };

  mongoose.connection = mongoose.connection || {};
  mongoose.connection.readyState = 1;
  mongoose.connection.host = 'MockLocalhost';

  // Override model generation
  const originalModel = mongoose.model;
  mongoose.model = function(name, schema) {
    const ModelClass = originalModel.apply(this, arguments);
    patchModel(ModelClass, name);
    return ModelClass;
  };

  // Patch existing models
  const existingModels = mongoose.modelNames ? mongoose.modelNames() : Object.keys(mongoose.models || {});
  for (const name of existingModels) {
    const ModelClass = originalModel.call(mongoose, name);
    patchModel(ModelClass, name);
  }
}
