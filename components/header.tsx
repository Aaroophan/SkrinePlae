"use client";

import React from 'react';
import { useScriptStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { 
  Film, 
  Moon, 
  Sun, 
  Settings, 
  Save, 
  Download,
  FileText,
  Users,
  MapPin
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export const Header: React.FC = () => {
  const { currentScript } = useScriptStore();
  const { theme, setTheme } = useTheme();

  return (
    <header className="border-b bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Film className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg">SkrinePlae</h1>
            {currentScript && (
              <p className="text-xs text-muted-foreground">
                {currentScript.title}
              </p>
            )}
          </div>
        </div>

        {/* Script Stats */}
        {currentScript && (
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>{currentScript.elements.length} elements</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <Badge variant="secondary" className="text-xs">
                {currentScript.characters.length} characters
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <Badge variant="secondary" className="text-xs">
                {currentScript.locations.length} locations
              </Badge>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {currentScript && (
            <>
              <Button variant="ghost" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FileText className="w-4 h-4 mr-2" />
                New Script
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="w-4 h-4 mr-2" />
                Import Script
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Preferences
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};