import { AdminNavbar } from "./AdminNavbar";
import { GuestNavbar } from "./GuestNavbar";
import { UserNavbar } from "./UserNavbar";


export function Navbar(){
    const storedUser = sessionStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    return(
        <div>
            {
                !user ? 
                    <GuestNavbar/> 
                    :
                    <>
                        {
                            (user.role === 'ROLE_USER') ? 
                                <UserNavbar name={user.username}/>
                                :
                                <AdminNavbar name={user.username}/>
                        }
                    </>
                
            }
        </div>
    )
}