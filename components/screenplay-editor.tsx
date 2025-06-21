"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useScriptStore } from '@/lib/store';
import { ScriptElement, ElementType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Film, 
  Plus, 
  MessageSquare, 
  User, 
  MapPin,
  ArrowRight,
  Keyboard,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface ElementEditorProps {
  element: ScriptElement;
  index: number;
  isActive: boolean;
  onNext: () => void;
}

const ElementEditor: React.FC<ElementEditorProps> = ({ element, index, isActive, onNext }) => {
  const { updateElement, addCharacter, addLocation, currentScript } = useScriptStore();
  const [content, setContent] = useState(element.content);
  const [metadata, setMetadata] = useState(element.metadata || {});
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const handleContentChange = (value: string) => {
    setContent(value);
    updateElement(element.id, { content: value });
  };

  const handleMetadataChange = (key: string, value: any) => {
    const updatedMetadata = { ...metadata, [key]: value };
    setMetadata(updatedMetadata);
    updateElement(element.id, { metadata: updatedMetadata });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      onNext();
    }
    
    if (e.key === 'Enter' && element.type !== 'action') {
      e.preventDefault();
      onNext();
    }
  };

  const renderSceneHeading = () => (
    <div className="flex flex-wrap items-center gap-2 mb-2">
      <Select 
        value={metadata.intExt || 'INT.'} 
        onValueChange={(value) => handleMetadataChange('intExt', value)}
      >
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="INT.">INT.</SelectItem>
          <SelectItem value="EXT.">EXT.</SelectItem>
        </SelectContent>
      </Select>
      
      <Input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        placeholder="LOCATION"
        value={metadata.location || ''}
        onChange={(e) => {
          const location = e.target.value.toUpperCase();
          handleMetadataChange('location', location);
          if (location) {
            addLocation(location, metadata.intExt as 'INT.' | 'EXT.' || 'INT.');
          }
        }}
        onKeyDown={handleKeyDown}
        className="flex-1 font-mono text-sm uppercase"
      />
      
      <span className="text-muted-foreground">-</span>
      
      <Select 
        value={metadata.timeOfDay || 'DAY'} 
        onValueChange={(value) => handleMetadataChange('timeOfDay', value)}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="DAY">DAY</SelectItem>
          <SelectItem value="NIGHT">NIGHT</SelectItem>
          <SelectItem value="MORNING">MORNING</SelectItem>
          <SelectItem value="EVENING">EVENING</SelectItem>
          <SelectItem value="CONTINUOUS">CONTINUOUS</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const renderCharacterName = () => (
    <Input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      placeholder="CHARACTER NAME"
      value={content}
      onChange={(e) => {
        const charName = e.target.value.toUpperCase();
        handleContentChange(charName);
        if (charName) {
          addCharacter(charName);
        }
      }}
      onKeyDown={handleKeyDown}
      className="w-64 font-mono text-sm uppercase font-bold text-center"
    />
  );

  const renderDialogue = () => (
    <Textarea
      ref={inputRef as React.RefObject<HTMLTextAreaElement>}
      placeholder="Character dialogue..."
      value={content}
      onChange={(e) => handleContentChange(e.target.value)}
      onKeyDown={handleKeyDown}
      className="w-full max-w-md font-mono text-sm resize-none"
      rows={3}
    />
  );

  const renderAction = () => (
    <Textarea
      ref={inputRef as React.RefObject<HTMLTextAreaElement>}
      placeholder="Describe the action..."
      value={content}
      onChange={(e) => handleContentChange(e.target.value)}
      onKeyDown={handleKeyDown}
      className="w-full font-mono text-sm resize-none"
      rows={2}
    />
  );

  const getElementIcon = () => {
    switch (element.type) {
      case 'scene_heading': return <MapPin className="w-4 h-4" />;
      case 'character': return <User className="w-4 h-4" />;
      case 'dialogue': return <MessageSquare className="w-4 h-4" />;
      case 'action': return <Film className="w-4 h-4" />;
      default: return <Film className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn(
      "group relative p-4 rounded-lg transition-all duration-200",
      isActive ? "bg-primary/5 ring-2 ring-primary/20" : "hover:bg-muted/30"
    )}>
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {getElementIcon()}
          <span className="w-8 text-right">{index + 1}</span>
        </div>
        
        <div className="flex-1">
          {element.type === 'scene_heading' && renderSceneHeading()}
          {element.type === 'character' && renderCharacterName()}
          {element.type === 'dialogue' && renderDialogue()}
          {element.type === 'action' && renderAction()}
          {element.type === 'fade_in' && (
            <div className="font-mono text-sm font-bold">FADE IN:</div>
          )}
        </div>
      </div>
      
      {isActive && (
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-primary">
          <ArrowRight className="w-4 h-4 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export const ScreenplayEditor: React.FC = () => {
  const { currentScript, addElement, currentElementIndex, setCurrentElementIndex } = useScriptStore();
  const [showAddMenu, setShowAddMenu] = useState(false);

  if (!currentScript) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Film className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No script loaded</p>
        </div>
      </div>
    );
  }

  const handleAddElement = (type: ElementType) => {
    addElement({
      type,
      content: '',
      metadata: type === 'scene_heading' ? { intExt: 'INT.', timeOfDay: 'DAY' } : undefined,
    });
    setCurrentElementIndex(currentScript.elements.length);
    setShowAddMenu(false);
    toast.success(`Added ${type.replace('_', ' ')} element`);
  };

  const handleNext = () => {
    if (currentElementIndex < currentScript.elements.length - 1) {
      setCurrentElementIndex(currentElementIndex + 1);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">{currentScript.title}</h2>
          <span className="text-sm text-muted-foreground">by {currentScript.author}</span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>~{currentScript.elements.length} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Keyboard className="w-4 h-4" />
            <span>Tab to navigate</span>
          </div>
        </div>
      </div>

      {/* Script Elements */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-1">
          {currentScript.elements.map((element, index) => (
            <ElementEditor
              key={element.id}
              element={element}
              index={index}
              isActive={index === currentElementIndex}
              onNext={handleNext}
            />
          ))}
        </div>
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-6 right-6">
        <div className="relative">
          {showAddMenu && (
            <div className="absolute bottom-16 right-0 bg-background border rounded-lg shadow-lg p-2 space-y-1 min-w-48">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddElement('scene_heading')}
                className="w-full justify-start"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Scene Heading
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddElement('action')}
                className="w-full justify-start"
              >
                <Film className="w-4 h-4 mr-2" />
                Action
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddElement('character')}
                className="w-full justify-start"
              >
                <User className="w-4 h-4 mr-2" />
                Character
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddElement('dialogue')}
                className="w-full justify-start"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Dialogue
              </Button>
            </div>
          )}
          
          <Button
            size="lg"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className={cn(
              "w-6 h-6 transition-transform duration-200",
              showAddMenu && "rotate-45"
            )} />
          </Button>
        </div>
      </div>
    </div>
  );
};