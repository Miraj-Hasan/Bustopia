import { AdminNavbar } from "./AdminNavbar";
import { GuestNavbar } from "./GuestNavbar";
import { UserNavbar } from "./UserNavbar";
import { useState, useEffect } from "react";

export function Navbar({ user: userProp }) {
    const [user, setUser] = useState(userProp);

    useEffect(() => {
        if (typeof userProp === 'undefined') {
            try {
                const storedUser = sessionStorage.getItem("user");
                setUser(storedUser ? JSON.parse(storedUser) : null);
            } catch (error) {
                console.error("Error parsing user from session storage:", error);
                setUser(null);
            }
        } else {
            setUser(userProp);
        }
    }, [userProp]);

    return (
        <div>
            {
                !user ?
                    <GuestNavbar />
                    :
                    <>
                        {
                            (user.role === 'ROLE_USER') ?
                                <UserNavbar name={user.username} />
                                :
                                <AdminNavbar name={user.username} />
                        }
                    </>
            }
        </div>
    );
}