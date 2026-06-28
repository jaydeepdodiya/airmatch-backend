function serializeDoc(doc) {
  if (!doc) return null;

  const obj = doc.toObject ? doc.toObject({ versionKey: false }) : { ...doc };
  delete obj._id;

  for (const key of ['createdAt', 'updatedAt', 'arrivalAt', 'expiresAt']) {
    if (obj[key] instanceof Date) {
      obj[key] = obj[key].toISOString();
    }
  }

  return obj;
}

module.exports = { serializeDoc };
