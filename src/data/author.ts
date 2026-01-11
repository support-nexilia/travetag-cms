import { collections } from '@/lib/mongodb';
import type { Author, CreateAuthor, UpdateAuthor } from '@/entities/author';
import { ObjectId } from 'mongodb';

export async function getAllAuthors() {
  return await collections.authors
    .find({})
    .sort({ created_at: -1 })
    .toArray() as Author[];
}

export async function getAuthorById(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  return await collections.authors.findOne({ 
    _id: new ObjectId(id) 
  }) as Author | null;
}

export async function getAuthorByEmail(email: string) {
  return await collections.authors.findOne({ 
    email 
  }) as Author | null;
}

export async function createAuthor(data: CreateAuthor) {
  const now = new Date();
  const result = await collections.authors.insertOne({
    ...data,
    created_at: now,
    updated_at: now,
  });
  
  return await getAuthorById(result.insertedId.toString());
}

export async function updateAuthor(id: string, data: UpdateAuthor) {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  
  const result = await collections.authors.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { 
      $set: {
        ...data,
        updated_at: new Date(),
      }
    },
    { returnDocument: 'after' }
  );
  
  return result as Author | null;
}

export async function deleteAuthor(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  
  const result = await collections.authors.findOneAndDelete({ 
    _id: new ObjectId(id) 
  });
  
  return result as Author | null;
}

// Admin-only operations
export async function getAdmins() {
  return await collections.authors
    .find({ is_admin: true })
    .toArray() as Author[];
}

export async function getTourLeaders() {
  return await collections.authors
    .find({ is_tour_leader: true })
    .toArray() as Author[];
}
