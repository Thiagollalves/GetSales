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

  useEffect(() => {
    const storedContacts = loadContactsFromStorage()
    const storedSignature = JSON.stringify(storedContacts)
    const snapshotSignature = JSON.stringify(contactsStoreSnapshot)

    if (storedSignature !== snapshotSignature) {
      contactsStoreSnapshot = cloneContacts(storedContacts)
      setContactsState(contactsStoreSnapshot)
    }

    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) {
      return
    }

    saveContactsToStorage(contacts)
  }, [contacts, hydrated])

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
