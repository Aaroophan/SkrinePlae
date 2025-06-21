"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Script, Character, Location, ScriptElement, TitlePageData } from './types';

interface ScriptStore {
  currentScript: Script | null;
  isEditing: boolean;
  currentElementIndex: number;
  titlePageData: TitlePageData;
  
  // Actions
  createNewScript: (title: string, author: string) => void;
  loadScript: (script: Script) => void;
  updateScript: (updates: Partial<Script>) => void;
  addElement: (element: Omit<ScriptElement, 'id'>) => void;
  updateElement: (id: string, updates: Partial<ScriptElement>) => void;
  removeElement: (id: string) => void;
  setCurrentElementIndex: (index: number) => void;
  
  // Character management
  addCharacter: (name: string) => Character;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  getCharacterByName: (name: string) => Character | undefined;
  
  // Location management
  addLocation: (name: string, intExt: 'INT.' | 'EXT.') => Location;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  getLocationByName: (name: string) => Location | undefined;
  
  // Title page
  updateTitlePage: (data: Partial<TitlePageData>) => void;
  
  // Utilities
  calculatePageCount: () => number;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useScriptStore = create<ScriptStore>()(
  persist(
    (set, get) => ({
      currentScript: null,
      isEditing: false,
      currentElementIndex: 0,
      titlePageData: {
        title: '',
        author: '',
      },

      createNewScript: (title: string, author: string) => {
        const newScript: Script = {
          id: generateId(),
          title,
          author,
          elements: [
            {
              id: generateId(),
              type: 'fade_in',
              content: 'FADE IN:',
            }
          ],
          characters: [],
          locations: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          pageCount: 1,
        };
        
        set({ 
          currentScript: newScript,
          titlePageData: { title, author },
          currentElementIndex: 0,
          isEditing: true 
        });
      },

      loadScript: (script: Script) => {
        set({ 
          currentScript: script,
          titlePageData: {
            title: script.title,
            author: script.author,
          },
          currentElementIndex: 0,
          isEditing: true 
        });
      },

      updateScript: (updates: Partial<Script>) => {
        const { currentScript } = get();
        if (!currentScript) return;
        
        const updatedScript = {
          ...currentScript,
          ...updates,
          updatedAt: new Date(),
        };
        
        set({ currentScript: updatedScript });
      },

      addElement: (element: Omit<ScriptElement, 'id'>) => {
        const { currentScript } = get();
        if (!currentScript) return;
        
        const newElement: ScriptElement = {
          ...element,
          id: generateId(),
        };
        
        const updatedElements = [...currentScript.elements, newElement];
        
        set({
          currentScript: {
            ...currentScript,
            elements: updatedElements,
            updatedAt: new Date(),
          }
        });
      },

      updateElement: (id: string, updates: Partial<ScriptElement>) => {
        const { currentScript } = get();
        if (!currentScript) return;
        
        const updatedElements = currentScript.elements.map(element =>
          element.id === id ? { ...element, ...updates } : element
        );
        
        set({
          currentScript: {
            ...currentScript,
            elements: updatedElements,
            updatedAt: new Date(),
          }
        });
      },

      removeElement: (id: string) => {
        const { currentScript } = get();
        if (!currentScript) return;
        
        const updatedElements = currentScript.elements.filter(element => element.id !== id);
        
        set({
          currentScript: {
            ...currentScript,
            elements: updatedElements,
            updatedAt: new Date(),
          }
        });
      },

      setCurrentElementIndex: (index: number) => {
        set({ currentElementIndex: index });
      },

      addCharacter: (name: string) => {
        const { currentScript } = get();
        if (!currentScript) return { id: '', name: '', appearances: 0 };
        
        const existingCharacter = currentScript.characters.find(c => 
          c.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingCharacter) {
          get().updateCharacter(existingCharacter.id, { 
            appearances: existingCharacter.appearances + 1 
          });
          return existingCharacter;
        }
        
        const newCharacter: Character = {
          id: generateId(),
          name: name.toUpperCase(),
          appearances: 1,
        };
        
        set({
          currentScript: {
            ...currentScript,
            characters: [...currentScript.characters, newCharacter],
            updatedAt: new Date(),
          }
        });
        
        return newCharacter;
      },

      updateCharacter: (id: string, updates: Partial<Character>) => {
        const { currentScript } = get();
        if (!currentScript) return;
        
        const updatedCharacters = currentScript.characters.map(character =>
          character.id === id ? { ...character, ...updates } : character
        );
        
        set({
          currentScript: {
            ...currentScript,
            characters: updatedCharacters,
            updatedAt: new Date(),
          }
        });
      },

      getCharacterByName: (name: string) => {
        const { currentScript } = get();
        if (!currentScript) return undefined;
        
        return currentScript.characters.find(c => 
          c.name.toLowerCase() === name.toLowerCase()
        );
      },

      addLocation: (name: string, intExt: 'INT.' | 'EXT.') => {
        const { currentScript } = get();
        if (!currentScript) return { id: '', name: '', intExt: 'INT.' as const, usageCount: 0 };
        
        const existingLocation = currentScript.locations.find(l => 
          l.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingLocation) {
          get().updateLocation(existingLocation.id, { 
            usageCount: existingLocation.usageCount + 1 
          });
          return existingLocation;
        }
        
        const newLocation: Location = {
          id: generateId(),
          name: name.toUpperCase(),
          intExt,
          usageCount: 1,
        };
        
        set({
          currentScript: {
            ...currentScript,
            locations: [...currentScript.locations, newLocation],
            updatedAt: new Date(),
          }
        });
        
        return newLocation;
      },

      updateLocation: (id: string, updates: Partial<Location>) => {
        const { currentScript } = get();
        if (!currentScript) return;
        
        const updatedLocations = currentScript.locations.map(location =>
          location.id === id ? { ...location, ...updates } : location
        );
        
        set({
          currentScript: {
            ...currentScript,
            locations: updatedLocations,
            updatedAt: new Date(),
          }
        });
      },

      getLocationByName: (name: string) => {
        const { currentScript } = get();
        if (!currentScript) return undefined;
        
        return currentScript.locations.find(l => 
          l.name.toLowerCase() === name.toLowerCase()
        );
      },

      updateTitlePage: (data: Partial<TitlePageData>) => {
        set(state => ({
          titlePageData: { ...state.titlePageData, ...data }
        }));
      },

      calculatePageCount: () => {
        const { currentScript } = get();
        if (!currentScript) return 0;
        
        // Rough calculation: 55 lines per page, average screenplay formatting
        const elementsPerPage = 55;
        const totalElements = currentScript.elements.length;
        return Math.max(1, Math.ceil(totalElements / elementsPerPage));
      },
    }),
    {
      name: 'skrineplae-storage',
      partialize: (state) => ({
        currentScript: state.currentScript,
        titlePageData: state.titlePageData,
      }),
    }
  )
);