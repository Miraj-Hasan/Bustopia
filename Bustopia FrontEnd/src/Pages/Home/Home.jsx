import { useContext, useState } from "react";
import { Navbar } from "../../Components/Navbar/Navbar";
import { UserContext } from "../../Context/UserContext";

const dummyBuses = [
    { id: 1, name: "Express Bus", image: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fstock.adobe.com%2Fsearch%3Fk%3Dbus&psig=AOvVaw2LG51SGyUTwBJHoZpYF1gh&ust=1750748793490000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCIi68-j9ho4DFQAAAAAdAAAAABAJ" },
    { id: 2, name: "City Shuttle", image: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fstock.adobe.com%2Fsearch%3Fk%3Dbus&psig=AOvVaw2LG51SGyUTwBJHoZpYF1gh&ust=1750748793490000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCIi68-j9ho4DFQAAAAAdAAAAABAT" },
    { id: 3, name: "Intercity Coach", image: "https://www.freepik.com/free-photo/traffic-vehicle-urban-reflections-city_1064229.htm#fromView=keyword&page=1&position=19&uuid=272a94a5-01a4-49fe-b575-8a9273427c91&query=Buses" },
    { id: 4, name: "Luxury Liner", image: "https://www.vecteezy.com/photo/27298467-bus-in-the-street" },
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
        <div>
            <Navbar />
            <div style={{ maxWidth: 320, margin: "20px auto", textAlign: "center", position: "relative" }}>
                <h2>Bus Carousel</h2>
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