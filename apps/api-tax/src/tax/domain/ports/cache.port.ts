export abstract class CachePort {
  abstract get<T>(key: string): Promise<T | null>
  abstract set<T>(key: string, value: T, ttlSeconds: number): Promise<void>
}
