interface UserInfoBarProps {
  username: string;
  notificationCount: number;
  onNotificationClick: () => void;
  onLogout: () => void;
}

export const UserInfoBar = ({ 
  username, 
  notificationCount, 
  onNotificationClick, 
  onLogout 
}: UserInfoBarProps) => {
  return (
    <div id="userInfo">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '12px 20px', 
        background: '#f5f5f5' 
      }}>
        <p style={{ margin: 0 }}>
          Welcome, <strong>{username}</strong>
        </p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Notification button */}
          <button
            id="notificationBtn"
            onClick={onNotificationClick}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              position: 'relative'
            }}
          >
            🔔
            {notificationCount > 0 && (
              <span
                id="notificationBadge"
                style={{
                  display: 'block',
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '12px',
                  lineHeight: '20px'
                }}
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Logout button */}
          <button 
            onClick={onLogout} 
            style={{ 
              padding: '8px 12px', 
              cursor: 'pointer', 
              background: '#f44336', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px' 
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};