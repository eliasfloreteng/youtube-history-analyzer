// Cache service for storing and retrieving API responses

interface CacheOptions {
  expirationDays?: number
}

export class CacheService {
  private dbName: string
  private storeName: string
  private version: number

  constructor(dbName = "YouTubeHistoryCache", storeName = "apiResponses", version = 1) {
    this.dbName = dbName
    this.storeName = storeName
    this.version = version
  }

  // Initialize the database
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          // Create a store with videoId as key
          const store = db.createObjectStore(this.storeName, { keyPath: "id" })
          // Create an index for timestamp to enable expiration checks
          store.createIndex("timestamp", "timestamp", { unique: false })
        }
      }

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result)
      }

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error)
      }
    })
  }

  // Store video details in cache
  async cacheVideoDetails(videoId: string, details: any, options: CacheOptions = {}): Promise<void> {
    const db = await this.openDB()
    const transaction = db.transaction([this.storeName], "readwrite")
    const store = transaction.objectStore(this.storeName)

    const cacheItem = {
      id: videoId,
      details,
      timestamp: Date.now(),
      expiresAt: options.expirationDays ? Date.now() + options.expirationDays * 24 * 60 * 60 * 1000 : null,
    }

    return new Promise((resolve, reject) => {
      const request = store.put(cacheItem)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error)
      }

      transaction.oncomplete = () => {
        db.close()
      }
    })
  }

  // Store multiple video details in cache
  async cacheMultipleVideoDetails(videoDetailsMap: Record<string, any>, options: CacheOptions = {}): Promise<void> {
    const db = await this.openDB()
    const transaction = db.transaction([this.storeName], "readwrite")
    const store = transaction.objectStore(this.storeName)

    return new Promise((resolve, reject) => {
      for (const [videoId, details] of Object.entries(videoDetailsMap)) {
        const cacheItem = {
          id: videoId,
          details,
          timestamp: Date.now(),
          expiresAt: options.expirationDays ? Date.now() + options.expirationDays * 24 * 60 * 60 * 1000 : null,
        }

        store.put(cacheItem)
      }

      transaction.oncomplete = () => {
        db.close()
        resolve()
      }

      transaction.onerror = (event) => {
        reject((event.target as IDBTransaction).error)
      }
    })
  }

  // Get video details from cache
  async getVideoDetails(videoId: string): Promise<any | null> {
    const db = await this.openDB()
    const transaction = db.transaction([this.storeName], "readonly")
    const store = transaction.objectStore(this.storeName)

    return new Promise((resolve, reject) => {
      const request = store.get(videoId)

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result

        if (!result) {
          resolve(null)
          return
        }

        // Check if the cache item has expired
        if (result.expiresAt && result.expiresAt < Date.now()) {
          // Item has expired, return null
          resolve(null)
        } else {
          resolve(result.details)
        }
      }

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error)
      }

      transaction.oncomplete = () => {
        db.close()
      }
    })
  }

  // Get multiple video details from cache
  async getMultipleVideoDetails(videoIds: string[]): Promise<Record<string, any>> {
    const db = await this.openDB()
    const transaction = db.transaction([this.storeName], "readonly")
    const store = transaction.objectStore(this.storeName)
    const results: Record<string, any> = {}

    return new Promise((resolve, reject) => {
      let pendingRequests = videoIds.length

      if (pendingRequests === 0) {
        resolve(results)
        return
      }

      videoIds.forEach((videoId) => {
        const request = store.get(videoId)

        request.onsuccess = (event) => {
          const result = (event.target as IDBRequest).result

          if (result && (!result.expiresAt || result.expiresAt >= Date.now())) {
            results[videoId] = result.details
          }

          pendingRequests--
          if (pendingRequests === 0) {
            resolve(results)
          }
        }

        request.onerror = (event) => {
          pendingRequests--
          if (pendingRequests === 0) {
            resolve(results)
          }
        }
      })

      transaction.oncomplete = () => {
        db.close()
      }
    })
  }

  // Clear expired cache items
  async clearExpiredCache(): Promise<void> {
    const db = await this.openDB()
    const transaction = db.transaction([this.storeName], "readwrite")
    const store = transaction.objectStore(this.storeName)
    const index = store.index("timestamp")
    const now = Date.now()

    return new Promise((resolve, reject) => {
      const request = index.openCursor()

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue

        if (cursor) {
          const value = cursor.value

          if (value.expiresAt && value.expiresAt < now) {
            cursor.delete()
          }

          cursor.continue()
        }
      }

      transaction.oncomplete = () => {
        db.close()
        resolve()
      }

      transaction.onerror = (event) => {
        reject((event.target as IDBTransaction).error)
      }
    })
  }

  // Clear all cache
  async clearAllCache(): Promise<void> {
    const db = await this.openDB()
    const transaction = db.transaction([this.storeName], "readwrite")
    const store = transaction.objectStore(this.storeName)

    return new Promise((resolve, reject) => {
      const request = store.clear()

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = (event) => {
        reject((event.target as IDBRequest).error)
      }

      transaction.oncomplete = () => {
        db.close()
      }
    })
  }
}

// Create a singleton instance
export const cacheService = new CacheService()
