import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import NotificationDropdown from "./NotificationDropdown";
import api from "../api";

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem("user"));

    const [notifications, setNotifications] = useState([]);
    const [localUnreadIds, setLocalUnreadIds] = useState([]); // store unread at bell-click time
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get(`/api/notification/user/${user.user_id}`);
            setNotifications(data);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleBellClick = async () => {
        // 1. Capture unread IDs BEFORE marking them as read in DB
        const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
        setLocalUnreadIds(unreadIds);

        // 2. Open dropdown
        setDropdownOpen(!dropdownOpen);

        // 3. Mark all as read in DB
        if (unreadIds.length > 0) {
            await api.patch(`/api/notification/user/${user.user_id}/read-all`);
            fetchNotifications(); // refresh but highlights stay because localUnreadIds remains
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await api.delete(`/api/notification/${id}`);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
            setUnreadCount((prev) => prev - 1);
        } catch (err) {
            console.error("Failed to delete notification", err);
        }
    };


    const handleLogout = () => {
        sessionStorage.removeItem("user");
        navigate("/");
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <h3><a href="/home" style={{ color: "black" }}>USOIMP</a></h3>
            </div>

            <div className="navbar-middle">
                <a href="/home" className="link-text" style={{ margin: "0 1rem" }}>Home</a>
                {user.user_type === "shop" && (<a href={`/${user.user_id}/analytics`} className="link-text" style={{ margin: "0 1rem" }}>Analytics</a>)}
            </div>

            <div className="navbar-right" style={{ display: "flex", alignItems: "center" }}>
                <NotificationDropdown
                    notifications={notifications}
                    unreadCount={unreadCount}
                    localUnreadIds={localUnreadIds}   // pass for highlight
                    open={dropdownOpen}
                    onBellClick={handleBellClick}
                    onDelete={handleDeleteNotification}
                />

                <h3>{user.email.split("@")[0]}</h3>
                <span className="link-text" onClick={handleLogout} style={{ marginLeft: "1rem", cursor: "pointer" }}>
                    Logout
                </span>
            </div>
        </nav>
    );
};

export default Navbar;
