"use client"

import { useCallback, useEffect, useState } from "react"

import {
  CONTACTS_STORAGE_KEY,
  cloneContacts,
  loadContactsFromStorage,
  saveContactsToStorage,
} from "@/lib/contacts"
import { initialConversations, type Conversation } from "@/lib/mock-data"

let contactsStoreSnapshot = cloneContacts(initialConversations)

export function useContactsStore() {
  const [contacts, setContactsState] = useState<Conversation[]>(() => contactsStoreSnapshot)
  const [hydrated, setHydrated] = useState(false)
  const [backendReady, setBackendReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const storedContacts = loadContactsFromStorage()
    contactsStoreSnapshot = cloneContacts(storedContacts)
    setContactsState(contactsStoreSnapshot)
    saveContactsToStorage(contactsStoreSnapshot)

    async function loadRemoteContacts() {
      try {
        const response = await fetch("/api/contacts", {
          credentials: "same-origin",
        })

        if (!response.ok) {
          throw new Error(`Contacts API returned ${response.status}`)
        }

        const remoteContacts = (await response.json()) as Conversation[]
        if (!Array.isArray(remoteContacts)) {
          throw new Error("Invalid contacts payload")
        }

        if (cancelled) {
          return
        }

        contactsStoreSnapshot = cloneContacts(remoteContacts)
        setContactsState(contactsStoreSnapshot)
        saveContactsToStorage(contactsStoreSnapshot)
        setBackendReady(true)
      } catch {
        if (!cancelled) {
          setBackendReady(false)
        }
      } finally {
        if (!cancelled) {
          setHydrated(true)
        }
      }
    }

    void loadRemoteContacts()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!hydrated) {
      return
    }

    saveContactsToStorage(contacts)
  }, [contacts, hydrated])

  useEffect(() => {
    if (!hydrated || !backendReady) {
      return
    }

    void fetch("/api/contacts", {
      method: "PUT",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contacts }),
    }).catch((error) => {
      console.warn("Failed to sync contacts to Supabase:", error)
    })
  }, [backendReady, contacts, hydrated])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== CONTACTS_STORAGE_KEY) {
        return
      }

      setContacts(loadContactsFromStorage())
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const setContacts = useCallback(
    (value: Conversation[] | ((current: Conversation[]) => Conversation[])) => {
      setContactsState((current) => {
        const nextContacts = typeof value === "function" ? value(current) : value
        contactsStoreSnapshot = cloneContacts(nextContacts)
        saveContactsToStorage(nextContacts)
        return nextContacts
      })
    },
    [],
  )

  return {
    contacts,
    hydrated,
    setContacts,
  }
}
