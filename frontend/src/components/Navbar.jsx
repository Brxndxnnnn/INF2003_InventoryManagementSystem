import { useNavigate } from "react-router";

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(sessionStorage.getItem("user"));

    const handleLogout = () => {
        sessionStorage.removeItem("user");
        navigate("/");
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <h3 ><a href="/home" style={{color:"black"}}>USOIMP</a></h3>
            </div>

            <div className="navbar-middle">
                <a href="/home" className="link-text" style={{ margin: "0 1rem" }}>Home</a>
                <a href="#" className="link-text" style={{ margin: "0 1rem" }}>Orders</a>
                <a href="#" className="link-text" style={{ margin: "0 1rem" }}>etc 2</a>
            </div>

            <div className="navbar-right">
                <h3>{user.email.split("@")[0]}</h3>
                <span className="link-text" onClick={() => handleLogout()}>Logout</span>
            </div>
        </nav>
    )
}

export default Navbar