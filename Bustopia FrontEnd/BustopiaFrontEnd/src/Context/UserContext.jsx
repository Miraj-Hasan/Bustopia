import { createContext, useState } from "react";


export const UserContext = createContext();

export function UserProvider({children}){
    const [userName , setUserName ] = useState("");
    const [role , setRole ] = useState("")

    return (
        <UserContext.Provider value={{userName , role , setUserName , setRole}}>
            {children}
        </UserContext.Provider>
    )
}