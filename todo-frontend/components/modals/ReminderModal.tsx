import { User } from '@/types';

interface ReminderModalProps {
  category: string;
  allUsers: User[];
  currentUserId: number | null;
  selectedUserId: string;
  message: string;
  onUserSelect: (userId: string) => void;
  onMessageChange: (message: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export const ReminderModal = ({
  category,
  allUsers,
  currentUserId,
  selectedUserId,
  message,
  onUserSelect,
  onMessageChange,
  onConfirm,
  onClose
}: ReminderModalProps) => {
  return (
    <div
      id="reminderModal"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '25px',
          borderRadius: '10px',
          width: '400px',
          maxWidth: '90%'
        }}
      >
        <h3>Send reminder for "{category}"</h3>
        <select
          value={selectedUserId}
          onChange={(e) => onUserSelect(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '15px',
            borderRadius: '5px',
            border: '1px solid #ddd'
          }}
        >
          <option value="">Select a user</option>
          {allUsers
            .filter(u => u.id !== currentUserId)
            .map(u => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option>
            ))}
        </select>
        <textarea
          placeholder="Optional message"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '15px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            resize: 'vertical'
          }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '10px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Send
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              background: '#ccc',
              color: '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};