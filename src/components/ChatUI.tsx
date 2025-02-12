import React, { useState, useRef, useEffect } from 'react';
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
  const [messages, setMessages] = useState([
    { id: 1, sender: users[0], content: "大家好！", isAI: false },
    { id: 2, sender: users[4], content: "你好！", isAI: false },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingContent, setPendingContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingSpeed = 30;
  const currentMessageRef = useRef<number | null>(null);
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedContentRef = useRef(""); // 用于跟踪完整内容

  const abortController = new AbortController();

  const handleRemoveUser = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const typeWriter = (newContent: string, messageId: number) => {
    if (!newContent) return;
    
    setIsTyping(true);
    currentMessageRef.current = messageId;
    
    // 获取已显示的内容长度作为起始位置
    const startIndex = accumulatedContentRef.current.length;
    let currentIndex = startIndex;
    
    // 清除之前的打字效果
    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
    }
    
    typewriterRef.current = setInterval(() => {
      currentIndex++;
      
      setMessages(prev => {
        const newMessages = [...prev];
        const messageIndex = newMessages.findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
          newMessages[messageIndex] = {
            ...newMessages[messageIndex],
            content: newContent.slice(0, currentIndex)
          };
        }
        return newMessages;
      });

      if (currentIndex >= newContent.length) {
        if (typewriterRef.current) {
          clearInterval(typewriterRef.current);
        }
        setIsTyping(false);
        currentMessageRef.current = null;
        accumulatedContentRef.current = newContent; // 更新完整内容
      }
    }, typingSpeed);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: users[4],
      content: inputMessage,
      isAI: false
    };
    setMessages(prev => [...prev, userMessage]);
    
    const aiMessage = {
      id: messages.length + 2,
      sender: { id: 0, name: "AI助手" },
      content: "",
      isAI: true
    };
    setMessages(prev => [...prev, aiMessage]);
    
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法获取响应流');
      }

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        // 解码并添加到buffer
        buffer += decoder.decode(value, { stream: true });
        
        // 处理buffer中的完整SSE消息
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                // 使用函数式更新确保状态更新正确
                setMessages(prev => {
                  const newMessages = [...prev];
                  const aiMessageIndex = newMessages.findIndex(msg => msg.id === aiMessage.id);
                  if (aiMessageIndex !== -1) {
                    newMessages[aiMessageIndex] = {
                      ...newMessages[aiMessageIndex],
                      content: newMessages[aiMessageIndex].content + data.content
                    };
                  }
                  return newMessages;
                });

                // 滚动到底部
                setTimeout(() => {
                  const chatContainer = document.querySelector('.scroll-area-viewport');
                  if (chatContainer) {
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                  }
                }, 0);
              }
            } catch (e) {
              console.error('解析响应数据失败:', e);
            }
          }
        }
      }

      // 处理剩余的buffer
      if (buffer.length > 0 && buffer.startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.slice(6));
          if (data.content) {
            setMessages(prev => {
              const newMessages = [...prev];
              const aiMessageIndex = newMessages.findIndex(msg => msg.id === aiMessage.id);
              if (aiMessageIndex !== -1) {
                newMessages[aiMessageIndex] = {
                  ...newMessages[aiMessageIndex],
                  content: newMessages[aiMessageIndex].content + data.content
                };
              }
              return newMessages;
            });
          }
        } catch (e) {
          console.error('解析最终响应数据失败:', e);
        }
      }

    } catch (error) {
      console.error("发送消息失败:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessage.id 
          ? { ...msg, content: "错误: " + error.message, isError: true }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    abortController.abort();
  };

  // 清理打字机效果
  useEffect(() => {
    return () => {
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current);
      }
    };
  }, []);

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
            {messages.map((message) => (
              <div key={message.id} 
                className={`flex items-start gap-3 ${message.sender.name === "我" ? "justify-end" : ""}`}>
                {message.sender.name !== "我" && (
                  <Avatar>
                    <AvatarFallback style={{ backgroundColor: getAvatarData(message.sender.name).backgroundColor, color: 'white' }}>
                      {message.sender.name[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={message.sender.name === "我" ? "text-right" : ""}>
                  <div className="text-sm text-gray-500">{message.sender.name}</div>
                  <div className={`mt-1 p-3 rounded-lg shadow-sm ${
                    message.sender.name === "我" ? "bg-blue-500 text-white" : "bg-white"
                  }`}>
                    {message.content}
                    {message.isAI && isTyping && currentMessageRef.current === message.id && (
                      <span className="typing-indicator ml-1">▋</span>
                    )}
                  </div>
                </div>
                {message.sender.name === "我" && (
                  <Avatar>
                    <AvatarFallback style={{ backgroundColor: getAvatarData(message.sender.name).backgroundColor, color: 'white' }}>
                      {message.sender.name[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <Input 
              placeholder="输入消息..." 
              className="flex-1"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
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