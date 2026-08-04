import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { FiSend, FiHash, FiMessageCircle, FiPlus } from 'react-icons/fi';
import './Chat.css';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Chat = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState('global');
  const [newRoomName, setNewRoomName] = useState('');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const isFirstLoad = useRef(true);

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/chat/rooms');
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  };

  const fetchMessages = async (room, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get(`/chat/${room}`);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    isFirstLoad.current = true;
    fetchMessages(activeRoom, false);

    const interval = setInterval(() => {
      fetchMessages(activeRoom, true);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeRoom]);

  useEffect(() => {
    if (isFirstLoad.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      isFirstLoad.current = false;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    const sentText = text;
    setText('');
    try {
      await api.post(`/chat/${activeRoom}`, { text: sentText });
      await fetchMessages(activeRoom, true);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to send message:', err);
      setText(sentText);
    } finally {
      setSending(false);
    }
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    const formatted = newRoomName.trim().toLowerCase().replace(/\s+/g, '-');
    if (!formatted) return;
    setActiveRoom(formatted);
    setNewRoomName('');
    setShowAddRoom(false);
  };

  const switchRoom = (room) => {
    setActiveRoom(room);
    setMessages([]);
    setLoading(true);
    isFirstLoad.current = true;
  };

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', marginBottom: 12 }}>
          <h3 className="chat-sidebar-title" style={{ margin: 0, padding: 0 }}>
            <FiMessageCircle size={16} /> Channels
          </h3>
          <button
            onClick={() => setShowAddRoom(!showAddRoom)}
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
            title="Create Channel"
          >
            <FiPlus size={16} />
          </button>
        </div>

        {showAddRoom && (
          <form onSubmit={handleCreateRoom} style={{ padding: '0 12px 12px' }}>
            <input
              type="text"
              placeholder="channel-name"
              value={newRoomName}
              onChange={e => setNewRoomName(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: 12,
                borderRadius: 6,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                outline: 'none'
              }}
            />
          </form>
        )}

        <div
          className={`chat-room-item${activeRoom === 'global' ? ' active' : ''}`}
          onClick={() => switchRoom('global')}
        >
          <FiHash size={15} />
          <span>Global Chat</span>
        </div>

        {rooms.filter(r => r.room !== 'global').map(r => (
          <div
            key={r.room}
            className={`chat-room-item${activeRoom === r.room ? ' active' : ''}`}
            onClick={() => switchRoom(r.room)}
          >
            <FiHash size={15} />
            <span>{r.room}</span>
          </div>
        ))}
      </div>

      <div className="chat-main">
        <div className="chat-main-header">
          <FiHash size={18} />
          <h3>{activeRoom === 'global' ? 'Global Chat' : `#${activeRoom}`}</h3>
        </div>

        <div className="chat-messages">
          {loading ? <Loader /> : (
            <>
              {messages.length === 0 && (
                <p className="chat-empty">No messages yet in #{activeRoom}. Be the first to start the conversation! 👋</p>
              )}
              {messages.map((msg) => {
                const isMe = msg.sender?._id === user?._id;
                return (
                  <div key={msg._id} className={`chat-message${isMe ? ' is-me' : ''}`}>
                    <div className="chat-avatar">
                      {msg.sender?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="chat-bubble">
                      <div className="chat-bubble-header">
                        <span className="chat-sender">{isMe ? 'You' : msg.sender?.name}</span>
                        <span className="chat-time">{formatTime(msg.createdAt)}</span>
                      </div>
                      <p className="chat-text">{msg.text}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <form className="chat-input-bar" onSubmit={handleSend}>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Message #${activeRoom === 'global' ? 'Global Chat' : activeRoom}...`}
            disabled={sending}
          />
          <button type="submit" disabled={!text.trim() || sending}>
            <FiSend size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
