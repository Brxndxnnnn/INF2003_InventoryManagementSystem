import { useState } from "react";

const NotificationDropdown = ({
  notifications,
  unreadCount,
  localUnreadIds = [],
  onDelete,
  open,
  onBellClick
}) => {
  return (
    <div style={{ position: "relative" }}>
      {/* Bell Icon */}
      <div
        style={{
          position: "relative",
          cursor: "pointer",
          fontSize: "22px",
          marginRight: "1rem",
        }}
        onClick={onBellClick}   // <-- handle logic in Navbar
      >
        🔔

        {/* Badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "10px",
              fontWeight: "bold",
              minWidth: "18px",
              textAlign: "center",
              lineHeight: "14px",
            }}
          >
            {unreadCount}
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: 0,
            width: "260px",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
            zIndex: 50,
            maxHeight: "300px",
            overflowY: "auto",
            padding: "10px",
          }}
        >
          {notifications.length === 0 ? (
            <p style={{ fontSize: "14px", color: "#555", textAlign: "center" }}>
              No notifications
            </p>
          ) : (
            notifications.map((n) => {
              const isNew = localUnreadIds.includes(n._id);

              return (
                <div
                  key={n._id}
                  style={{
                    padding: "8px",
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: isNew ? "#e8f3ff" : "white", // highlight new
                    borderLeft: isNew ? "3px solid dodgerblue" : "3px solid transparent",
                  }}
                >
                  <div style={{ width: "80%" }}>
                    <strong style={{ fontSize: "14px" }}>{n.message}</strong>

                    {/* NEW label */}
                    {isNew && (
                      <span
                        style={{
                          marginLeft: "6px",
                          background: "dodgerblue",
                          color: "white",
                          padding: "2px 4px",
                          borderRadius: "4px",
                          fontSize: "10px",
                        }}
                      >
                        NEW
                      </span>
                    )}

                    <div style={{ fontSize: "12px", color: "#888" }}>
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => onDelete(n._id)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#999",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    ✖
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
