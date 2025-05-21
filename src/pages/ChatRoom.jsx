import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { io } from 'socket.io-client';
import { motion } from 'framer-motion';

const socket = io(import.meta.env.VITE_SOCKET_SERVER_URL);

export default function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [editingId, setEditingId] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('edit message', (updated) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updated.id ? { ...msg, ...updated } : msg))
      );
    });

    socket.on('delete message', (id) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    });

    return () => {
      socket.off('chat message');
      socket.off('edit message');
      socket.off('delete message');
    };
  }, []);

  const handleLogin = () => {
    const name = email.split('@')[0];
    setNickname(name === 'jennifer.lu' ? 'hairlessness' : name);
  };

  const sendMessage = () => {
    if (input.trim() === '') return;
    if (editingId) {
      socket.emit('edit message', { id: editingId, content: input });
      setEditingId(null);
    } else {
      socket.emit('chat message', {
        id: Date.now().toString(),
        user: nickname,
        content: input,
        timestamp: new Date().toISOString(),
      });
    }
    setInput('');
  };

  const handleEdit = (id, content) => {
    setInput(content);
    setEditingId(id);
    inputRef.current.focus();
  };

  const handleDelete = (id) => {
    socket.emit('delete message', id);
  };

  if (!nickname) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center">
        <Input
          placeholder="输入学校邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-64 mb-4"
        />
        <Button onClick={handleLogin}>登录聊天室</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full p-4">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="rounded-2xl shadow p-3">
              <CardContent>
                <div className="flex justify-between">
                  <p className="font-bold text-sm">{msg.user}</p>
                  <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="mt-2 text-base">{msg.content}</p>
                {msg.user === nickname && (
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(msg.id, msg.content)}>
                      编辑
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(msg.id)}>
                      撤回
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Input
          ref={inputRef}
          placeholder="输入你的消息..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
        />
        <Button onClick={sendMessage}>{editingId ? '更新' : '发送'}</Button>
      </div>
    </div>
  );
}