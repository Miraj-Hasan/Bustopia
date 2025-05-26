import { useContext } from "react";
import { Navbar } from "../../Components/Navbar/Navbar";
import { UserContext } from "../../Context/UserContext";

export function Home(){
    const {user} = useContext(UserContext);
    return (
        <div>
            <Navbar />
        </div>
    )
}