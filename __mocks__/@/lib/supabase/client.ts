import { vi } from "vitest";

const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
    onAuthStateChange: vi.fn(() => ({ 
      data: { 
        subscription: { 
          unsubscribe: vi.fn() 
        } 
      } 
    })),
    signInWithPassword: vi.fn(async () => ({ data: null, error: null })),
    signOut: vi.fn(async () => ({ error: null })),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    then: vi.fn(async () => ({ data: [], error: null })),
  })),
};

export function createSupabaseClient() {
  return mockSupabaseClient;
}

export default mockSupabaseClient;
