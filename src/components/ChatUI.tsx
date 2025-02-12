import React, { useState } from 'react';
import { Send, Menu, MoreHorizontal, UserPlus, UserMinus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// 使用本地头像数据，避免外部依赖
const getAvatarData = (name: string) => {
  const colors = ['#1abc9c', '#3498db', '#9b59b6', '#f1c40f', '#e67e22'];
  const index = name.charCodeAt(0) % colors.length;
  return {
    backgroundColor: colors[index],
    text: name[0],
  };
};

const ChatUI = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "张三" },
    { id: 2, name: "李四" },
    { id: 3, name: "王五" },
    { id: 4, name: "赵六" },
    { id: 5, name: "我" },
  ]);
  const [showMembers, setShowMembers] = useState(false);

  const handleRemoveUser = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white p-4 shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Menu className="w-6 h-6" />
            <h1 className="text-xl font-bold">技术交流群</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Stacked Avatars */}
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {users.slice(0, 4).map((user) => {
                  const avatarData = getAvatarData(user.name);
                  return (
                    <TooltipProvider key={user.id}>
                      <Tooltip>
                        <TooltipTrigger>
                          <Avatar className="w-7 h-7 border-2 border-white">
                            <AvatarFallback style={{ backgroundColor: avatarData.backgroundColor, color: 'white' }}>
                              {avatarData.text}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{user.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
                {users.length > 4 && (
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs border-2 border-white">
                    +{users.length - 4}
                  </div>
                )}
              </div>
              <span className="ml-2 text-sm text-gray-500">
                {users.length} 人
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowMembers(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  管理成员
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Message 1 */}
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarFallback style={{ backgroundColor: getAvatarData(users[0].name).backgroundColor, color: 'white' }}>
                  {users[0].name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm text-gray-500">{users[0].name}</div>
                <div className="mt-1 bg-white p-3 rounded-lg shadow-sm">
                  大家好！
                </div>
              </div>
            </div>

            {/* Message 2 */}
            <div className="flex items-start gap-3 justify-end">
              <div className="text-right">
                <div className="text-sm text-gray-500">{users[4].name}</div>
                <div className="mt-1 bg-blue-500 text-white p-3 rounded-lg shadow-sm">
                  你好！
                </div>
              </div>
              <Avatar>
                <AvatarFallback style={{ backgroundColor: getAvatarData(users[4].name).backgroundColor, color: 'white' }}>
                  {users[4].name[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <Input 
              placeholder="输入消息..." 
              className="flex-1"
            />
            <Button>
              <Send className="w-4 h-4 mr-2" />
              发送
            </Button>
          </div>
        </div>
      </div>

      {/* Members Management Dialog */}
      <Dialog open={showMembers} onOpenChange={setShowMembers}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>群成员管理</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">当前成员（{users.length}）</span>
              <Button variant="outline" size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                添加成员
              </Button>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback style={{ backgroundColor: getAvatarData(user.name).backgroundColor, color: 'white' }}>
                          {user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                    {user.name !== "我" && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveUser(user.id)}
                      >
                        <UserMinus className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatUI;