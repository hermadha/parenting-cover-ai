"use client";

import { useCallback, useEffect, useState } from "react";

export interface CoverEntry {
  id: string;
  title: string;
  image: string; // base64 data URL
  createdAt: number;
}

const DB_NAME = "parenting-cover-ai";
const STORE_NAME = "covers";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function useHistory() {
  const [history, setHistory] = useState<CoverEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load all entries on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.index("createdAt").getAll();
        req.onsuccess = () => {
          if (!cancelled) {
            // Sort newest first
            const items = (req.result as CoverEntry[]).sort(
              (a, b) => b.createdAt - a.createdAt
            );
            setHistory(items);
            setLoaded(true);
          }
        };
        req.onerror = () => {
          if (!cancelled) setLoaded(true);
        };
      } catch {
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addCover = useCallback(async (title: string, image: string) => {
    const entry: CoverEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      image,
      createdAt: Date.now(),
    };
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(entry);
      await new Promise<void>((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
      setHistory((prev) => [entry, ...prev]);
    } catch (err) {
      console.error("Failed to save cover:", err);
    }
  }, []);

  const removeCover = useCallback(async (id: string) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      await new Promise<void>((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
      setHistory((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Failed to delete cover:", err);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).clear();
      await new Promise<void>((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
      setHistory([]);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  }, []);

  return { history, loaded, addCover, removeCover, clearAll };
}
