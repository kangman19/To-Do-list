import { Reminder } from '@/types';

interface NotificationPanelProps {
  unreadReminders: Reminder[];
  onClose: () => void;
  onDismiss: (reminderId: number) => void;
}

export const NotificationPanel = ({ 
  unreadReminders, 
  onClose, 
  onDismiss 
}: NotificationPanelProps) => {
  return (
    <div
      id="notificationPanel"
      style={{
        position: 'fixed',
        top: '60px',
        right: '20px',
        width: '350px',
        maxHeight: '500px',
        overflowY: 'auto',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: 1000,
        padding: '15px'
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '15px' 
      }}>
        <h3 style={{ margin: 0 }}>Notifications</h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ✕
        </button>
      </div>

      {unreadReminders.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
          No new reminders
        </p>
      ) : (
        <div id="reminderList">
          {unreadReminders.map((reminder) => (
            <div
              key={reminder.id}
              style={{
                padding: '12px',
                marginBottom: '10px',
                background: '#f9f9f9',
                borderRadius: '6px',
                borderLeft: '4px solid #667eea'
              }}
            >
              <div style={{ marginBottom: '8px' }}>
                <strong>{reminder.senderUsername}</strong> sent you a reminder
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                Category: <strong>{reminder.category}</strong>
              </div>
              {reminder.message && (
                <div style={{ fontSize: '14px', marginBottom: '8px', fontStyle: 'italic' }}>
                  "{reminder.message}"
                </div>
              )}
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
                {new Date(reminder.createdAt).toLocaleString()}
              </div>
              <button
                onClick={() => onDismiss(reminder.id)}
                style={{
                  padding: '6px 12px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};