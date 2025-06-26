import { getAllCompanies, getSpecificBus, getSpecificCompanyBuses } from "../../Api/ApiCalls";
import { Navbar } from "../../Components/Navbar/Navbar";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";


function Review() {

    const [selectedSearchOption, setSelectedSearchOption] = useState("");
    const [searchedCompany, setSearchedCompany] = useState("");
    const [searchedLicense, setSearchedLicense] = useState("");
    const [loading, setLoading] = useState(false);
    const [allCompanies, setAllCompanies] = useState([]);
    const [hasCompaniesFetched, setHasCompaniesFetched] = useState(false);
    const [selectedCompanyBuses, setSelectedCompanyBuses] = useState([]);
    const [buses, setBuses] = useState([]);

    async function getLicensedBus(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await getSpecificBus(searchedLicense);
            if (response.status === 200) {
                toast.success("found the bus!");
            }
        } catch (e) {
            toast.error("License no is invalid!");
        } finally {
            setLoading(false);
        }
    }

    const handleCompanySelect = async (companyName) => {
        try {
            console.log("🔍 Selected company:", companyName);
            const response = await getSpecificCompanyBuses(companyName);
            setSelectedCompanyBuses(response.data);
            setBuses(response.data);
            console.log("✅ Received from backend:", response.data);
        } catch (error) {
            console.error("Error fetching bus data:", error);
        }
    };

    // Fetch once when "by company" is selected for the first time
    useEffect(() => {
        const fetchBus = async () => {
            if (selectedSearchOption === "by company" && !hasCompaniesFetched) {
                try {
                    const response = await getAllCompanies();
                    if (response.status === 200) {
                        setAllCompanies(response.data);
                        setHasCompaniesFetched(true);
                    }
                } catch (e) {
                    toast.error("Error in fetching the companies!");
                }
            }
        };
        fetchBus();
    }, [selectedSearchOption, hasCompaniesFetched]);

    return (
        <div className="d-flex">
            {/* Sidebar */}
            <div style={{ width: "250px" }}>
                <Navbar />
            </div>

            {/* main contents */}
            <div className="container">

                <div style={{
                    minHeight: "100vh",
                    backgroundColor: "#6C8EBF",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    paddingTop: "25px",
                }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
                        <h1
                            style={{
                                fontSize: "2.5rem",
                                fontWeight: "600",
                                color: "white",
                                textShadow: "1px 1px 3px rgba(0,0,0,0.3)",
                                marginBottom: "10px",
                            }}>
                            Bus Review
                        </h1>

                        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px" }}>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: "20px",
                                        marginTop: "40px",
                                    }}
                                >
                                    <label
                                        style={{
                                            fontWeight: "600",
                                            color: "#ffffff",
                                            fontSize: "1.1rem",
                                        }}
                                    >
                                        Select Bus:
                                    </label>

                                    {/* buttons */}
                                    {["by license no", "by company", "by buses travelled"].map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => setSelectedSearchOption(option)}
                                            style={{
                                                padding: "10px 20px",
                                                backgroundColor: selectedSearchOption === option ? "#004080" : "#ffffff",
                                                color: selectedSearchOption === option ? "#ffffff" : "#004080",
                                                border: "2px solid #004080",
                                                borderRadius: "8px",
                                                fontWeight: "600",
                                                cursor: "pointer",
                                            }}
                                        >
                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                {selectedSearchOption === "by license no" && (

                                    <form
                                        onSubmit={getLicensedBus}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            marginTop: "20px",
                                        }}>

                                        <input
                                            type="text"
                                            placeholder="Search by license no"
                                            value={searchedLicense}
                                            onChange={(e) => setSearchedLicense(e.target.value)}
                                            style={{
                                                padding: "10px",
                                                borderRadius: "6px",
                                                border: "1px solid #ccc",
                                                width: "250px",
                                            }}
                                        />

                                        <button type="submit"
                                            style={{
                                                padding: "10px 20px",
                                                backgroundColor: "#004080",
                                                color: "#ffffff",
                                                border: "none",
                                                borderRadius: "6px",
                                                fontWeight: "600",
                                                cursor: "pointer",
                                            }}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                        aria-hidden="true"
                                                    ></span>
                                                    Searching...
                                                </>
                                            ) : (
                                                "Search"
                                            )}
                                        </button>
                                    </form>

                                )}

                                {(selectedSearchOption === "by company") && (
                                    <select
                                        className="form-select form-select-sm"
                                        aria-label="Small select example"
                                        style={{
                                            padding: "10px",
                                            borderRadius: "6px",
                                            border: "1px solid #ccc",
                                            width: "250px",
                                            marginTop: "20px"
                                        }}
                                        defaultValue=""
                                        onChange={(e) => handleCompanySelect(e.target.value)}
                                    >
                                        <option value="" disabled>
                                            Select a bus company
                                        </option>
                                        {allCompanies.map((company, index) => (
                                            <option key={index} value={company}>
                                                {company}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>


                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            {buses.map((bus, index) => (
                                <div className="card mb-3">
                                    <img src="..." className="card-img-top" alt="..." />
                                    <div className="card-body">
                                        <h5 className="card-title">{bus.companyName}</h5>
                                        <p className="card-text">{bus.licenseNo}</p>
                                        <p className="card-text">
                                            <small className="text-body-secondary">
                                                {bus.stops.join(" → ")}
                                            </small></p>
                                    </div>
                                </div>
                            ))}


                        </div>

                    </div>
                </div>
            </div>
        </div >

    );
}

export default Review;