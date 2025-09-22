import React, { useState } from 'react';
import { MessageSquare, Phone, Users, Send, Mic, MicOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function Communication() {
  const [activeChat, setActiveChat] = useState('dispatch');
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const contacts = [
    { id: 'dispatch', name: 'Security Dispatch', status: 'online', unread: 2, type: 'group' },
    { id: 'supervisor', name: 'John Smith (Supervisor)', status: 'online', unread: 0, type: 'direct' },
    { id: 'guard-2', name: 'Mike Johnson', status: 'online', unread: 1, type: 'direct' },
    { id: 'guard-3', name: 'Sarah Wilson', status: 'offline', unread: 0, type: 'direct' },
    { id: 'emergency', name: 'Emergency Response', status: 'online', unread: 0, type: 'emergency' },
  ];

  const messages = {
    dispatch: [
      { id: 1, sender: 'Dispatch', message: 'All guards report status', time: '2:15 PM', type: 'received' },
      { id: 2, sender: 'You', message: 'Sector A clear, continuing patrol', time: '2:16 PM', type: 'sent' },
      { id: 3, sender: 'Mike Johnson', message: 'Sector B all good', time: '2:17 PM', type: 'received' },
    ],
    supervisor: [
      { id: 1, sender: 'John Smith', message: 'How is your shift going?', time: '1:30 PM', type: 'received' },
      { id: 2, sender: 'You', message: 'All good, completed 3 checkpoints so far', time: '1:35 PM', type: 'sent' },
    ]
  };

  const activeMessages = messages[activeChat as keyof typeof messages] || [];

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    // Handle message sending logic here
    setNewMessage('');
  };

  const startVoiceCall = (contactId: string) => {
    // Handle voice call logic
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="space-y-4">
          {/* Contacts List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {contacts.map((contact) => (
                <div 
                  key={contact.id}
                  onClick={() => setActiveChat(contact.id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-accent ${
                    activeChat === contact.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                      contact.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium truncate">{contact.name}</h3>
                      {contact.unread > 0 && (
                        <Badge className="bg-primary text-primary-foreground">
                          {contact.unread}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {contact.status === 'online' ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active Chat */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  {contacts.find(c => c.id === activeChat)?.name || 'Select a contact'}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => startVoiceCall(activeChat)}>
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Messages */}
              <div className="h-64 overflow-y-auto space-y-2 border rounded-lg p-3">
                {activeMessages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-2 rounded-lg text-sm ${
                      message.type === 'sent' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      {message.type === 'received' && (
                        <div className="text-xs opacity-70 mb-1">{message.sender}</div>
                      )}
                      <div>{message.message}</div>
                      <div className="text-xs opacity-70 mt-1">{message.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input 
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={toggleRecording}>
                  {isRecording ? (
                    <MicOff className="h-4 w-4 text-red-500" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                <Button size="sm" onClick={sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          {/* Voice Communication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Voice Communication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Call Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button className="h-16 flex flex-col items-center gap-1 bg-red-500 hover:bg-red-600">
                  <Phone className="h-6 w-6" />
                  <span className="text-xs">Emergency</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center gap-1">
                  <Phone className="h-6 w-6" />
                  <span className="text-xs">Dispatch</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center gap-1">
                  <Phone className="h-6 w-6" />
                  <span className="text-xs">Supervisor</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center gap-1">
                  <Users className="h-6 w-6" />
                  <span className="text-xs">All Guards</span>
                </Button>
              </div>

              {/* Voice Recording */}
              <Card>
                <CardContent className="p-4">
                  <div className="text-center space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {isRecording ? 'Recording voice message...' : 'Hold to record voice message'}
                    </div>
                    <Button 
                      size="lg"
                      className={`w-24 h-24 rounded-full ${
                        isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : ''
                      }`}
                      onMouseDown={() => setIsRecording(true)}
                      onMouseUp={() => setIsRecording(false)}
                      onTouchStart={() => setIsRecording(true)}
                      onTouchEnd={() => setIsRecording(false)}
                    >
                      <Mic className="h-8 w-8" />
                    </Button>
                    {isRecording && (
                      <div className="text-xs text-red-500">
                        Recording: 00:03
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Recent Calls */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Calls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { contact: 'Security Dispatch', time: '2:10 PM', duration: '2:34', type: 'incoming' },
                { contact: 'John Smith', time: '1:45 PM', duration: '1:12', type: 'outgoing' },
                { contact: 'Emergency Services', time: '12:30 PM', duration: '5:45', type: 'emergency' },
              ].map((call, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Phone className={`h-4 w-4 ${
                      call.type === 'emergency' ? 'text-red-500' :
                      call.type === 'incoming' ? 'text-green-500' : 'text-blue-500'
                    }`} />
                    <div>
                      <div className="font-medium">{call.contact}</div>
                      <div className="text-muted-foreground text-xs">{call.time}</div>
                    </div>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {call.duration}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}