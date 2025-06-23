import { useContext, useState } from "react";
import { Navbar } from "../../Components/Navbar/Navbar";
import { UserContext } from "../../Context/UserContext";

const dummyBuses = [
    { id: 1, name: "Express Bus", image: "https://images-prod.gothamist.com/original_images/51968520227_d551c2351b_o.jpg" },
    { id: 2, name: "City Shuttle", image: "https://nypost.com/wp-content/uploads/sites/2/2018/09/180901-mta-bus-shuttle.jpg?quality=75&strip=all" },
    { id: 3, name: "Intercity Coach", image: "https://www.freeiconspng.com/uploads/bus-png-1.png" },
    { id: 4, name: "Luxury Liner", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDXhfsGrPfeEBtyhrvEXuXPgXQJm7tD_dvM_N5q8k_WlBuDJSq2FqI9UrWnu5KxkGM2vQ&usqp=CAU" },
];

export function Home() {
    const { user } = useContext(UserContext);
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? dummyBuses.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === dummyBuses.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="d-flex">
            <div style={{ width: "250px" }}>
                <Navbar />
            </div>
            <div style={{ maxWidth: 320, margin: "20px auto", textAlign: "center", position: "relative" }}>
                <h2>Available Buses</h2>
                <div style={{ position: "relative" }}>
                    <button
                        onClick={prevSlide}
                        style={{
                            position: "absolute",
                            left: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 1,
                            cursor: "pointer",
                        }}
                        aria-label="Previous Bus"
                    >
                        &#8592;
                    </button>
                    <img
                        src={dummyBuses[currentIndex].image}
                        alt={dummyBuses[currentIndex].name}
                        style={{ width: "100%", borderRadius: 8 }}
                    />
                    <button
                        onClick={nextSlide}
                        style={{
                            position: "absolute",
                            right: 0,
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 1,
                            cursor: "pointer",
                        }}
                        aria-label="Next Bus"
                    >
                        &#8594;
                    </button>
                </div>
                <p style={{ marginTop: 10, fontWeight: "bold" }}>{dummyBuses[currentIndex].name}</p>
            </div>
        </div>
    );
}