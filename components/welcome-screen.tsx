"use client";

import React, { useState } from 'react';
import { useScriptStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Film, FileText, Sparkles, Keyboard, Zap, Users, Clock, PenTool } from 'lucide-react';
import { toast } from 'sonner';

export const WelcomeScreen: React.FC = () => {
  const { createNewScript, loadScript } = useScriptStore();
  const [showNewScriptDialog, setShowNewScriptDialog] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

  const handleCreateScript = () => {
    if (!title.trim() || !author.trim()) {
      toast.error('Please enter both title and author');
      return;
    }
    
    createNewScript(title.trim(), author.trim());
    setShowNewScriptDialog(false);
    toast.success('New script created successfully!');
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Auto-Formatting',
      description: 'Industry-standard formatting applied automatically as you write'
    },
    {
      icon: <Keyboard className="w-6 h-6" />,
      title: 'Keyboard Shortcuts',
      description: 'Navigate with Tab, add characters with @, and more intuitive shortcuts'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Character Database',
      description: 'Automatic character tracking and intelligent autocomplete suggestions'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Real-time Pagination',
      description: 'Live page count following the 1 page = 1 minute screenplay rule'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-primary/10">
              <Film className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
              SkrinePlae
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Professional screenplay writing platform with intelligent auto-formatting, 
            distraction-free interface, and industry-standard tools.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Dialog open={showNewScriptDialog} onOpenChange={setShowNewScriptDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <PenTool className="w-5 h-5" />
                  Start Writing
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Screenplay</DialogTitle>
                  <DialogDescription>
                    Enter your screenplay details to get started
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter screenplay title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateScript()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      placeholder="Enter author name"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateScript()}
                    />
                  </div>
                  <Button onClick={handleCreateScript} className="w-full">
                    Create Screenplay
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="lg" className="gap-2">
              <FileText className="w-5 h-5" />
              Open Script
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-center mb-8">
            Everything you need for professional screenwriting
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="text-center">
                  <div className="mx-auto p-3 rounded-full bg-primary/10 text-primary w-fit mb-2">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Start Guide */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              Quick Start Guide
            </CardTitle>
            <CardDescription>
              Get up and running in seconds with our intelligent writing system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h4 className="font-medium">Create Your Script</h4>
                <p className="text-sm text-muted-foreground">
                  Click "Start Writing" and enter your screenplay title and author name
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h4 className="font-medium">Begin with FADE IN:</h4>
                <p className="text-sm text-muted-foreground">
                  Your script automatically starts with proper formatting
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h4 className="font-medium">Use Smart Elements</h4>
                <p className="text-sm text-muted-foreground">
                  Add scenes, characters, and dialogue with intelligent placeholders
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <h4 className="font-medium">Navigate with Keyboard</h4>
                <p className="text-sm text-muted-foreground">
                  Use Tab to move between elements and focus on your story
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};