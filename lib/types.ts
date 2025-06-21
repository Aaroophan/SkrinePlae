export type ElementType = 
  | 'scene_heading'
  | 'action'
  | 'character'
  | 'dialogue'
  | 'parenthetical'
  | 'transition'
  | 'shot'
  | 'title_page'
  | 'fade_in';

export interface ScriptElement {
  id: string;
  type: ElementType;
  content: string;
  metadata?: {
    location?: string;
    timeOfDay?: 'DAY' | 'NIGHT' | 'MORNING' | 'EVENING' | 'CONTINUOUS';
    intExt?: 'INT.' | 'EXT.';
    character?: string;
  };
}

export interface Character {
  id: string;
  name: string;
  description?: string;
  appearances: number;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  intExt: 'INT.' | 'EXT.';
  usageCount: number;
}

export interface Script {
  id: string;
  title: string;
  author: string;
  basedOn?: string;
  contact?: string;
  elements: ScriptElement[];
  characters: Character[];
  locations: Location[];
  createdAt: Date;
  updatedAt: Date;
  pageCount: number;
}

export interface TitlePageData {
  title: string;
  author: string;
  basedOn?: string;
  contact?: string;
  draft?: string;
  date?: string;
}